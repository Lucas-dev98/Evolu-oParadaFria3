import React, { useState, useRef, useEffect } from 'react';
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
import { useThemeClasses } from '../contexts/ThemeContext';
import { EvolutionData } from '../types';
import {
  Eye,
  EyeOff,
  Activity,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

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
  additionalInfo?: {
    totalAtividades?: number;
    atividadesConcluidas?: number;
    atividadesCriticas?: number;
    progressoGeral?: number;
    faseAtual?: string;
  };
}

const EvolutionChart: React.FC<EvolutionChartProps> = ({
  data,
  additionalInfo,
}) => {
  const themeClasses = useThemeClasses();
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Extrair áreas únicas dos dados
  const uniqueAreas = Array.from(new Set(data?.map((area) => area.name) || []));

  // Estado para controlar visibilidade das áreas (deve vir antes de qualquer retorno)
  const [areaVisibility, setAreaVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(uniqueAreas.map((area) => [area, true]))
  );

  // Limpeza do gráfico para evitar conflitos de canvas
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // Debug: log dos dados recebidos
  console.log('🚀 EvolutionChart - Dados recebidos:', {
    dataLength: data?.length || 0,
    dataStructure: data?.map((item) => ({
      name: item.name,
      dataPoints: item.data?.length || 0,
      firstPoint: item.data?.[0],
      lastPoint: item.data?.[item.data?.length - 1],
      progressoAtual: item.data?.[item.data?.length - 1]?.y || 0,
    })),
  });

  // Verificar se há dados válidos
  if (!data || data.length === 0) {
    return (
      <div
        className={`rounded-xl shadow-lg p-8 text-center ${themeClasses.card}`}
      >
        <Activity
          className={`mx-auto h-16 w-16 ${themeClasses.textTertiary} mb-4`}
        />
        <h3
          className={`text-lg font-semibold ${themeClasses.textPrimary} mb-2`}
        >
          Carregando Dados de Evolução
        </h3>
        <p className={themeClasses.textSecondary}>
          Processando cronograma PFUS3 2025...
        </p>
      </div>
    );
  }

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

  const chartData = {
    labels:
      data.length > 0 && data[0]?.data
        ? data[0].data.map((point) => point.x)
        : [],
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
        text: `Evolução por Categoria - PFUS3 2025 (${data.length} áreas monitoradas)`,
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
    <div className={`rounded-lg shadow-md p-6 ${themeClasses.card}`}>
      {data.length === 0 ? (
        /* Exibir mensagem quando não há dados */
        <div
          className={`flex flex-col items-center justify-center h-96 ${themeClasses.textTertiary}`}
        >
          <Activity className={`w-12 h-12 mb-4 ${themeClasses.textTertiary}`} />
          <h3
            className={`text-lg font-semibold mb-2 ${themeClasses.textSecondary}`}
          >
            Nenhum dado disponível
          </h3>
          <p className={`text-sm text-center ${themeClasses.textTertiary}`}>
            Carregue um arquivo de dados ou verifique a conexão para visualizar
            o gráfico de evolução.
          </p>
        </div>
      ) : (
        <>
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
                      <Eye
                        className="w-4 h-4"
                        style={{ color: color.border }}
                      />
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
                      Object.fromEntries(
                        uniqueAreas.map((area) => [area, true])
                      )
                    )
                  }
                  className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Mostrar Todas
                </button>
                <button
                  onClick={() =>
                    setAreaVisibility(
                      Object.fromEntries(
                        uniqueAreas.map((area) => [area, false])
                      )
                    )
                  }
                  className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Ocultar Todas
                </button>
              </div>
            </div>

            {/* Painel de Informações das Atividades */}
            {additionalInfo && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-lg font-semibold text-gray-800">
                    Informações da Fase Atual
                  </h4>
                  {additionalInfo.faseAtual && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                      {additionalInfo.faseAtual}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Progresso Geral */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Progresso Geral
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {additionalInfo.progressoGeral?.toFixed(1) || '0.0'}%
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

                  {/* Total de Atividades */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total de Atividades
                        </p>
                        <p className="text-2xl font-bold text-gray-700">
                          {additionalInfo.totalAtividades || 0}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-gray-500" />
                    </div>
                  </div>

                  {/* Atividades Concluídas */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Atividades Concluídas
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {additionalInfo.atividadesConcluidas || 0}
                        </p>
                        {additionalInfo.totalAtividades &&
                          additionalInfo.totalAtividades > 0 && (
                            <p className="text-xs text-gray-500">
                              {(
                                ((additionalInfo.atividadesConcluidas || 0) /
                                  additionalInfo.totalAtividades) *
                                100
                              ).toFixed(1)}
                              % do total
                            </p>
                          )}
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>

                  {/* Atividades Em Andamento */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Atividades Em Andamento
                        </p>
                        <p className="text-2xl font-bold text-orange-600">
                          {additionalInfo.atividadesCriticas || 0}
                        </p>
                        {additionalInfo.totalAtividades &&
                          additionalInfo.totalAtividades > 0 && (
                            <p className="text-xs text-gray-500">
                              {(
                                ((additionalInfo.atividadesCriticas || 0) /
                                  additionalInfo.totalAtividades) *
                                100
                              ).toFixed(1)}
                              % do total
                            </p>
                          )}
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gráfico */}
          <div className="h-96">
            <Line ref={chartRef} data={chartData} options={options} />
          </div>

          {/* Estatísticas das Categorias */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {data.map((area, index) => {
              const color = enhancedColors[index % enhancedColors.length];
              const progressoAtual = area.data[area.data.length - 1]?.y || 0;
              const progressoInicial = area.data[0]?.y || 0;
              const variacao = progressoAtual - progressoInicial;

              return (
                <div
                  key={area.name}
                  className="bg-gray-50 rounded-lg p-4 border-l-4"
                  style={{ borderLeftColor: color.border }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 text-sm truncate">
                      {area.name}
                    </h4>
                    <span
                      className="text-lg font-bold"
                      style={{ color: color.border }}
                    >
                      {progressoAtual}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{area.data.length} pontos</span>
                    <span
                      className={`font-medium ${variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {variacao >= 0 ? '+' : ''}
                      {variacao}%
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${progressoAtual}%`,
                        backgroundColor: color.border,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default EvolutionChart;
