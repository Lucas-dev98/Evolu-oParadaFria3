// Configuração de ambiente para APIs
export const API_CONFIG = {
  // URLs das APIs
  BASE_URL:
    process.env.NODE_ENV === 'production'
      ? `${window.location.origin}/api` // URL relativa em produção (Render)
      : 'http://localhost:3001/api', // URL local em desenvolvimento

  // Timeouts
  TIMEOUT: 10000,

  // Headers padrão
  HEADERS: {
    'Content-Type': 'application/json',
  },

  // Configurações específicas do Render
  RENDER: {
    // Se estamos no Render, usar URLs relativas
    IS_RENDER:
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('render.com') ||
        window.location.hostname.includes('onrender.com')),
  },
};

// Função para obter a URL da API baseada no ambiente
export const getAPIUrl = (endpoint: string = ''): string => {
  const baseUrl =
    API_CONFIG.RENDER.IS_RENDER || process.env.NODE_ENV === 'production'
      ? `${window.location.origin}/api`
      : 'http://localhost:3001/api';

  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Log da configuração atual
if (typeof window !== 'undefined') {
  console.log('🌍 Configuração de ambiente:', {
    NODE_ENV: process.env.NODE_ENV,
    IS_RENDER: API_CONFIG.RENDER.IS_RENDER,
    BASE_URL: API_CONFIG.BASE_URL,
    HOSTNAME: window.location.hostname,
  });
}
