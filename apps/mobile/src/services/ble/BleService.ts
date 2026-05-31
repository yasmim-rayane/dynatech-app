// src/services/ble/BleService.ts
import { BleClient, textToDataView, dataViewToText, BleDevice } from '@capacitor-community/bluetooth-le';
import { BLE_CONFIG } from '@dynatech/shared';

export class BleService {
  private static device: BleDevice | null = null;
  private static onResultCallback: ((resultKg: number) => void) | null = null;
  private static onStatusCallback: ((isMeasuring: boolean) => void) | null = null;
  private static onLiveUpdateCallback: ((currentKg: number) => void) | null = null;
  private static onDisconnectCallback: (() => void) | null = null;
  private static onConnectionStateChangeCallbacks = new Set<(connected: boolean) => void>();
  private static onEnabledChangeCallbacks = new Set<(enabled: boolean) => void>();

  public static isConnected(): boolean {
    return this.device !== null;
  }

  public static async isBluetoothEnabled(): Promise<boolean> {
    try {
      // Garante que o BleClient esteja inicializado antes de checar
      await BleClient.initialize({ androidNeverForLocation: true });
      return await BleClient.isEnabled();
    } catch {
      return false; // se falhar, assume que não está
    }
  }

  /**
   * Inicializa o cliente BLE nativo. 
   * Deve ser chamado antes de qualquer outra operação.
   */
  public static async initialize(): Promise<void> {
    try {
      await BleClient.initialize({ androidNeverForLocation: true });
      
      // Monitora alterações do estado do bluetooth do aparelho (ligado/desligado)
      await BleClient.startEnabledNotifications((enabled) => {
        console.log(`Estado do Bluetooth alterado para: ${enabled ? 'Ligado' : 'Desligado'}`);
        if (!enabled && this.device) {
          // Se desligar o adaptador, força desconexão lógica
          this.handleDisconnect(this.device.deviceId);
        }
        this.onEnabledChangeCallbacks.forEach(cb => cb(enabled));
      });

    } catch (error) {
      console.error('Erro ao inicializar o BLE:', error);
      throw error;
    }
  }

  /**
   * Inicia o scan em background buscando pelo serviço do Dynamometer.
   * Aciona o callback onDeviceFound toda vez que detectar um device na área.
   */
  public static async startScan(onDeviceFound: (device: BleDevice, rssi: number) => void): Promise<void> {
    try {
      console.log('Iniciando scan BLE...');
      await BleClient.requestLEScan(
        { services: [BLE_CONFIG.SERVICE_UUID] },
        (result) => {
          onDeviceFound(result.device, result.rssi || -100);
        }
      );
    } catch (error) {
      console.error('Erro durante scan:', error);
      throw error;
    }
  }

  /**
   * Para o escaneamento
   */
  public static async stopScan(): Promise<void> {
    try {
      await BleClient.stopLEScan();
    } catch (error) {
      console.error('Erro ao parar scan:', error);
    }
  }

  /**
   * Conecta ao device, estabelece a MTU e assina as notificações
   */
  public static async connectToDevice(device: BleDevice): Promise<void> {
    try {
      const deviceId = device.deviceId;
      await BleClient.connect(deviceId, (dId) => this.handleDisconnect(dId));
      this.device = device;
      console.log(`Conectado ao dispositivo: ${deviceId}`);
      
      this.onConnectionStateChangeCallbacks.forEach(cb => cb(true));

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

      // Inscreve para o LIVE STREAM (força atual)
      await BleClient.startNotifications(
        deviceId,
        BLE_CONFIG.SERVICE_UUID,
        BLE_CONFIG.CHAR_LIVE_UUID,
        (value: DataView) => {
          const liveStr = dataViewToText(value);
          const currentKg = parseFloat(liveStr);
          if (this.onLiveUpdateCallback) {
            this.onLiveUpdateCallback(currentKg);
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
        this.onConnectionStateChangeCallbacks.forEach(cb => cb(false));
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
    this.onConnectionStateChangeCallbacks.forEach(cb => cb(false));
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

  public static onLiveUpdate(callback: (currentKg: number) => void) {
    this.onLiveUpdateCallback = callback;
  }

  public static onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }

  public static onConnectionStateChange(callback: (connected: boolean) => void) {
    this.onConnectionStateChangeCallbacks.add(callback);
    return () => this.onConnectionStateChangeCallbacks.delete(callback);
  }

  public static onEnabledChange(callback: (enabled: boolean) => void) {
    this.onEnabledChangeCallbacks.add(callback);
    return () => this.onEnabledChangeCallbacks.delete(callback);
  }
}
