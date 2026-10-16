###### **Result:**

###### endpoint | método HTTP | parâmetros entrada

###### "descrição do método"

{RETURN}





**/api/result/all | GET | RequestParam String email**

"Retorna TODOS os resultados a partir do email"



[

    {

        "examDate": "2026-05-13T01:15:48",

        "id": 6,

        "palmMaxD": 22.1,

        "palmMaxE": 58.9

    },

 

    ...

]



**/api/result/getLastX | GET | RequestParam String email, RequestParam int quantidade**

"Retorna os últimos X (x = quantidade) resultados do usuário com o email passado"



[

    {

        "examDate": "2026-05-13T01:15:48",

        "id": 6,

        "palmMaxD": 22.1,

        "palmMaxE": 58.9

    },

 

    ...

]



**/api/result/getDateRange | GET | RequestParam String email, RequestParam LocalDateTime d1, RequestParam LocalDateTime d1**

"Retorna os resultados, do mais recente para o mais antigo, do usuário com o email passado entre as datas e horas (incluindo elas) d1 e d2"



Ex de Request com os parâmetros: /api/result/getDateRange?email=mm@test3.com&d1=2026-03-13T10:00:00&d2=2026-05-13T01:07:27



[

    {

        "examDate": "2026-05-13T01:07:27",

        "id": 1,

        "palmMaxD": 50.0,

        "palmMaxE": 45.0

    },

    {

        "examDate": "2026-04-13T10:00:00",

        "id": 2,

        "palmMaxD": 30.0,

        "palmMaxE": 44.4

    }

]





**/api/result/weeklyStats | GET | RequestParam String email, RequestParam int semanas**

"Retorna o count de exames e o avg e max de cada parâmetro do exame para o usuário especificado nas últimas X semanas (x = semanas)"



[

    {

        "weekStart": "2026-05-11",

        "weekEnd": "2026-05-17",

        "avgPalmD": 40.3,

        "avgPalmE": 42.8,

        "count": 4,

        "maxPalmD": 55.3,

        "maxPalmE": 58.9

    },

    {

        "weekStart": "2026-04-13",

        "weekEnd": "2026-04-19",

        "avgPalmD": 30.0,

        "avgPalmE": 44.4,

        "count": 1,

        "maxPalmD": 30.0,

        "maxPalmE": 44.4

    }

]



**/api/result/monthlyStats | GET | RequestParam String email, RequestParam int meses**

"Retorna o count de exames e o avg e max de cada parâmetro do exame para o usuário especificado nos últimos X meses (x = meses)"



[

    {

        "avgPalmD": 40.3,

        "avgPalmE": 42.8,

        "count": 4,

        "maxPalmD": 55.3,

        "maxPalmE": 58.9,

        "month": 5,

        "year": 2026

    },

    {

        "avgPalmD": 30.0,

        "avgPalmE": 44.4,

        "count": 1,

        "maxPalmD": 30.0,

        "maxPalmE": 44.4,

        "month": 4,

        "year": 2026

    }

]



**/api/result/create | POST | JSON -> Ex em Sequencia**



Ex do JSON enviado para a request:

{

    "email":"mm@test4.com",

    "palmMaxD": 52.1,

    "palmMaxE": 43.56

}

Obs: -> O salvamento pode ser de um só ou alguns campo(s) também
-> As medidas que não foram obtidas e não serão salvas podem ser deixadas como null (omitidas no JSON) ou 0



Retorno obtido:

{

    "examDate": "2026-05-13T23:48:41.3435699",

    "id": 7,

    "palmMaxD": 52.1,

    "palmMaxE": 43.56

}



**/api/result/delete | DELETE | RequestParam Integer id**

"Delete um resultado a partir de seu id"



void -> retorna um Http status OK - 200 caso sucesso



-----------------------------------



**/api/result/consolidate | POST | RequestParam String email**

"Faz a seguinte operação no banco: Todos os registros do dia atual são substituídos por 1 registro com os valores médios de cada medida"



Resposta: é retornado o JSON do registro com as medidas médias

{

    "examDate": "2026-05-31T19:27:20.383309568",

    "id": 9,

    "palmMaxD": 50.866666666666674,

    "palmMaxE": 71.6

}
