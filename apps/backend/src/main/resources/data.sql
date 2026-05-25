INSERT INTO users (name, userName, email, password, dataNascimento, peso, genero, altura, maoDominante, inativo, dataExclusao)
SELECT 'Usuario Teste', 'teste', 'teste@dynatech.com', '123456', '2000-01-01', 70.20, 'm', 170, 'd', NULL, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'teste@dynatech.com' OR userName = 'teste'
);
