// src/services/api/MeasurementApi.ts

// Interface que define o payload que será enviado para o backend
export interface MeasurementPayload {
  hand: 'LEFT' | 'RIGHT';
  maxForceKg: number;
  timestamp: string;
}

/**
 * Função de exemplo que integra o app React/Capacitor com o backend Spring Boot/MySQL.
 * Você deve ajustar a URL e o header de Autenticação conforme a estrutura já existente do seu projeto.
 */
export const saveMeasurement = async (payload: MeasurementPayload): Promise<void> => {
  // Ajuste BASE_URL de acordo com o IP/URL do seu servidor Spring Boot
  // Se estiver testando no emulador Android acessando localhost do PC, use http://10.0.2.2:8080
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.15.2:8080/api'; 
  
  // Exemplo de como você pegaria um token JWT se o sistema de login já existe
  const userToken = localStorage.getItem('auth_token') || '';

  try {
    const response = await fetch(`${BASE_URL}/measurements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`, // Se necessário
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao salvar no banco de dados.');
    }

    console.log('Medição salva com sucesso no MySQL!');
  } catch (error) {
    console.error('Erro na API:', error);
    throw error; // Repassa o erro para ser tratado no Hook
  }
};
