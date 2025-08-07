import React from 'react';
import {
  Loader2,
  FileSpreadsheet,
  Database,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface LoadingScreenProps {
  isOnline: boolean;
  loadingStep?: 'local' | 'csv' | 'backend' | 'mock';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isOnline,
  loadingStep = 'csv',
}) => {
  const getLoadingMessage = () => {
    switch (loadingStep) {
      case 'local':
        return {
          icon: <Database className="w-8 h-8 text-blue-500" />,
          title: 'Verificando dados salvos...',
          description: 'Procurando dados de cronograma armazenados localmente',
        };
      case 'csv':
        return {
          icon: <FileSpreadsheet className="w-8 h-8 text-green-500" />,
          title: 'Carregando cronograma CSV...',
          description: 'Processando dados do arquivo cronograma.csv',
        };
      case 'backend':
        return {
          icon: isOnline ? (
            <Wifi className="w-8 h-8 text-purple-500" />
          ) : (
            <WifiOff className="w-8 h-8 text-red-500" />
          ),
          title: 'Conectando ao servidor...',
          description: 'Buscando dados atualizados do backend',
        };
      case 'mock':
        return {
          icon: <Database className="w-8 h-8 text-orange-500" />,
          title: 'Carregando dados de demonstração...',
          description: 'Usando dados de exemplo para visualização',
        };
      default:
        return {
          icon: <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />,
          title: 'Carregando...',
          description: 'Preparando o dashboard',
        };
    }
  };

  const { icon, title, description } = getLoadingMessage();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        {/* Ícone animado */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-full shadow-lg border">
            {icon}
          </div>
        </div>

        {/* Spinner principal */}
        <div className="flex justify-center mb-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>

        {/* Texto principal */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>

        {/* Barra de progresso animada */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-500 h-2 rounded-full animate-pulse"
            style={{ width: '60%' }}
          ></div>
        </div>

        {/* Status de conexão */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span>Offline - Modo demonstração</span>
            </>
          )}
        </div>

        {/* Dicas durante o carregamento */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Dica</h3>
          <p className="text-sm text-blue-700">
            {loadingStep === 'csv' &&
              'O sistema está processando automaticamente o cronograma PFUS3 2025.'}
            {loadingStep === 'backend' &&
              'Conectando-se ao servidor para obter dados atualizados.'}
            {loadingStep === 'mock' &&
              'Usando dados de exemplo para demonstrar as funcionalidades.'}
            {loadingStep === 'local' &&
              'Verificando se existem dados previamente carregados.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
