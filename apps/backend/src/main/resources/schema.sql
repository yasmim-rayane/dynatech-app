CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(90) NOT NULL,
  `userName` VARCHAR(15) UNIQUE,
  `email` VARCHAR(45) NOT NULL UNIQUE,
  `password` VARCHAR(255),
  `dataNascimento` DATE NOT NULL,
  `peso` DECIMAL(5,2) NOT NULL,
  `genero` ENUM('m', 'f', 'ou', 'pn') NOT NULL,
  `altura` SMALLINT(3) NOT NULL,
  `maoDominante` ENUM('d','e','a') NOT NULL,
  `inativo` ENUM('s') NULL,
  `dataExclusao` DATETIME NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `results` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `palmMaxD` DECIMAL(5,2) NULL,
  `palmMaxE` DECIMAL(5,2) NULL,
  `pinchMaxD1` DECIMAL(5,2) NULL,
  `pinchMaxD2` DECIMAL(5,2) NULL,
  `pinchMaxD3` DECIMAL(5,2) NULL,
  `pinchMaxD4` DECIMAL(5,2) NULL,
  `pinchMaxE1` DECIMAL(5,2) NULL,
  `pinchMaxE2` DECIMAL(5,2) NULL,
  `pinchMaxE3` DECIMAL(5,2) NULL,
  `pinchMaxE4` DECIMAL(5,2) NULL,
  `examDate` DATETIME DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  CONSTRAINT `fk_users_results`
    FOREIGN KEY (`userId`)
    REFERENCES `users` (`id`)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    code        VARCHAR(6)   NOT NULL,
    expiresAt   DATETIME     NOT NULL
);

CREATE TABLE IF NOT EXISTS doctors (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(90)  NOT NULL,
    userName    VARCHAR(15)  NOT NULL UNIQUE,
    email       VARCHAR(45)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL
);

CREATE TABLE IF NOT EXISTS DoctorHasUser (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    idDoctor INT NOT NULL,
    idUser   INT NOT NULL,
    status   ENUM('s', 'n') NOT NULL DEFAULT 'n',
    FOREIGN KEY (idDoctor) REFERENCES doctors(id),
    FOREIGN KEY (idUser)   REFERENCES users(id)
    );

INSERT INTO users (name, userName, email, password, dataNascimento, peso, genero, altura, maoDominante, inativo, dataExclusao)
SELECT 'Usuario Teste', 'teste', 'teste@dynatech.com', '123456', '2000-01-01', 70.20, 'm', 170, 'd', NULL, NULL
    WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'teste@dynatech.com' OR userName = 'teste'
);

-- Fix for existing databases
ALTER TABLE users MODIFY password VARCHAR(255);
ALTER TABLE doctors MODIFY password VARCHAR(255);