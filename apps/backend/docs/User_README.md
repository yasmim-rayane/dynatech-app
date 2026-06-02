###### **User:**

###### endpoint | método HTTP | parâmetros entrada

###### "descrição do método"

{RETURN}





**/api/user | GET | RequestParam String email**

"retorna o usuário a partir do email"



**HttpStaus = OK**

{

&#x20;   "altura": 156,

&#x20;   "dataExclusao": "2026-05-04T20:01:47",

&#x20;   "dataNascimento": "2002-08-10",

&#x20;   "email": "mm@test3.com",

&#x20;   "genero": "m",

&#x20;   "id": 3,

&#x20;   "inativo": "s",

&#x20;   "maoDominante": "d",

&#x20;   "name": "test3",

&#x20;   "peso": 58.98,

&#x20;   "username": "tstNick3"

}



**/api/user/login | POST | RequestParam String email, RequestParam String password**

"Faz correspondência dos valores de email e password recebidos e no banco de dados"



void  -> Obs: esse método retorna diferente status Https para a request a depender da validade do login (ex: UNAUTHORIZED - 401, NOT\_FOUND - 404)



**/api/user/create | POST | JSON->EXEMPLO EM SEQUENCIA**



Ex do JSON enviado para a request:

{

&#x20;   "name":"test4",

&#x20;   "username": "tst4",

&#x20;   "dataNascimento":"2005-08-12",

&#x20;   "email": "mm@test4.com",

&#x20;   "password": "password123",

&#x20;   "peso":58.85,

&#x20;   "altura":156,

&#x20;   "genero": "m",

&#x20;   "maoDominante":"e"

}



Obs: -> "genero" pode ser: 'm', 'f', 'ou', 'pn'

\-> "maoDominante" pode ser: 'd','e'



{método retorna cópia do usuário criado!}



**/api/user/deactivateAcc | PATCH | RequestParam String email**

"muda status do cadastro do usuário"

{

&#x20;   "altura": 156,

&#x20;   "dataExclusao": "2026-05-13T23:04:23.0440045",

&#x20;   "dataNascimento": "2005-08-12",

&#x20;   "email": "mm@test4.com",

&#x20;   "genero": "m",

&#x20;   "id": 6,

&#x20;   "inativo": "s",

&#x20;   "maoDominante": "e",

&#x20;   "name": "test4",

&#x20;   "peso": 58.85,

&#x20;   "username": "tst4"

}



**/api/user/updateUserInfo | PATCH | RequestParam String email, JSON com parâmetros a serem alterados**

"Altera parâmetros do cadastro do usuário especificado (exceção = password, inativo, dataExclusao)"



Ex do JSON enviado para a request:

{

&#x20;   "name":"nomeRandom",

&#x20;   "username": "userSorteado"

}



Obs: -> pode passar JSON só com os atributos que devem ser alterados!



Resposta:

{

&#x20;   "altura": 180,

&#x20;   "dataExclusao": null,

&#x20;   "dataNascimento": "2004-04-25",

&#x20;   "email": "mm@test1.com",

&#x20;   "genero": "m",

&#x20;   "id": 1,

&#x20;   "inativo": null,

&#x20;   "maoDominante": "d",

&#x20;   "name": "nomeRandom",

&#x20;   "peso": 70.2,

&#x20;   "username": "userSorteado"

}

