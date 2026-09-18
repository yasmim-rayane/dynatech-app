###### **User:**

###### endpoint | método HTTP | parâmetros entrada

###### "descrição do método"

{RETURN}



\-------------------------------------



**/api/doctor/login | POST | RequestParam String email, RequestParam String password**

"Faz correspondência dos valores de email e password recebidos e no banco de dados"



void  -> Obs: esse método retorna diferente status Https para a request a depender da validade do login (ex: UNAUTHORIZED - 401, NOT\_FOUND - 404)



\----------------------------------------



**/api/doctor/create | POST | JSON->EXEMPLO EM SEQUENCIA**



Ex do JSON enviado para a request:

{

&#x20;   "name":"doctorTest2",

&#x20;   "userName":"dctst2",

&#x20;   "email":"test@test2.com",

&#x20;   "password":"123"

}



{método retorna cópia do usuário criado!}



\------------------------------------------



**/api/doctor | PATCH | RequestParam String email, JSON com parâmetros a serem alterados**

"Altera parâmetros do cadastro do médico especificado (exceção = password)"



Ex do JSON enviado para a request:

{

&#x20;   "name":"nomeRandom"

}



Obs: -> pode passar JSON só com os atributos que devem ser alterados!



Resposta:

{

&#x20;   "name":"nomeRandom",

&#x20;   "userName":"testeAlt"

&#x20;   "email":"test@test11.com"

}



\-------------------------------------------



**/api/doctor/users | GET | RequestParam String email**

"Retorna lista de pacientes associados ao médico com o email passado"



Obs: -> Só retorna os pacientes cujo status do vínculo com o médico em questão estiverem como 's'  (ativo)



Resposta:

\[

&#x20;   {

&#x20;       "altura": 170,

&#x20;       "dataExclusao": null,

&#x20;       "dataNascimento": "2000-01-01",

&#x20;       "email": "teste@dynatech.com",

&#x20;       "genero": "m",

&#x20;       "id": 1,

&#x20;       "inativo": null,

&#x20;       "maoDominante": "d",

&#x20;       "name": "Usuario Teste",

&#x20;       "peso": 70.2,

&#x20;       "username": "teste"

&#x20;   },

&#x20;   {

&#x20;       "altura": 156,

&#x20;       "dataExclusao": null,

&#x20;       "dataNascimento": "2001-07-04",

&#x20;       "email": "johndoe@example.com",

&#x20;       "genero": "m",

&#x20;       "id": 2,

&#x20;       "inativo": null,

&#x20;       "maoDominante": "a",

&#x20;       "name": "test2",

&#x20;       "peso": 40.0,

&#x20;       "username": "tst2"

&#x20;   }

]



\-------------------------------------------



**/api/doctor/doctors | GET | RequestParam String email**

"Retorna lista de médicos associados ao paciente com o email passado"



Obs: -> Só retorna os médicos cujo status do vínculo com o paciente em questão estiverem como 's'  (ativo)



Resposta:

\[

&#x20;   {

&#x20;       "doctorEmail": "test@test1.com",

&#x20;       "doctorName": "doctorTest1"

&#x20;   }

]



**---------------------------------------------**



**/api/doctor/toggleStatus | PATCH | RequestParam String doctorEmail, RequestParam String userEmail** 

"inverte o valor da coluna status no registro da associação de paciente e médico"



Ou seja: -> se o valor no banco estiver 's', vai para 'n'

&#x20;        -> se o valor no banco estiver 'n', vai para 's'



OBS: A associação de paciente e médico já é criada e salva com o status 's'



Resposta:

A resposta é o HTTP Status ou um json com mensagem de erro 



\------------------------------------------------



**/api/doctor/addUser | POST | RequestParam String doctorEmail, RequestParam String userEmail**

"Cria o vínculo/relacionamento entre o médico e usuário com os emails passados



Obs:

\-> Só cria o vínculo se o médico e usuário já existirem no banco e se o vínculo já não existe



Resposta:

A resposta é o HTTP Status ou um json com mensagem de erro









