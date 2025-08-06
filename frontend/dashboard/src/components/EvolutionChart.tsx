import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { EvolutionData } from '../types';
import { TrendingUp, Eye, EyeOff, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EvolutionChartProps {
  data: EvolutionData[];
}

const EvolutionChart: React.FC<EvolutionChartProps> = ({ data }) => {
  // Extrair áreas únicas dos dados
  const uniqueAreas = Array.from(new Set(data.map((area) => area.name)));

  // Estado para controlar visibilidade das áreas
  const [areaVisibility, setAreaVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(uniqueAreas.map((area) => [area, true]))
  );

  // Função para alternar visibilidade de uma área
  const toggleAreaVisibility = (areaName: string) => {
    setAreaVisibility((prev) => ({
      ...prev,
      [areaName]: !prev[areaName],
    }));
  };

  // Cores aprimoradas para melhor visualização
  const enhancedColors = [
    { border: 'rgb(59, 130, 246)', background: 'rgba(59, 130, 246, 0.15)' }, // blue
    { border: 'rgb(16, 185, 129)', background: 'rgba(16, 185, 129, 0.15)' }, // green
    { border: 'rgb(245, 158, 11)', background: 'rgba(245, 158, 11, 0.15)' }, // yellow
    { border: 'rgb(239, 68, 68)', background: 'rgba(239, 68, 68, 0.15)' }, // red
    { border: 'rgb(139, 92, 246)', background: 'rgba(139, 92, 246, 0.15)' }, // purple
    { border: 'rgb(236, 72, 153)', background: 'rgba(236, 72, 153, 0.15)' }, // pink
    { border: 'rgb(20, 184, 166)', background: 'rgba(20, 184, 166, 0.15)' }, // teal
    { border: 'rgb(251, 146, 60)', background: 'rgba(251, 146, 60, 0.15)' }, // orange
  ];

  const colors = [
    'rgb(59, 130, 246)', // blue
    'rgb(16, 185, 129)', // green
    'rgb(245, 158, 11)', // yellow
    'rgb(239, 68, 68)', // red
    'rgb(139, 92, 246)', // purple
    'rgb(236, 72, 153)', // pink
  ];

  const chartData = {
    labels: data[0]?.data.map((point) => point.x) || [],
    datasets: data
      .filter((area) => areaVisibility[area.name])
      .map((area, index) => {
        const areaIndex = uniqueAreas.indexOf(area.name);
        const color = enhancedColors[areaIndex % enhancedColors.length];

        return {
          label: area.name,
          data: area.data.map((point) => point.y),
          borderColor: color.border,
          backgroundColor: color.background,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBackgroundColor: color.border,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: color.border,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
        };
      }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Vamos criar nossa própria legenda customizada
      },
      title: {
        display: true,
        text: 'Evolução das Atividades - Preparação PFUS3 (73%)',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        color: '#1f2937',
        padding: 20,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            const areaName = context.dataset.label;
            return `${areaName}: ${value}% concluído`;
          },
          afterLabel: function (context: any) {
            const dataset = context.dataset;
            const currentIndex = context.dataIndex;
            if (currentIndex > 0) {
              const previousValue = dataset.data[currentIndex - 1];
              const currentValue = context.parsed.y;
              const change = currentValue - previousValue;
              const changePercent =
                previousValue > 0
                  ? ((change / previousValue) * 100).toFixed(1)
                  : '0';
              const trend = change > 0 ? '↗️' : change < 0 ? '↘️' : '➡️';
              return `${trend} ${change > 0 ? '+' : ''}${change} (${changePercent}%)`;
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Horário',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          color: '#374151',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Progresso (%)',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          color: '#374151',
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          callback: function (value: any) {
            return value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Controles de Visibilidade das Áreas */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Controle de Visualização
          </h3>
        </div>

        <div className="flex flex-wrap gap-3">
          {uniqueAreas.map((areaName, index) => {
            const color = enhancedColors[index % enhancedColors.length];
            const isVisible = areaVisibility[areaName];

            return (
              <button
                key={areaName}
                onClick={() => toggleAreaVisibility(areaName)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200
                  ${
                    isVisible
                      ? 'bg-white border-gray-300 shadow-sm hover:shadow-md'
                      : 'bg-gray-100 border-gray-200 opacity-60 hover:opacity-80'
                  }
                `}
                style={{
                  borderColor: isVisible ? color.border : undefined,
                  backgroundColor: isVisible ? color.background : undefined,
                }}
              >
                {isVisible ? (
                  <Eye className="w-4 h-4" style={{ color: color.border }} />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isVisible ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {areaName}
                </span>
                <div
                  className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                  style={{
                    backgroundColor: isVisible ? color.border : '#d1d5db',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Estatísticas rápidas */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Áreas visíveis:{' '}
            <span className="font-semibold">
              {Object.values(areaVisibility).filter(Boolean).length}
            </span>{' '}
            de <span className="font-semibold">{uniqueAreas.length}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                setAreaVisibility(
                  Object.fromEntries(uniqueAreas.map((area) => [area, true]))
                )
              }
              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              Mostrar Todas
            </button>
            <button
              onClick={() =>
                setAreaVisibility(
                  Object.fromEntries(uniqueAreas.map((area) => [area, false]))
                )
              }
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              Ocultar Todas
            </button>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default EvolutionChart;
