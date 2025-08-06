import React from 'react';
import { CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import { EventArea } from '../types';

interface AreaCardProps {
  area: EventArea;
  onClick: () => void;
}

const AreaCard: React.FC<AreaCardProps> = ({ area, onClick }) => {
  const progressPercentage = area.currentOccupancy; // Agora representa progresso em %

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (areaName: string) => {
    if (areaName.includes('Logística')) return '🚛';
    if (areaName.includes('Refratário')) return '🧱';
    if (areaName.includes('Elétrica')) return '⚡';
    if (areaName.includes('Mecânica')) return '⚙️';
    if (areaName.includes('Preparação')) return '🏗️';
    if (areaName.includes('Barramentos')) return '🔌';
    return '⚡'; // Ícone padrão para disciplinas da preparação
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'No Prazo';
      case 'warning':
        return 'Atenção';
      case 'critical':
        return 'Atrasado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getCategoryIcon(area.name)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{area.name}</h3>
            <span className="text-sm text-gray-500">{area.category}</span>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(area.status)}`}
        >
          {getStatusText(area.status)}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-blue-500" />
            <span className="text-sm text-gray-600">Progresso</span>
          </div>
          <span className="text-sm font-medium">{progressPercentage}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getProgressColor(progressPercentage)}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>

        <div className="text-center">
          <span className="text-lg font-bold text-gray-800">
            {progressPercentage}%
          </span>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>Total: {area.capacity} subatividades</span>
          </div>
          <div className="flex items-center space-x-1">
            <BarChart3 size={12} />
            <span>Em andamento</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaCard;
