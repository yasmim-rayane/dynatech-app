# Guia de Integração: ESP32 + React/Capacitor via BLE

Este guia explica como testar, compilar e utilizar os códigos gerados para conectar o ESP32 (Dinâmometro) ao aplicativo Mobile via Bluetooth Low Energy.

## 1. Bibliotecas Necessárias

### Para o ESP32 (Arduino IDE)
Na Arduino IDE, vá em *Sketch > Include Library > Manage Libraries...* e instale:
- **HX711 Arduino Library** por *Bogdan Necula*.

*Nota: A biblioteca BLE (`BLEDevice`, `BLEServer`, etc.) já é nativa do "ESP32 Arduino Core". Certifique-se de que a placa ESP32 (Dev Module) está selecionada em Tools -> Board.*

### Para o Aplicativo (Frontend React)
Na raiz do seu projeto frontend (onde está o `package.json`), execute:
```bash
npm install @capacitor-community/bluetooth-le
npx cap sync android
```

Para uso do hook, assegure-se que o React e TypeScript estejam configurados corretamente (o que já parece estar no seu repositório).

---

## 2. Fluxo BLE Explicado

1. **Descoberta (Scan):** O React utiliza o `BleService.ts` para procurar dispositivos que estejam divulgando (Advertising) o Serviço `4fafc201-1fb5-459e-8fcc-c5c9c331914b`.
2. **Conexão:** Ao encontrar o "Dynamometer_ESP32", o app conecta e se inscreve (Subscribe/Notify) nas características de *Result* e *Status*.
3. **Início da Medição:** Quando o usuário clica em "Medir", o hook envia o valor `"1"` para a característica de *Start*.
4. **Coleta de Dados:** O ESP32 intercepta esse valor, aciona um timer interno, zera a balança (Tare) e começa a registrar em memória apenas o maior peso detectado no período de exatos **5 segundos**. Durante esse tempo, a característica de status fica em `"1"`.
5. **Finalização:** Após 5 segundos, o ESP32 envia via BLE (Notify) o pico alcançado em formato de texto (ex: `"45.20"`). E volta o status para `"0"`.
6. **Ação no App:** O React recebe a notificação, atualiza o hook exibindo o valor ao usuário. O usuário então decide clicar no botão para Salvar, e a API (`MeasurementApi.ts`) envia os dados para o Java/MySQL.

---

## 3. Estrutura de Pastas Gerada

```text
/
├── esp32_firmware/
│   └── esp32_firmware.ino       <-- Código do microcontrolador (Abra com Arduino IDE)
├── src/
│   ├── services/
│   │   ├── ble/
│   │   │   ├── BleConfig.ts     <-- UUIDs compartilhados com o ESP32
│   │   │   └── BleService.ts    <-- Regra de negócio do BLE nativo (Capacitor)
│   │   └── api/
│   │       └── MeasurementApi.ts <-- Exemplo de chamada pro Backend Java
│   └── hooks/
│       └── useDynamometer.ts    <-- Hook React p/ consumir no seu Frontend já existente
└── docs/
    └── BLE_INTEGRATION_GUIDE.md <-- Este arquivo
```

---

## 4. Como Testar no Android

1. **Permissões no AndroidManifest:**
   O plugin do Capacitor já gerencia a maior parte, mas certifique-se de que o seu `android/app/src/main/AndroidManifest.xml` (gerado pelo Capacitor) possui as permissões necessárias para Bluetooth (se estiver usando Android 12+):
   ```xml
   <uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
   <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
   ```
2. **Hardware Real:**
   O Bluetooth **NÃO** funciona em emuladores do Android Studio. Você deve conectar o seu smartphone físico com um cabo USB e compilar diretamente para ele ou gerar um APK.
3. **Calibração do HX711:**
   No arquivo `esp32_firmware.ino`, preste atenção à variável `CALIBRATION_FACTOR`. O valor `420.0` é um exemplo. Para calibrar o seu, mude para um valor que, ao colocar um peso de 1kg em cima da célula de carga, a serial mostre exatamente `1.0`.
4. **App de Debug (Dica):**
   Baixe o aplicativo **nRF Connect** na Google Play Store. Ele permite que você se conecte ao ESP32 independentemente do seu aplicativo React. É excelente para validar se o firmware está anunciando o serviço e respondendo ao comando de "Start" antes de testar a interface gráfica!
