import React from 'react';

interface StatusIndicatorProps {
  existeCronogramaLocal: boolean;
  isLoading: boolean;
  resumoCronograma: any;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  existeCronogramaLocal,
  isLoading,
  resumoCronograma,
}) => {
  // Prática #3: Usar estados para controlar o comportamento do componente
  const getStatusColor = () => {
    if (!existeCronogramaLocal) return 'text-red-500';
    if (isLoading) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (!existeCronogramaLocal) return 'Sem dados';
    if (isLoading) return 'Carregando...';
    return 'Conectado';
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Status: {getStatusText()}
              </span>
            </div>

            {/* Prática #9: Renderização condicional */}
            {resumoCronograma && (
              <div className="hidden sm:flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                <span>Atividades: {resumoCronograma.totalAtividades || 0}</span>
                <span>
                  Concluídas: {resumoCronograma.atividadesConcluidas || 0}
                </span>
                <span>Progresso: {resumoCronograma.percentualGeral || 0}%</span>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicator;
