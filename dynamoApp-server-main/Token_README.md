###### **Token:**

###### endpoint | método HTTP | parâmetros entrada

###### "descrição do método"

{RETURN}





**/api/token/sendCode | POST | RequestParam String email**

"Manda token para o email especificado"



Obs: -> O email já deve existir entre os cadastros de usuário



void -> é retornado OK - 200 se sucesso



**/api/token/validateCode | POST | RequestParam String email, RequestParam String code**

"Faz correspondência entre o token fornecido para o referido email com as infos correspondentes existentes no banco"



void -> é retornado OK - 200 se sucesso ou UNAUTHORIZED - 401 se o token não foi encontrado p/ o email fornecido ou não bate



**/api/token**/**resetPassword | POST | RequestParam String email, RequestParam String code, RequestParam String newPassword**

"Permite alterar a senha se o token fornecido e enviado para o email fornecido batem"



void -> retorna http status OK - 200 se sucesso

