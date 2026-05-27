# MobileTicketsIonic
Sistema Para Controle de Atendimento

MobileTicketsIonic

Sistema para controle e gerenciamento de chamados de atendimento em consultórios médicos. O projeto é desenvolvido em Ionic/Angular integrado via Capacitor, um servidor backend construído em Node.js conectado a um banco de dados MySQL.

Funcionalidades por Abas

Aba Gerar
Permite a emissão de senhas de atendimento divididas em três categorias: SP – Senha Prioritária, SG – Senha Geral e SE – Pegar Exames.
Cada senha gerada segue o modelo estruturado AAMMDD-PPSQ, onde:
AA: ano da emissão com 2 dígitos.
MM: mês da emissão com 2 dígitos.
DD: dia do mês com 2 dígitos.
PP: tipo da senha com 2 caracteres (SP, SG ou SE).
SQ: sequência numérica de 2 dígitos. A sequência reinicia diariamente do 01 para cada categoria.
Exemplo de Senha: 260526-SP01 (Primeira Senha Prioritária gerada no dia 26/05/2026).
Exibe um alerta de sucesso confirmando a emissão: "Senha Gerada com Sucesso! Sua senha é: "260526-SP01".

Aba Painel
Controle de Atendente: permite selecionar o guichê que estiver disponível e  será responsável pelo atendimento (Guichê 01, 02 ou 03). Ao clicar para próxima senha chamada emite um som de campainha.
Realiza a chamada das senhas seguindo estritamente a ordem definida: [SP] -> [SE|SG] -> [SP] -> [SE|SG]. Caso não haja senhas o sistema avisa ao usuário.
Painel Geral: destaque visual para a "Senha Atual" chamada e listagem cronológica das últimas 5 senhas atendidas com seus respectivos guichês.

Aba Histórico
Emite relatórios gerenciais consolidados diários e Mensais extraídos diretamente do banco de dados MySQL, apresentando: quantitativo geral de senhas emitidas e senhas atendidas. Quantitativo por prioridade emitidas e Atendidas.
Relatório detalhado: tabela contendo a numeração, tipo, data e hora da emissão, data e hora do atendimento e o guichê responsável. Campos de atendimento permanecem em branco caso a senha ainda esteja aguardando ou não foram atendidas.
Tempo Médio de Atendimento: cálculo dinâmico em minutos do tempo decorrido entre a emissão da senha e a sua respectiva chamada no guichê.


Estrutura do Banco de Dados MySQL
Execute o script SQL abaixo no seu ambiente MySQL Workbench para estruturar a tabela do sistema:

CREATE DATABASE mobile_tickets;
USE mobile_tickets;

CREATE TABLE chamados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_senha VARCHAR(20) NOT NULL UNIQUE,
    tipo VARCHAR(2) NOT NULL, -- SP, SG, SE
    sequencia INT NOT NULL,
    data_emissao DATETIME NOT NULL,
    data_atendimento DATETIME NULL,
    guiche INT NULL,
    status VARCHAR(15) DEFAULT 'AGUARDANDO' -- AGUARDANDO, ATENDIDO
);


Tecnologias Utilizadas

Frontend: Ionic Framework, Angular e TypeScript.
Backend: Node.js, Express, MySQL2 , Cors e Dotenv.
Banco de Dados: MySQL.


Como Executar o Projeto Localmente
Pré-requisitos: Node.js instalado, servidor MySQL ativo rodando localmente na porta padrão 3306.

1. Configurando e Rodando o Backend
Navegue até a pasta do backend:
../ticket-backend
Instale as dependências:
npm install
Crie ou configure o arquivo .env na raiz dessa pasta com suas credenciais do banco(ou tire o nome do arquivo ArquivoSemNome.env deixando apenas .env):
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASS=SUA_SENHA_DO_MYSQL_WORKBENCH
   DB_NAME=mobile_tickets

Inicie o servidor:
   node server.js

2. Configurando e Rodando o Frontend (Ionic)
Abra um novo terminal na pasta raiz do projeto MobileTicketsIonic.
Inicie a aplicação no navegador:
   ionic serve


Estrutura Principal de Arquivos

├── servidor
│   ├── ticket-backend/
│   │   ├── .env                  
│   │   ├── server.js             
│   │   └── package.json
│   └─ mobile_tickets.sql
│
│
├── MobileTicketsIonic/
│   ├── src/app/
│   │   ├── services/
│   │   │   └── ticket.service.ts  
│   │   ├── tab1/
│   │   ├── tab2/
│   │   ├── tab3/
│   │   └── tabs/
