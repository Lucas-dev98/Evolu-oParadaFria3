import React from 'react';
import { RefreshCw, Activity, Trash2 } from 'lucide-react';

interface ActionButtonsProps {
  onRefresh: () => void;
  onCarregarCSV?: () => void;
  onLimparDados: () => void;
  isLoading: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onRefresh,
  onCarregarCSV,
  onLimparDados,
  isLoading,
}) => {
  return (
    <div className="flex items-center space-x-2">
      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 disabled:opacity-50"
        title="Atualizar dados"
      >
        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
      </button>

      {/* CSV Manager */}
      {onCarregarCSV && (
        <button
          onClick={onCarregarCSV}
          className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
          title="Carregar Arquivos CSV"
        >
          <Activity className="w-5 h-5" />
        </button>
      )}

      {/* Clear Data Button */}
      <button
        onClick={onLimparDados}
        className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105"
        title="Limpar dados"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ActionButtons;
