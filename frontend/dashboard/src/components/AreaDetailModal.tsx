import React from 'react';
import { X, Users, Thermometer, Droplets, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { EventArea } from '../types';

interface AreaDetailModalProps {
  area: EventArea | null;
  isOpen: boolean;
  onClose: () => void;
}

const AreaDetailModal: React.FC<AreaDetailModalProps> = ({
  area,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !area) return null;

  const occupancyPercentage = (area.currentOccupancy / area.capacity) * 100;

  const chartData = {
    labels: area.evolution.map((point) => point.time),
    datasets: [
      {
        label: 'Ocupação',
        data: area.evolution.map((point) => point.occupancy),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Horário',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Pessoas',
        },
        beginAtZero: true,
        max: area.capacity,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600 bg-green-100';
    if (percentage < 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Entretenimento':
        return '🎭';
      case 'Serviços':
        return '🍽️';
      case 'Comercial':
        return '🏪';
      case 'Premium':
        return '⭐';
      case 'Infraestrutura':
        return '🚗';
      case 'Bem-estar':
        return '🛋️';
      default:
        return '📍';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getCategoryIcon(area.category)}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{area.name}</h2>
              <span className="text-gray-500">{area.category}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="text-blue-600" size={20} />
                <span className="text-sm font-medium text-blue-800">
                  Ocupação
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {area.currentOccupancy}
              </div>
              <div className="text-sm text-blue-600">
                de {area.capacity} pessoas
              </div>
            </div>

            <div
              className={`rounded-lg p-4 ${getOccupancyColor(occupancyPercentage)}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Activity size={20} />
                <span className="text-sm font-medium">Taxa</span>
              </div>
              <div className="text-2xl font-bold">
                {occupancyPercentage.toFixed(1)}%
              </div>
              <div className="text-sm">ocupação atual</div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Thermometer className="text-orange-600" size={20} />
                <span className="text-sm font-medium text-orange-800">
                  Temperatura
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {area.temperature}°C
              </div>
              <div className="text-sm text-orange-600">ambiente</div>
            </div>

            <div className="bg-cyan-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="text-cyan-600" size={20} />
                <span className="text-sm font-medium text-cyan-800">
                  Umidade
                </span>
              </div>
              <div className="text-2xl font-bold text-cyan-900">
                {area.humidity}%
              </div>
              <div className="text-sm text-cyan-600">relativa</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Evolução da Ocupação - {area.name}
            </h3>
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm text-gray-600">Status da Área:</span>
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    area.status === 'Ativo'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {area.status}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Última atualização: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaDetailModal;
