// src/services/ble/BleConfig.ts

// Estes UUIDs DEVEM ser EXATAMENTE os mesmos definidos no firmware do ESP32.
// Utilize minúsculas por padrão no Capacitor BLE.

export const BLE_CONFIG = {
  // Nome que o ESP32 estará divulgando
  DEVICE_NAME: 'Dynamometer_ESP32',

  // UUID do Serviço Principal
  SERVICE_UUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',

  // Characteristic para enviar comando de START (Escrita)
  CHAR_START_UUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',

  // Characteristic para receber o Resultado Máximo em Kg (Notificação/Leitura)
  CHAR_RESULT_UUID: '8a21136d-14a9-4672-886b-56832db7d519',

  // Characteristic para receber o Status (Notificação/Leitura) 
  // "0" = Idle, "1" = Medindo
  CHAR_STATUS_UUID: 'f24b2f29-2d3b-4ab2-8e3d-71b315264b97',

  // Characteristic para enviar leitura contínua (Notificação) em tempo real
  CHAR_LIVE_UUID: 'b2a1a8c3-f6d2-43d9-93b5-3d5f1d48ab11',
};
