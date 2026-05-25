// src/services/ble/BleService.ts
import { BleClient, textToDataView, dataViewToText, BleDevice } from '@capacitor-community/bluetooth-le';
import { BLE_CONFIG } from '@dynatech/shared';

export class BleService {
  private static device: BleDevice | null = null;
  private static onResultCallback: ((resultKg: number) => void) | null = null;
  private static onStatusCallback: ((isMeasuring: boolean) => void) | null = null;
  private static onDisconnectCallback: (() => void) | null = null;

  /**
   * Inicializa o cliente BLE nativo. 
   * Deve ser chamado antes de qualquer outra operação.
   */
  public static async initialize(): Promise<void> {
    try {
      await BleClient.initialize({ androidNeverForLocation: true });
    } catch (error) {
      console.error('Erro ao inicializar o BLE:', error);
      throw error;
    }
  }

  /**
   * Realiza um Scan buscando especificamente pelo serviço do Dynamometer.
   * Ao encontrar, tenta conectar e configurar os listeners.
   */
  public static async scanAndConnect(): Promise<boolean> {
    try {
      console.log('Iniciando scan BLE...');
      
      const device = await BleClient.requestDevice({
        services: [BLE_CONFIG.SERVICE_UUID],
        optionalServices: [BLE_CONFIG.SERVICE_UUID]
      });

      if (device) {
        this.device = device;
        await this.connectToDevice(device.deviceId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro durante scan e conexão:', error);
      throw error;
    }
  }

  /**
   * Conecta ao device, estabelece a MTU e assina as notificações
   */
  private static async connectToDevice(deviceId: string): Promise<void> {
    try {
      await BleClient.connect(deviceId, (dId) => this.handleDisconnect(dId));
      console.log(`Conectado ao dispositivo: ${deviceId}`);

      // Inscreve para receber atualizações do RESULTADO
      await BleClient.startNotifications(
        deviceId,
        BLE_CONFIG.SERVICE_UUID,
        BLE_CONFIG.CHAR_RESULT_UUID,
        (value: DataView) => {
          const resultStr = dataViewToText(value);
          const resultKg = parseFloat(resultStr);
          console.log(`Pico Máximo Recebido: ${resultKg} kg`);
          
          if (this.onResultCallback) {
            this.onResultCallback(resultKg);
          }
        }
      );

      // Inscreve para receber atualizações de STATUS
      await BleClient.startNotifications(
        deviceId,
        BLE_CONFIG.SERVICE_UUID,
        BLE_CONFIG.CHAR_STATUS_UUID,
        (value: DataView) => {
          const statusStr = dataViewToText(value);
          const isMeasuring = statusStr === '1';
          console.log(`Status do ESP32 alterado para: ${isMeasuring ? 'Medindo' : 'Idle'}`);
          
          if (this.onStatusCallback) {
            this.onStatusCallback(isMeasuring);
          }
        }
      );

    } catch (error) {
      console.error('Falha ao conectar no dispositivo:', error);
      throw error;
    }
  }

  /**
   * Envia o comando "1" para o ESP32 iniciar a medição (5 segundos)
   */
  public static async startMeasurement(): Promise<void> {
    if (!this.device) {
      throw new Error('Dispositivo não conectado. Por favor, conecte-se primeiro.');
    }

    try {
      const data = textToDataView('1');
      await BleClient.write(
        this.device.deviceId,
        BLE_CONFIG.SERVICE_UUID,
        BLE_CONFIG.CHAR_START_UUID,
        data
      );
      console.log('Comando de START enviado para o ESP32.');
    } catch (error) {
      console.error('Erro ao enviar comando de start:', error);
      throw error;
    }
  }

  /**
   * Desconecta explicitamente
   */
  public static async disconnect(): Promise<void> {
    if (this.device) {
      try {
        await BleClient.disconnect(this.device.deviceId);
        this.device = null;
      } catch (error) {
        console.error('Erro ao desconectar:', error);
      }
    }
  }

  /**
   * Handler chamado quando a conexão cai de forma inesperada ou programada
   */
  private static handleDisconnect(deviceId: string): void {
    console.log(`Dispositivo ${deviceId} desconectado.`);
    this.device = null;
    if (this.onDisconnectCallback) {
      this.onDisconnectCallback();
    }
  }

  // ==========================================
  // REGISTRO DE CALLBACKS (Usados pelo Hook)
  // ==========================================

  public static onResult(callback: (resultKg: number) => void) {
    this.onResultCallback = callback;
  }

  public static onStatus(callback: (isMeasuring: boolean) => void) {
    this.onStatusCallback = callback;
  }

  public static onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }
}
