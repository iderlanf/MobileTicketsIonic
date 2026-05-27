require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração com o MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Formata número com zero à esquerda
const pad = (num, size = 2) => String(num).padStart(size, '0');

// Gerar Senha
app.post('/api/gerar', async (req, res) => {
  const { tipo } = req.body; // SP, SG, SE
  if (!['SP', 'SG', 'SE'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de senha inválido.' });
  }

  try {
    const agora = new Date();
    const ano = pad(agora.getFullYear() % 100);
    const mes = pad(agora.getMonth() + 1);
    const dia = pad(agora.getDate());
    const dataHoje = `${agora.getFullYear()}-${mes}-${dia}`;

    // Busca a última sequência do dia para o tipo específico
    const [rows] = await pool.query(
      `SELECT MAX(sequencia) as ultima_seq FROM chamados 
       WHERE tipo = ? AND DATE(data_emissao) = ?`,
      [tipo, dataHoje]
    );

    const proximaSeq = (rows[0].ultima_seq || 0) + 1;
    const seqFormatada = pad(proximaSeq, 2);
    
    // Formato AAMMDD-PPSQ
    const codigo_senha = `${ano}${mes}${dia}-${tipo}${seqFormatada}`;

    const [result] = await pool.query(
      `INSERT INTO chamados (codigo_senha, tipo, sequencia, data_emissao, status) 
       VALUES (?, ?, ?, NOW(), 'AGUARDANDO')`,
      [codigo_senha, tipo, proximaSeq]
    );

    res.status(201).json({
      id: result.insertId,
      codigo_senha,
      tipo,
      sequencia: proximaSeq,
      status: 'AGUARDANDO'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar senha.' });
  }
});

// Chamar próxima senha
app.post('/api/chamar', async (req, res) => {
  const { guiche, ordemAtual } = req.body; // guiche e tipo inicial da tentativa

  // Define a fila a partir do tipo enviado
  const ordemRotativa = ['SP', 'SE', 'SG'];
  let indexInicial = ordemRotativa.indexOf(ordemAtual);
  if (indexInicial === -1) indexInicial = 0;

  try {
    // Loop de 3 tentativas para checar as 3 filas na ordem
    for (let i = 0; i < 3; i++) {
      const indiceFilaAtual = (indexInicial + i) % 3;
      const tipoParaTestar = ordemRotativa[indiceFilaAtual];

      const [fila] = await pool.query(
        `SELECT * FROM chamados 
         WHERE status = 'AGUARDANDO' AND tipo = ? 
         ORDER BY id ASC LIMIT 1`,
        [tipoParaTestar]
      );

      if (fila.length > 0) {
        const chamado = fila[0];

        // Atualiza para ATENDIDO
        await pool.query(
          `UPDATE chamados 
           SET status = 'ATENDIDO', guiche = ?, data_atendimento = NOW() 
           WHERE id = ?`,
          [guiche, chamado.id]
        );

        // Retorna o chamado e indica qual será o próximo tipo para a próxima vez
        const proximoIndexDefinitivo = (indiceFilaAtual + 1) % 3;
        const proximoTipoSugerido = ordemRotativa[proximoIndexDefinitivo];

        return res.json({ 
          ...chamado, 
          status: 'ATENDIDO', 
          guiche, 
          data_atendimento: new Date(),
          proximoTipoSugerido // Avisa o Ionic qual é o próximo da vez
        });
      }
    }

    // Se saiu do loop e não achou ninguém em nenuma categoria não tem mais senha
    return res.json(null);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao chamar próxima senha.' });
  }
});

// Últimas 5 senhas chamadas
app.get('/api/ultimas', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM chamados 
       WHERE status = 'ATENDIDO' 
       ORDER BY data_atendimento DESC LIMIT 5`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar painel.' });
  }
});

// Histórico
async function gerarDadosRelatorio(filtroDataSQL, params) {
  // Gerais
  const [[geral]] = await pool.query(
    `SELECT 
      COUNT(*) as totalEmitidas,
      SUM(CASE WHEN status = 'ATENDIDO' THEN 1 ELSE 0 END) as totalAtendidas
     FROM chamados WHERE ${filtroDataSQL}`,
    params
  );

  // Tempo Médio de Atendimento
  const [[tempo]] = await pool.query(
    `SELECT 
      ROUND(AVG(TIMESTAMPDIFF(MINUTE, data_emissao, data_atendimento)), 1) as tempoMedio
     FROM chamados 
     WHERE status = 'ATENDIDO' AND ${filtroDataSQL}`,
    params
  );

  // Por prioridade (Emitidas e Atendidas)
  const [porPrioridade] = await pool.query(
    `SELECT 
      t.tipo,
      COUNT(c.id) as emitidas,
      SUM(CASE WHEN c.status = 'ATENDIDO' THEN 1 ELSE 0 END) as atendidas
     FROM (SELECT 'SP' as tipo UNION SELECT 'SG' UNION SELECT 'SE') t
     LEFT JOIN chamados c ON t.tipo = c.tipo AND ${filtroDataSQL}
     GROUP BY t.tipo`,
    params
  );

  // 4. Relatório detalhado
  const [detalhes] = await pool.query(
    `SELECT codigo_senha, tipo, data_emissao, data_atendimento, guiche 
     FROM chamados 
     WHERE ${filtroDataSQL}
     ORDER BY data_emissao DESC`,
    params
  );

  return {
    totalEmitidas: geral.totalEmitidas || 0,
    totalAtendidas: geral.totalAtendidas || 0,
    tempoMedio: tempo.tempoMedio || 0,
    porPrioridade,
    detalhes
  };
}

// Relatório diário
app.get('/api/relatorio/diario', async (req, res) => {
  try {
    const dados = await gerarDadosRelatorio('DATE(data_emissao) = CURDATE()', []);
    res.json(dados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no relatório diário.' });
  }
});

// Relatório mensal
app.get('/api/relatorio/mensal', async (req, res) => {
  try {
    const dados = await gerarDadosRelatorio('MONTH(data_emissao) = MONTH(CURDATE()) AND YEAR(data_emissao) = YEAR(CURDATE())', []);
    res.json(dados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no relatório mensal.' });
  }
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});