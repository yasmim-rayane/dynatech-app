#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include "HX711.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ==========================================
// CONFIGURAÇÕES DO DISPLAY OLED
// ==========================================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ==========================================
// CONFIGURAÇÕES DE PINOS DO HX711
// ==========================================
const int HX711_DOUT = 17; // Pino de dados do HX711
const int HX711_SCK = 16;  // Pino de clock do HX711

// ==========================================
// CONFIGURAÇÕES DO BOTÃO FÍSICO
// ==========================================
#define BUTTON_PIN 4 // Pino para o botão de início da medição

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
bool deviceConnected = false;

// ==========================================
// VARIÁVEIS DE CONTROLE DA MEDIÇÃO
// ==========================================
bool isMeasuring = false;
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

// Função auxiliar para atualizar o display no modo ocioso
void showIdleDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);
  display.println("Dynamometer");
  display.println("Esperando medicao");
  display.println("iniciar...");
  display.display();
}

// ==========================================
// CALLBACKS BLE
// ==========================================
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("App Conectado!");
      
      // Quando conecta, se não estiver medindo nem mostrando o pico, atualiza para Idle
      if (!isMeasuring && !showPeak) {
        showIdleDisplay();
      }
    }

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("App Desconectado. Reiniciando advertising...");
      
      if (!isMeasuring && !showPeak) {
        showIdleDisplay();
      }
      
      // Permite que o app reconecte novamente
      BLEDevice::startAdvertising();
    }
};

class StartMeasurementCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      String rxValue = pCharacteristic->getValue();

      if (rxValue.length() > 0) {
        // Se receber o comando "1" e não estiver medindo, inicia o teste
        if (rxValue[0] == '1' && !isMeasuring) {
          Serial.println("Comando de inicio recebido!");
          isMeasuring = true;
          maxForceDetected = 0.0;
          measurementStartTime = millis();
          lastLiveUpdate = millis();
          showPeak = false; // Cancela a exibição do pico se iniciar uma nova medição
          
          display.clearDisplay();
          display.setTextSize(2);
          display.setCursor(0, 0);
          display.print("Forca:");
          display.setCursor(0, 16);
          display.print("0.0 kgf");
          display.display();
          
          // Tara a balança no início da medição para ignorar peso da própria mão/aparelho
          scale.tare();
          
          // Notifica o app que a medição começou
          if (pCharStatus) {
            pCharStatus->setValue("1"); // 1 = Medindo
            pCharStatus->notify();
          }
        }
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
  
  // Pequeno delay para estabilizar o pino
  delay(100);
  
  // Autodetecta a fiação do usuário no momento do boot:
  // Se o botão ler HIGH sem ninguém apertar, ele foi montado como Pull-Up (ou é NC).
  // Se ler LOW, foi montado como Pull-Down.
  idleButtonState = digitalRead(BUTTON_PIN);
  activeButtonState = (idleButtonState == HIGH) ? LOW : HIGH;
  lastButtonState = idleButtonState;

  // Inicializa Display OLED (SDA=22, SCL=21)
  Wire.begin(22, 21);
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
  } else {
    display.setTextColor(SSD1306_WHITE);
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

  // === CHECAGEM DO BOTÃO FÍSICO (Edge Trigger Auto-Adaptativo) ===
  // Só inicia se o botão ACABOU de ser pressionado (mudou do estado ocioso para o ativo)
  if (currentButtonState == activeButtonState && lastButtonState == idleButtonState && !isMeasuring) {
    Serial.println("Medicao iniciada pelo botao fisico!");
    isMeasuring = true;
    maxForceDetected = 0.0;
    measurementStartTime = millis();
    lastLiveUpdate = millis();
    showPeak = false; // Cancela a exibição do pico se iniciar uma nova medição
    
    display.clearDisplay();
    display.setTextSize(2);
    display.setCursor(0, 0);
    display.print("Forca:");
    display.setCursor(0, 16);
    display.print("0.0 kgf");
    display.display();
    
    // Tara a balança no início da medição
    scale.tare();
    
    // Se o app estiver conectado, avisa que começou a medir
    if (deviceConnected && pCharStatus) {
      pCharStatus->setValue("1");
      pCharStatus->notify();
    }
    
    delay(200); // Debounce simples para o botão
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
          display.clearDisplay();
          display.setTextSize(2);
          display.setCursor(0, 0);
          display.print("Forca:");
          display.setCursor(0, 16);
          display.print(currentForce, 1);
          display.print(" kgf");
          display.display();
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
      display.clearDisplay();
      display.setTextSize(2);
      display.setCursor(0, 0);
      display.print("PICO MAX:");
      display.setCursor(0, 16);
      display.print(maxForceDetected, 1);
      display.print(" kgf");
      display.display();
    }
  }

  // Verifica se o tempo de exibição do pico terminou
  if (showPeak && !isMeasuring) {
    if (millis() - peakDisplayStartTime > PEAK_DISPLAY_DURATION_MS) {
      showPeak = false;
      showIdleDisplay();
    }
  }

  // Salva o estado atual do botão para a próxima iteração do loop
  lastButtonState = currentButtonState;

  // Pequeno delay para não travar a CPU e permitir tarefas de background do BLE
  delay(10);
}
