# DynaTech App 

> **Status:** Work in Progress (WIP)

Este é o repositório oficial do aplicativo **DynaTech**, um software mobile com foco em saúde e performance, projetado para se conectar a um dinamômetro digital via Bluetooth e coletar medições precisas de força de preensão palmar e pinça.

Este projeto está sendo desenvolvido como parte da disciplina de **Tópicos de Engenharia Biomédica**, correspondente ao 3º semestre do curso de **Engenharia da Computação**.

## Sobre o Projeto
O objetivo do DynaTech é fornecer uma interface moderna, rápida e intuitiva para a aquisição, visualização e acompanhamento de dados de força biomédica. O software foi pensado para proporcionar a melhor experiência de usabilidade, oferecendo acompanhamento de medições em tempo real, feedbacks táteis e sonoros, histórico de resultados e agendamento de lembretes de treino.

## Funcionalidades Atuais
Apesar de estar em fase de desenvolvimento contínuo, o aplicativo já conta com uma base sólida e diversas funcionalidades ativas:
- **App Android Nativo:** Desenvolvido inicialmente para web, mas empacotado nativamente para Android usando Capacitor.
- **Pareamento Bluetooth (BLE):** Interface pronta e plugin configurado para buscar e conectar-se ao hardware do dinamômetro.
- **Aquisição em Tempo Real:** Tela de medição interativa que simula a variação de força e registra picos de tensão.
- **Feedback Sensorial:** Uso dos motores de vibração do aparelho e síntese de frequências de áudio nativas para indicar conclusão de testes ou conexões bem-sucedidas.
- **Sistema de Lembretes:** Criação, edição e exclusão de lembretes de treinos/medições, perfeitamente integrados ao sistema de **Notificações Locais** nativas do Android (disparando alarmes no momento exato).
- **Acessibilidade Dinâmica:** O aplicativo detecta ativamente mudanças no Modo Escuro (Dark Mode) do sistema operacional e se adapta em tempo real.
- **Segurança e Validação:** Formulários de cadastro e perfil com validações de e-mail e regras de senhas fortes.

## Tecnologias Utilizadas

### Frontend (Mobile & Web)
- **Core:** React 18, TypeScript, Tailwind CSS (via `@tailwindcss/vite` e `tw-animate-css`).
- **Gerenciamento de Estado:** React Context API (para Autenticação, Notificações, Tema e Preferências).
- **Ícones e UI:** Lucide React.
- **Visualização de Dados:** Recharts (Gráficos do histórico de medições).
- **Exportação de Relatórios:** `jspdf` e `jspdf-autotable` para PDF; `xlsx` para planilhas.
- **Mobile Bridge:** Capacitor JS (v8) para acesso nativo.
- **Integrações Nativas (Plugins Capacitor):**
  - `@capacitor-community/bluetooth-le` (Comunicação BLE)
  - `@capacitor/local-notifications` (Sistema de Lembretes)
  - `@capacitor/haptics` (Feedback tátil)
  - `@capacitor/filesystem` & `@capacitor/share` (Salvar e compartilhar relatórios)
- **Áudio Nativo:** Web Audio API (Feedback sonoro dinâmico).
- **Build Tool:** Vite.

### Backend & API
- **Linguagem:** Java 25
- **Framework:** Spring Boot 4.x
- **Persistência de Dados:** Spring Data JPA
- **Segurança & Autenticação:** Spring Security Crypto
- **Email:** Spring Boot Starter Mail
- **Gerenciador de Dependências:** Maven

### Banco de Dados & Infraestrutura
- **Banco de Dados Relacional:** MySQL 8.0
- **Containerização:** Docker e Docker Compose

## Como Executar

### Pré-requisitos
- Node.js (para o Frontend)
- Java 25 (para o Backend)
- Maven (para o Backend)
- Docker e Docker Compose (para rodar o MySQL)
- Android Studio (para rodar o app no smartphone)

### 1. Subindo o Banco de Dados (MySQL)
No diretório raiz do projeto, execute:
```bash
docker-compose up -d
```
Isso iniciará um container MySQL rodando na porta `3306` com a base `dynatech_db`.

### 2. Rodando o Backend (API)
```bash
cd apps/backend
./mvnw spring-boot:run
```

### 3. Rodando o Frontend (Web / Ambiente de Testes)
```bash
cd apps/mobile

# Instale todas as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Rodando no Android
```bash
# Compile os arquivos otimizados e sincronize os plugins com o código Java/Kotlin do Android
npm run build:android
```
1. Abra o **Android Studio**.
2. Clique em *Open* e selecione a pasta `android/` que fica dentro deste repositório.
3. Conecte seu celular ao computador via USB (ou Wi-Fi).
4. Clique no botão verde **Run (▶️)** no topo do Android Studio.

## Autoria
Desenvolvido por **Yasmim Rayane** e **Marcelo Watanabe** para a disciplina de Tópicos de Engenharia Biomédica - Engenharia da Computação (3º Semestre).