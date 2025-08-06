import axios from 'axios';
import {
  EventArea,
  DashboardSummary,
  RealtimeData,
  EvolutionData,
} from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

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
};

export default dashboardAPI;
