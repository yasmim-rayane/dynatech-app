# DynaTech App 

> **Status:** 🚧 Work in Progress (WIP)

Este é o repositório oficial do aplicativo **DynaTech**, um software mobile com foco em saúde e performance, projetado para se conectar a um dinamômetro digital via Bluetooth e coletar medições precisas de força de preensão palmar e pinça.

Este projeto está sendo desenvolvido como parte da disciplina de **Tópicos de Engenharia Biomédica**, correspondente ao 3º semestre do curso de **Engenharia da Computação**.

## 📖 Sobre o Projeto
O objetivo do DynaTech é fornecer uma interface moderna, rápida e intuitiva para a aquisição, visualização e acompanhamento de dados de força biomédica. O software foi pensado para proporcionar a melhor experiência de usabilidade, oferecendo acompanhamento de medições em tempo real, feedbacks táteis e sonoros, histórico de resultados e agendamento de lembretes de treino.

## ✨ Funcionalidades Atuais
Apesar de estar em fase de desenvolvimento contínuo, o aplicativo já conta com uma base sólida e diversas funcionalidades ativas:
- **App Android Nativo:** Desenvolvido inicialmente para web, mas empacotado nativamente para Android usando Capacitor.
- **Pareamento Bluetooth (BLE):** Interface pronta e plugin configurado para buscar e conectar-se ao hardware do dinamômetro.
- **Aquisição em Tempo Real:** Tela de medição interativa que simula a variação de força e registra picos de tensão.
- **Feedback Sensorial:** Uso dos motores de vibração do aparelho e síntese de frequências de áudio nativas para indicar conclusão de testes ou conexões bem-sucedidas.
- **Sistema de Lembretes:** Criação, edição e exclusão de lembretes de treinos/medições, perfeitamente integrados ao sistema de **Notificações Locais** nativas do Android (disparando alarmes no momento exato).
- **Acessibilidade Dinâmica:** O aplicativo detecta ativamente mudanças no Modo Escuro (Dark Mode) do sistema operacional e se adapta em tempo real.
- **Segurança e Validação:** Formulários de cadastro e perfil com validações de e-mail e regras de senhas fortes.

## 🛠️ Tecnologias Utilizadas
- **Frontend Core:** React, TypeScript, Tailwind CSS.
- **Ícones e UI:** Lucide React, Shadcn/Radix UI (Adaptado).
- **Mobile Bridge:** Capacitor JS.
- **Integração com Hardware:**
  - `@capacitor/local-notifications`
  - `@capacitor/haptics`
  - `@capacitor-community/bluetooth-le`
- **Build Tool:** Vite

## 🚀 Como Executar

### Pré-requisitos
- Node.js
- Android Studio (para rodar no smartphone)

### Rodando na Web (Ambiente de Testes)
```bash
# 1. Instale todas as dependências
npm install

# 2. Inicie o servidor de desenvolvimento
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

## 👥 Autoria
Desenvolvido por **Yasmim Rayane** para a disciplina de Tópicos de Engenharia Biomédica - Engenharia da Computação (3º Semestre).
