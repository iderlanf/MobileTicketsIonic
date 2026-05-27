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
    status VARCHAR(15) DEFAULT 'AGUARDANDO'
);