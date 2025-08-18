import axios from 'axios';
import {
  EventArea,
  DashboardSummary,
  RealtimeData,
  EvolutionData,
} from '../types';
import { API_CONFIG, getAPIUrl } from '../config/environment';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Interceptor para logs de requisições em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use((config) => {
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      console.log('✅ API Response:', response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error(
        '❌ API Error:',
        error.response?.status,
        error.config?.url,
        error.message
      );
      return Promise.reject(error);
    }
  );
}

export const dashboardAPI = {
  // Obter todas as áreas
  getAreas: async (): Promise<EventArea[]> => {
    const response = await api.get('/areas');
    return response.data;
  },

  // Obter uma área específica
  getArea: async (id: number): Promise<EventArea> => {
    const response = await api.get(`/areas/${id}`);
    return response.data;
  },

  // Obter resumo do dashboard
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get('/summary');
    return response.data;
  },

  // Obter dados em tempo real
  getRealtime: async (): Promise<RealtimeData[]> => {
    const response = await api.get('/realtime');
    return response.data;
  },

  // Obter dados de evolução
  getEvolution: async (): Promise<EvolutionData[]> => {
    const response = await api.get('/evolution');
    return response.data;
  },

  // Upload de dados de áreas
  uploadAreas: async (areas: EventArea[]): Promise<void> => {
    await api.post('/upload-data', { areas });
  },

  // APIs de Cronograma
  getCronograma: async (): Promise<any> => {
    const response = await api.get('/cronograma');
    return response.data;
  },

  uploadCronograma: async (data: any): Promise<void> => {
    await api.post('/cronograma/upload', data);
  },

  // APIs de Fases
  uploadFase: async (data: any): Promise<void> => {
    await api.post('/fases/upload', data);
  },

  getFase: async (faseId: string): Promise<any> => {
    const response = await api.get(`/fases/${faseId}`);
    return response.data;
  },

  // API para obter imagens do carousel
  getImages: async (): Promise<string[]> => {
    const response = await api.get('/images');
    return response.data;
  },
};

export default dashboardAPI;
