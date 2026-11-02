#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include "HX711.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

// ==========================================
// CONFIGURAÇÕES DO DISPLAY OLED (SH1106 128x64, I2C)
// ==========================================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
#define OLED_SDA 21
#define OLED_SCL 22
#define OLED_WHITE SH110X_WHITE
Adafruit_SH1106G display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ==========================================
// CONFIGURAÇÕES DOS LEDS
// ==========================================
#define LED1_PIN 18 // LED 1: status Bluetooth (pisca lento = aguardando pareamento, fixo = pareado)
#define LED2_PIN 19 // LED 2: aceso fixo durante a medição
const unsigned long LED1_BLINK_INTERVAL_MS = 1000; // Meio período do pisca lento (1s aceso / 1s apagado)
unsigned long led1LastToggle = 0;
bool led1BlinkState = false;

// ==========================================
// CONFIGURAÇÕES DE PINOS DO HX711
// ==========================================
const int HX711_DOUT = 15; // Pino de dados (DT) do HX711
const int HX711_SCK = 16;  // Pino de clock do HX711

// ==========================================
// CONFIGURAÇÕES DO BOTÃO FÍSICO
// ==========================================
#define BUTTON_PIN 17 // Pino para o botão de início da medição

HX711 scale;

// Valor de calibração (fator de escala). 
// Como um aperto retorna ~350.000 sem escala, dividindo por 10000 teremos ~35kg.
// Para calibrar com exatidão: coloque um peso conhecido de 1kg e ajuste o fator até a leitura ser 1.0.
float CALIBRATION_FACTOR = 10000.0; 

// ==========================================
// CONFIGURAÇÕES BLE
// ==========================================
// Gere novos UUIDs se desejar, mas mantenha sincronizado com o frontend.
#define SERVICE_UUID           "4fafc201-1fb5-459e-8fcc-c5c9c331914b" // Serviço Principal
#define CHAR_START_UUID        "beb5483e-36e1-4688-b7f5-ea07361b26a8" // Para o app enviar comando de START
#define CHAR_RESULT_UUID       "8a21136d-14a9-4672-886b-56832db7d519" // Para o ESP32 notificar o pico máximo
#define CHAR_STATUS_UUID       "f24b2f29-2d3b-4ab2-8e3d-71b315264b97" // Para o ESP32 notificar status (0=Idle, 1=Measuring)
#define CHAR_LIVE_UUID         "b2a1a8c3-f6d2-43d9-93b5-3d5f1d48ab11" // Para envio contínuo em tempo real

BLEServer* pServer = NULL;
BLECharacteristic* pCharResult = NULL;
BLECharacteristic* pCharStatus = NULL;
BLECharacteristic* pCharLive = NULL;
volatile bool deviceConnected = false;

// ==========================================
// VARIÁVEIS DE CONTROLE DA MEDIÇÃO
// ==========================================
volatile bool isMeasuring = false;
unsigned long measurementStartTime = 0;
unsigned long lastLiveUpdate = 0;
const unsigned long MEASUREMENT_DURATION_MS = 5000; // 5 segundos
float maxForceDetected = 0.0;

// Variáveis para controle do display
bool showPeak = false;
unsigned long peakDisplayStartTime = 0;
const unsigned long PEAK_DISPLAY_DURATION_MS = 10000; // 10 segundos

// Controle de estado do botão (Edge Detection e Auto-Polaridade)
int idleButtonState = LOW;
int activeButtonState = HIGH;
int lastButtonState = LOW;

// Flags sinalizadas pelos callbacks BLE (que rodam em outra task do FreeRTOS).
// O display e a balança só são acessados pelo loop(), evitando escrita I2C
// concorrente (que também corrompe a imagem do display).
volatile bool bleStartRequested = false;
volatile bool idleRefreshRequested = false;

// ==========================================
// FUNÇÕES DE DISPLAY (layout para 128x64)
// Fonte padrão: 6x8 px por caractere * textSize
// ==========================================

// Escreve um texto centralizado horizontalmente na linha y
void drawCentered(const char* text, int16_t y, uint8_t size) {
  int16_t x1, y1;
  uint16_t w, h;
  display.setTextSize(size);
  display.getTextBounds(text, 0, 0, &x1, &y1, &w, &h);
  int16_t x = (SCREEN_WIDTH - (int16_t)w) / 2;
  if (x < 0) x = 0;
  display.setCursor(x, y);
  display.print(text);
}

// Tela de espera
void showIdleDisplay() {
  display.clearDisplay();
  drawCentered("DYNATECH", 0, 2);                      // y 0..15
  display.drawFastHLine(0, 18, SCREEN_WIDTH, OLED_WHITE);
  drawCentered("Pressione o botao", 24, 1);            // y 24..31
  drawCentered("para medir", 34, 1);                   // y 34..41
  display.drawFastHLine(0, 47, SCREEN_WIDTH, OLED_WHITE);
  drawCentered(deviceConnected ? "BLE: Conectado" : "BLE: Aguardando", 54, 1); // y 54..61
  display.display();
}

// Exibe um título e um valor em kgf
void showForceDisplay(const char* title, float value) {
  char valueStr[12];
  snprintf(valueStr, sizeof(valueStr), "%.1f", value);

  display.clearDisplay();
  drawCentered(title, 0, 2);                           // y 0..15
  display.drawFastHLine(0, 18, SCREEN_WIDTH, OLED_WHITE);
  drawCentered(valueStr, 23, 3);                       // y 23..46
  drawCentered("kgf", 50, 1);                          // y 50..57
  display.display();
}

// Atualiza os LEDs de status (não bloqueante, chamado a cada iteração do loop)
void updateLeds() {
  // LED 1: fixo quando pareado, piscando lento quando aguardando conexão
  if (deviceConnected) {
    digitalWrite(LED1_PIN, HIGH);
    led1BlinkState = true;
  } else {
    unsigned long now = millis();
    if (now - led1LastToggle >= LED1_BLINK_INTERVAL_MS) {
      led1LastToggle = now;
      led1BlinkState = !led1BlinkState;
    }
    digitalWrite(LED1_PIN, led1BlinkState ? HIGH : LOW);
  }

  // LED 2: aceso fixo enquanto houver medição em andamento
  digitalWrite(LED2_PIN, isMeasuring ? HIGH : LOW);
}

// Inicia uma medição (chamada somente a partir do loop())
void startMeasurement() {
  isMeasuring = true;
  maxForceDetected = 0.0;
  showPeak = false; // Cancela a exibição do pico se iniciar uma nova medição

  digitalWrite(LED2_PIN, HIGH);
  showForceDisplay("FORCA", 0.0);

  // Tara a balança no início da medição para ignorar peso da própria mão/aparelho
  scale.tare();

  // Conta os 5 segundos a partir do fim da tara
  measurementStartTime = millis();
  lastLiveUpdate = measurementStartTime;

  // Notifica o app que a medição começou
  if (deviceConnected && pCharStatus) {
    pCharStatus->setValue("1"); // 1 = Medindo
    pCharStatus->notify();
  }
}

// ==========================================
// CALLBACKS BLE
// ==========================================
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("App Conectado!");
      idleRefreshRequested = true; // O loop() redesenha a tela de espera
    }

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("App Desconectado. Reiniciando advertising...");
      idleRefreshRequested = true;
      
      // Permite que o app reconecte novamente
      BLEDevice::startAdvertising();
    }
};

class StartMeasurementCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      // 'auto' para compatibilidade: core 2.x retorna std::string, core 3.x retorna String
      auto rxValue = pCharacteristic->getValue();

      // Se receber o comando "1", pede ao loop() para iniciar o teste
      if (rxValue.length() > 0 && rxValue[0] == '1' && !isMeasuring) {
        Serial.println("Comando de inicio recebido!");
        bleStartRequested = true;
      }
    }
};

// ==========================================
// SETUP
// ==========================================
void setup() {
  Serial.begin(115200);
  Serial.println("Iniciando Dynamometer Firmware...");

  // Configura o pino do botão usando o resistor interno de pull-down
  pinMode(BUTTON_PIN, INPUT_PULLDOWN);

  // Configura os LEDs de status
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  digitalWrite(LED1_PIN, LOW);
  digitalWrite(LED2_PIN, LOW);
  
  // Pequeno delay para estabilizar o pino
  delay(100);
  
  // Autodetecta a fiação do usuário no momento do boot:
  // Se o botão ler HIGH sem ninguém apertar, ele foi montado como Pull-Up (ou é NC).
  // Se ler LOW, foi montado como Pull-Down.
  idleButtonState = digitalRead(BUTTON_PIN);
  activeButtonState = (idleButtonState == HIGH) ? LOW : HIGH;
  lastButtonState = idleButtonState;

  // Inicializa Display OLED 128x64 (SDA=21, SCL=22)
  delay(250); // Tempo para o OLED estabilizar a alimentação antes da inicialização
  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SCREEN_ADDRESS, true)) {
    Serial.println(F("Falha ao inicializar o display OLED"));
  } else {
    display.clearDisplay();   // Limpa o buffer (remove o logo da Adafruit)
    display.display();        // Limpa a RAM do display (remove o "chuvisco" inicial)
    display.setTextColor(OLED_WHITE);
    display.setTextWrap(false);
    display.cp437(true);
    showIdleDisplay();
  }

  // Inicializa HX711
  scale.begin(HX711_DOUT, HX711_SCK);
  scale.set_scale(CALIBRATION_FACTOR);
  scale.tare(); // Zera a balança
  Serial.println("Balança inicializada e tarada.");

  // Inicializa o dispositivo BLE
  BLEDevice::init("Dynamometer_ESP32");
  
  // Cria o Servidor BLE
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Cria o Serviço BLE
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Characteristic: START (WRITE)
  BLECharacteristic *pCharStart = pService->createCharacteristic(
                                     CHAR_START_UUID,
                                     BLECharacteristic::PROPERTY_WRITE
                                   );
  pCharStart->setCallbacks(new StartMeasurementCallbacks());

  // Characteristic: RESULT (NOTIFY | READ)
  pCharResult = pService->createCharacteristic(
                      CHAR_RESULT_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_NOTIFY
                    );
  pCharResult->addDescriptor(new BLE2902());

  // Characteristic: STATUS (NOTIFY | READ)
  pCharStatus = pService->createCharacteristic(
                      CHAR_STATUS_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_NOTIFY
                    );
  pCharStatus->addDescriptor(new BLE2902());
  pCharStatus->setValue("0"); // Inicia como Idle

  // Characteristic: LIVE (NOTIFY)
  pCharLive = pService->createCharacteristic(
                      CHAR_LIVE_UUID,
                      BLECharacteristic::PROPERTY_NOTIFY
                    );
  pCharLive->addDescriptor(new BLE2902());

  // Inicia o serviço
  pService->start();

  // Inicia a divulgação do serviço
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  // Ajuda na conexão com iPhone se aplicável no futuro
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  
  Serial.println("BLE iniciado. Aguardando conexões...");
}

// ==========================================
// LOOP PRINCIPAL
// ==========================================
void loop() {
  int currentButtonState = digitalRead(BUTTON_PIN);

  // === COMANDO DE INÍCIO VIA BLE ===
  if (bleStartRequested) {
    bleStartRequested = false;
    if (!isMeasuring) {
      startMeasurement();
    }
  }

  // === CHECAGEM DO BOTÃO FÍSICO (Edge Trigger Auto-Adaptativo) ===
  // Só inicia se o botão ACABOU de ser pressionado (mudou do estado ocioso para o ativo)
  if (currentButtonState == activeButtonState && lastButtonState == idleButtonState && !isMeasuring) {
    Serial.println("Medicao iniciada pelo botao fisico!");
    startMeasurement();
    delay(200); // Debounce simples para o botão
  }

  // === ATUALIZAÇÃO DA TELA DE ESPERA (conexão/desconexão BLE) ===
  if (idleRefreshRequested) {
    idleRefreshRequested = false;
    if (!isMeasuring && !showPeak) {
      showIdleDisplay();
    }
  }

  // === LÓGICA DE MEDIÇÃO ===
  if (isMeasuring) {
    unsigned long currentTime = millis();
    
    // Verifica se já se passaram os 5 segundos
    if (currentTime - measurementStartTime <= MEASUREMENT_DURATION_MS) {
      // Lê o valor atual do HX711 em kg (já aplicado o fator de calibração)
      // Usamos get_units() em vez de read()
      if (scale.is_ready()) {
        float currentForce = scale.get_units(1); // Lê 1 amostra para ser mais rápido

        // Inverte a força caso a célula de carga esteja montada de cabeça para baixo
        // ou com os fios verde/branco invertidos (gerando valores negativos)
        currentForce = fabs(currentForce);
        
        // Evita mostrar ruídos pequenos quando o dinamômetro está em repouso
        if (currentForce < 0.2) currentForce = 0.0;

        // Atualiza o pico máximo
        if (currentForce > maxForceDetected) {
          maxForceDetected = currentForce;
        }

        // Live Update via notify (a cada 100ms)
        if (currentTime - lastLiveUpdate >= 100) {
          lastLiveUpdate = currentTime;
          
          if (deviceConnected && pCharLive) {
            char liveStr[10];
            dtostrf(currentForce, 1, 2, liveStr);
            pCharLive->setValue(liveStr);
            pCharLive->notify();
          }

          // Atualiza o Display
          showForceDisplay("FORCA", currentForce);
        }

        // Print opcional para debug na serial
        // Serial.printf("Força atual: %.2f kg | Pico: %.2f kg\n", currentForce, maxForceDetected);
      }
    } else {
      // Tempo de 5 segundos esgotado, finalizar medição!
      isMeasuring = false;
      Serial.printf("Medição finalizada. Pico alcançado: %.2f kg\n", maxForceDetected);

      // Atualiza o app caso esteja conectado
      if (deviceConnected) {
        char resultStr[10];
        dtostrf(maxForceDetected, 1, 2, resultStr); // Ex: "45.20"

        // Atualiza o characteristic de resultado e notifica o app
        pCharResult->setValue(resultStr);
        pCharResult->notify();

        // Atualiza o characteristic de status para Idle (0) e notifica
        pCharStatus->setValue("0");
        pCharStatus->notify();
      }

      // Exibe o pico no display por 10 segundos
      showPeak = true;
      peakDisplayStartTime = millis();
      showForceDisplay("PICO MAX", maxForceDetected);
    }
  }

  // Verifica se o tempo de exibição do pico terminou
  if (showPeak && !isMeasuring) {
    if (millis() - peakDisplayStartTime > PEAK_DISPLAY_DURATION_MS) {
      showPeak = false;
      showIdleDisplay();
    }
  }

  // Atualiza os LEDs de status (Bluetooth e medição)
  updateLeds();

  // Salva o estado atual do botão para a próxima iteração do loop
  lastButtonState = currentButtonState;

  // Pequeno delay para não travar a CPU e permitir tarefas de background do BLE
  delay(10);
}
