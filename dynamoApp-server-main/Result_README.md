###### **Result:**

###### endpoint | método HTTP | parâmetros entrada

###### "descrição do método"

{RETURN}





**all | GET | RequestParam String email**

"Retorna TODOS os resultados a partir do email"



\[

&#x20;   {

&#x20;       "examDate": "2026-05-13T01:15:48",

&#x20;       "id": 6,

&#x20;       "palmMaxD": 22.1,

&#x20;       "palmMaxE": 58.9,

&#x20;       "pinchMaxD1": 8.7,

&#x20;       "pinchMaxD2": 9.3,

&#x20;       "pinchMaxD3": 7.6,

&#x20;       "pinchMaxD4": 5.4,

&#x20;       "pinchMaxE1": 6.8,

&#x20;       "pinchMaxE2": 8.2,

&#x20;       "pinchMaxE3": 9.6,

&#x20;       "pinchMaxE4": 7.0

&#x20;   },

&#x20;   

&#x20;   ...

]



**/api/result/getLastX | GET | RequestParam String email, RequestParam int quantidade**

"Retorna os últimos X (x = quantidade) resultados do usuário com o email passado"



\[

&#x20;   {

&#x20;       "examDate": "2026-05-13T01:15:48",

&#x20;       "id": 6,

&#x20;       "palmMaxD": 22.1,

&#x20;       "palmMaxE": 58.9,

&#x20;       "pinchMaxD1": 8.7,

&#x20;       "pinchMaxD2": 9.3,

&#x20;       "pinchMaxD3": 7.6,

&#x20;       "pinchMaxD4": 5.4,

&#x20;       "pinchMaxE1": 6.8,

&#x20;       "pinchMaxE2": 8.2,

&#x20;       "pinchMaxE3": 9.6,

&#x20;       "pinchMaxE4": 7.0

&#x20;   },

&#x20;

&#x20;   ...

]



**/api/result/getDateRange | GET | RequestParam String email, RequestParam LocalDateTime d1, RequestParam LocalDateTime d1**

"Retorna os resultados, do mais recente para o mais antigo, do usuário com o email passado entre as datas e horas (incluindo elas) d1 e d2"



Ex de Request com os parâmetros: /api/result/getDateRange?email=mm@test3.com\&d1=2026-03-13T10:00:00\&d2=2026-05-13T01:07:27



\[

&#x20;   {

&#x20;       "examDate": "2026-05-13T01:07:27",

&#x20;       "id": 1,

&#x20;       "palmMaxD": 50.0,

&#x20;       "palmMaxE": 45.0,

&#x20;       "pinchMaxD1": null,

&#x20;       "pinchMaxD2": null,

&#x20;       "pinchMaxD3": null,

&#x20;       "pinchMaxD4": null,

&#x20;       "pinchMaxE1": null,

&#x20;       "pinchMaxE2": null,

&#x20;       "pinchMaxE3": null,

&#x20;       "pinchMaxE4": null

&#x20;   },

&#x20;   {

&#x20;       "examDate": "2026-04-13T10:00:00",

&#x20;       "id": 2,

&#x20;       "palmMaxD": 30.0,

&#x20;       "palmMaxE": 44.4,

&#x20;       "pinchMaxD1": 8.0,

&#x20;       "pinchMaxD2": 10.2,

&#x20;       "pinchMaxD3": 10.0,

&#x20;       "pinchMaxD4": 7.2,

&#x20;       "pinchMaxE1": 9.2,

&#x20;       "pinchMaxE2": 9.4,

&#x20;       "pinchMaxE3": 8.8,

&#x20;       "pinchMaxE4": 9.3

&#x20;   }

]





**/api/result/weeklyStats | GET | RequestParam String email, RequestParam int semanas**

"Retorna o count de exames e o avg e max de cada parâmetro do exame para o usuário especificado nas últimas X semanas (x = semanas)"



\[

&#x20;   {

&#x20;       "weekStart": "2026-05-11",

&#x20;       "weekEnd": "2026-05-17",

&#x20;       "avgPalmD": 40.3,

&#x20;       "avgPalmE": 42.8,

&#x20;       "avgPinchD1": 8.433333,

&#x20;       "avgPinchD2": 7.733333,

&#x20;       "avgPinchD3": 7.633333,

&#x20;       "avgPinchD4": 6.533333,

&#x20;       "avgPinchE1": 7.033333,

&#x20;       "avgPinchE2": 8.466667,

&#x20;       "avgPinchE3": 6.966667,

&#x20;       "avgPinchE4": 7.966667,

&#x20;       "count": 4,

&#x20;       "maxPalmD": 55.3,

&#x20;       "maxPalmE": 58.9,

&#x20;       "maxPinchD1": 9.5,

&#x20;       "maxPinchD2": 9.3,

&#x20;       "maxPinchD3": 8.9,

&#x20;       "maxPinchD4": 7.7,

&#x20;       "maxPinchE1": 9.0,

&#x20;       "maxPinchE2": 9.8,

&#x20;       "maxPinchE3": 9.6,

&#x20;       "maxPinchE4": 8.6

&#x20;   },

&#x20;   {

&#x20;       "weekStart": "2026-04-13",

&#x20;       "weekEnd": "2026-04-19",

&#x20;       "avgPalmD": 30.0,

&#x20;       "avgPalmE": 44.4,

&#x20;       "avgPinchD1": 8.0,

&#x20;       "avgPinchD2": 10.2,

&#x20;       "avgPinchD3": 10.0,

&#x20;       "avgPinchD4": 7.2,

&#x20;       "avgPinchE1": 9.2,

&#x20;       "avgPinchE2": 9.4,

&#x20;       "avgPinchE3": 8.8,

&#x20;       "avgPinchE4": 9.3,

&#x20;       "count": 1,

&#x20;       "maxPalmD": 30.0,

&#x20;       "maxPalmE": 44.4,

&#x20;       "maxPinchD1": 8.0,

&#x20;       "maxPinchD2": 10.2,

&#x20;       "maxPinchD3": 10.0,

&#x20;       "maxPinchD4": 7.2,

&#x20;       "maxPinchE1": 9.2,

&#x20;       "maxPinchE2": 9.4,

&#x20;       "maxPinchE3": 8.8,

&#x20;       "maxPinchE4": 9.3

&#x20;   }

]



**/api/result/monthlyStats | GET | RequestParam String email, RequestParam int meses**

"Retorna o count de exames e o avg e max de cada parâmetro do exame para o usuário especificado nos últimos X meses (x = meses)"



\[

&#x20;   {

&#x20;       "avgPalmD": 40.3,

&#x20;       "avgPalmE": 42.8,

&#x20;       "avgPinchD1": 8.433333,

&#x20;       "avgPinchD2": 7.733333,

&#x20;       "avgPinchD3": 7.633333,

&#x20;       "avgPinchD4": 6.533333,

&#x20;       "avgPinchE1": 7.033333,

&#x20;       "avgPinchE2": 8.466667,

&#x20;       "avgPinchE3": 6.966667,

&#x20;       "avgPinchE4": 7.966667,

&#x20;       "count": 4,

&#x20;       "maxPalmD": 55.3,

&#x20;       "maxPalmE": 58.9,

&#x20;       "maxPinchD1": 9.5,

&#x20;       "maxPinchD2": 9.3,

&#x20;       "maxPinchD3": 8.9,

&#x20;       "maxPinchD4": 7.7,

&#x20;       "maxPinchE1": 9.0,

&#x20;       "maxPinchE2": 9.8,

&#x20;       "maxPinchE3": 9.6,

&#x20;       "maxPinchE4": 8.6,

&#x20;       "month": 5,

&#x20;       "year": 2026

&#x20;   },

&#x20;   {

&#x20;       "avgPalmD": 30.0,

&#x20;       "avgPalmE": 44.4,

&#x20;       "avgPinchD1": 8.0,

&#x20;       "avgPinchD2": 10.2,

&#x20;       "avgPinchD3": 10.0,

&#x20;       "avgPinchD4": 7.2,

&#x20;       "avgPinchE1": 9.2,

&#x20;       "avgPinchE2": 9.4,

&#x20;       "avgPinchE3": 8.8,

&#x20;       "avgPinchE4": 9.3,

&#x20;       "count": 1,

&#x20;       "maxPalmD": 30.0,

&#x20;       "maxPalmE": 44.4,

&#x20;       "maxPinchD1": 8.0,

&#x20;       "maxPinchD2": 10.2,

&#x20;       "maxPinchD3": 10.0,

&#x20;       "maxPinchD4": 7.2,

&#x20;       "maxPinchE1": 9.2,

&#x20;       "maxPinchE2": 9.4,

&#x20;       "maxPinchE3": 8.8,

&#x20;       "maxPinchE4": 9.3,

&#x20;       "month": 4,

&#x20;       "year": 2026

&#x20;   }

]



**/api/result/create | POST | JSON -> Ex em Sequencia**



Ex do JSON enviado para a request:

{

&#x20;   "email":"mm@test4.com",

&#x20;   "palmMaxD": 52.1,

&#x20;   "palmMaxE": 43.56

}

Obs: -> Aqui o back aceita criação de resultados desde que 1 dos exames (palmar ou pinça) tenha sido completo em sua totalidade



Retorno obtido:

{

&#x20;   "examDate": "2026-05-13T23:48:41.3435699",

&#x20;   "id": 7,

&#x20;   "palmMaxD": 52.1,

&#x20;   "palmMaxE": 43.56,

&#x20;   "pinchMaxD1": null,

&#x20;   "pinchMaxD2": null,

&#x20;   "pinchMaxD3": null,

&#x20;   "pinchMaxD4": null,

&#x20;   "pinchMaxE1": null,

&#x20;   "pinchMaxE2": null,

&#x20;   "pinchMaxE3": null,

&#x20;   "pinchMaxE4": null

}



**/api/result/delete | DELETE | RequestParam Integer id**

"Delete um resultado a partir de seu id"



void -> retorna um Http status OK - 200 caso sucesso





