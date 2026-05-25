# Guia Rápido de Instalação e Execução

Com a nova arquitetura em Monorepo, o fluxo de inicialização do projeto abrange múltiplas camadas (Banco de Dados, Backend, Mobile e Firmware). Siga os passos abaixo para rodar todo o ecossistema "do zero" na sua máquina de desenvolvimento.

---

## 1. Subindo o Banco de Dados (MySQL)

Como o projeto agora conta com o Docker, você não precisa instalar o MySQL localmente.
1. Certifique-se de que o [Docker Desktop](https://www.docker.com/products/docker-desktop/) esteja instalado e aberto.
2. Abra o terminal na **raiz do projeto** (`C:\Users\Viktor\Área de Trabalho\DinaTech`).
3. Execute o comando:
   ```bash
   docker-compose up -d
   ```
Isso fará o download da imagem do MySQL e iniciará um servidor rodando na porta `3306` em background. O banco de dados chamado `dynatech_db` será criado automaticamente. *(Para parar o banco depois, basta rodar `docker-compose down`)*.

---

## 2. Rodando o Backend (API Java / Spring Boot)

O backend precisa se conectar ao banco de dados que acabou de ser iniciado pelo Docker.
1. Na sua IDE (IntelliJ IDEA, Eclipse ou VS Code), abra a pasta `apps/backend/` (antiga `dynamoApp-server-main`).
2. Vá até o arquivo de propriedades (`src/main/resources/application.properties` ou `.yml`) e certifique-se de que a conexão esteja apontando para o banco local:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/dynatech_db
   spring.datasource.username=root
   spring.datasource.password=root
   ```
3. Rode a aplicação (no IntelliJ, clique no botão "Play" na classe `DynamometerAppServerApplication.java`). A API subirá, geralmente na porta `8080`.

---

## 3. Preparando e Rodando o App Mobile (React + Capacitor)

O aplicativo Mobile agora fica isolado dentro de `apps/mobile/` e consome a biblioteca central do monorepo.
1. Abra um terminal na **raiz do projeto** (onde fica o novo `package.json`).
2. Instale todas as dependências globais e faça o "link" da pasta shared:
   ```bash
   npm install
   ```
3. Entre na pasta do mobile:
   ```bash
   cd apps/mobile
   ```

### Opção A: Rodar no Navegador (Desenvolvimento UI)
Para testar interfaces e fluxos rapidamente (lembrando que testes de Bluetooth **NÃO** funcionam no navegador):
```bash
npm run dev
```

### Opção B: Rodar no Celular (Android Studio)
Sempre que você alterar o código React e quiser testar no dispositivo físico:
1. Dentro de `apps/mobile`, rode o build e a sincronização do capacitor:
   ```bash
   npm run build:android
   ```
2. Abra o **Android Studio**. Clique em "Open" e selecione a pasta exata: `C:\Users\Viktor\Área de Trabalho\DinaTech\apps\mobile\android`.
3. Conecte seu celular via cabo USB (com depuração USB ativada).
4. No Android Studio, selecione o seu celular na barra superior e clique no botão verde de "Run" (▶). O app será instalado e aberto no seu dispositivo.

> [!TIP]
> Lembre-se de configurar a URL do backend (`BASE_URL` no seu arquivo `MeasurementApi.ts` ou `.env`) para apontar para o IP da sua máquina na mesma rede Wi-Fi, em vez de `localhost`, para que o celular consiga acessar a API Java!

---

## 4. Gravando o Firmware (ESP32)

O firmware agora possui suporte oficial ao **PlatformIO**.
1. Abra o **VS Code** e instale a extensão do "PlatformIO IDE".
2. No VS Code, vá em `File > Open Folder` e selecione a pasta: `C:\Users\Viktor\Área de Trabalho\DinaTech\firmware\esp32`.
3. Conecte o ESP32 via cabo USB.
4. Clique no ícone de "Seta para a direita" (→) ou "Upload" na barra inferior do PlatformIO. Ele irá instalar as bibliotecas do HX711 automaticamente, compilar e jogar o código para o ESP32!
*(Alternativamente, você pode abrir o `main.cpp` na Arduino IDE antiga, mas o PlatformIO é altamente recomendado nesta nova arquitetura).*
