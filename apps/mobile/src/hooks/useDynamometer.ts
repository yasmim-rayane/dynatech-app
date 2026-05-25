// src/hooks/useDynamometer.ts
import { useState, useEffect, useCallback } from 'react';
import { BleService } from '../services/ble/BleService';
import { saveMeasurement } from '../services/api/MeasurementApi';

export type HandSide = 'LEFT' | 'RIGHT' | null;

export const useDynamometer = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para guardar a mão selecionada na interface
  const [selectedHand, setSelectedHand] = useState<HandSide>(null);
  
  // Resultado final retornado pelo ESP32
  const [resultKg, setResultKg] = useState<number | null>(null);
  
  // Estado para indicar se estamos salvando no BD
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Inicializa o BLE quando o hook é montado
    const initBle = async () => {
      try {
        await BleService.initialize();
      } catch (e) {
        setError('Não foi possível inicializar o Bluetooth no dispositivo.');
      }
    };

    initBle();

    // Registra callbacks no Service
    BleService.onStatus((measuring) => {
      setIsMeasuring(measuring);
    });

    BleService.onResult((maxForce) => {
      setResultKg(maxForce);
    });

    BleService.onDisconnect(() => {
      setIsConnected(false);
      setIsMeasuring(false);
      setError('Conexão perdida com o dinamômetro.');
    });

    return () => {
      // Limpeza opcional (cuidado para não desconectar se a navegação continuar na mesma página)
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const connected = await BleService.scanAndConnect();
      setIsConnected(connected);
    } catch (err: any) {
      setError('Falha ao conectar: ' + (err.message || 'Erro desconhecido'));
      setIsConnected(false);
    }
  }, []);

  const startMeasurement = useCallback(async (hand: HandSide) => {
    if (!isConnected) {
      setError('Conecte ao dispositivo primeiro.');
      return;
    }
    if (!hand) {
      setError('Selecione uma mão (Direita ou Esquerda) antes de iniciar.');
      return;
    }

    try {
      setError(null);
      setResultKg(null);
      setSelectedHand(hand);
      
      // Envia o comando via BLE
      await BleService.startMeasurement();
      
      // isMeasuring será atualizado automaticamente pelo onStatus do BLE
    } catch (err: any) {
      setError('Erro ao enviar comando: ' + (err.message || 'Erro desconhecido'));
    }
  }, [isConnected]);

  const confirmAndSave = useCallback(async () => {
    if (resultKg === null || selectedHand === null) {
      setError('Nenhuma medição válida para salvar.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      // Chama a API existente para salvar no MySQL
      await saveMeasurement({
        hand: selectedHand,
        maxForceKg: resultKg,
        timestamp: new Date().toISOString()
      });
      
      // Limpa os estados após salvar com sucesso (opcional)
      // setResultKg(null);
      // setSelectedHand(null);
      
    } catch (err: any) {
      setError('Erro ao salvar no banco: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsSaving(false);
    }
  }, [resultKg, selectedHand]);

  const discardMeasurement = useCallback(() => {
    setResultKg(null);
    setSelectedHand(null);
  }, []);

  const disconnect = useCallback(async () => {
    await BleService.disconnect();
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    isMeasuring,
    error,
    resultKg,
    selectedHand,
    isSaving,
    connect,
    startMeasurement,
    confirmAndSave,
    discardMeasurement,
    disconnect
  };
};
