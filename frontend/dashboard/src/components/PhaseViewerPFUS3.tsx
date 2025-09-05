import React, { useState, useEffect } from 'react';
import { Phase } from '../types/phases';
import { processarCronogramaOperacional } from '../utils/cronogramaOperacionalProcessorPFUS3';

interface PhaseViewerProps {
  className?: string;
  externalPhases?: Phase[]; // Fases externas opcional
}

export const PhaseViewerPFUS3: React.FC<PhaseViewerProps> = ({
  className = '',
  externalPhases,
}) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  useEffect(() => {
    // Se há fases externas, use-as
    if (externalPhases && externalPhases.length > 0) {
      setPhases(externalPhases);
      setLoading(false);
      return;
    }

    // Senão, tente carregar dados salvos
    const savedPhases = localStorage.getItem('pfus3_phases');
    if (savedPhases) {
      try {
        const parsedPhases = JSON.parse(savedPhases);
        setPhases(parsedPhases);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Erro ao carregar fases salvas:', error);
      }
    }

    // Como último recurso, carregue do CSV público
    loadPhaseData();
  }, [externalPhases]);

  const loadPhaseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/report/250820 - Report PFUS3.csv');
      if (!response.ok) {
        throw new Error('Falha ao carregar cronograma operacional');
      }

      const csvText = await response.text();
      const processedData = await processarCronogramaOperacional(csvText);

      setPhases(processedData.phases);
    } catch (err) {
      console.error('Erro ao carregar dados das fases:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'in-progress':
        return 'Em Andamento';
      case 'not-started':
        return 'Não Iniciada';
      default:
        return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">
            Carregando dados das fases...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro ao carregar dados
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadPhaseData}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Fases da Parada PFUS3
        </h2>
        <p className="text-gray-600">
          Acompanhe o progresso das fases de parada, manutenção e partida
        </p>
      </div>

      <div className="space-y-6">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{phase.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {phase.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{phase.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}
                  >
                    {getStatusText(phase.status)}
                  </span>
                  <button
                    onClick={() =>
                      setExpandedPhase(
                        expandedPhase === phase.id ? null : phase.id
                      )
                    }
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className={`w-5 h-5 transform transition-transform ${
                        expandedPhase === phase.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progresso</span>
                  <span>{phase.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${phase.bgColor.replace('bg-', 'bg-').replace('-50', '-500')}`}
                    style={{ width: `${phase.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {phase.activities}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total de Atividades
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {phase.completedActivities}
                  </div>
                  <div className="text-sm text-gray-600">Concluídas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {phase.inProgressTasks}
                  </div>
                  <div className="text-sm text-gray-600">Em Andamento</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {phase.criticalActivities}
                  </div>
                  <div className="text-sm text-gray-600">Críticas</div>
                </div>
              </div>

              {/* Informações de cronograma */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Início:</span>
                  <span className="ml-2 text-gray-600">
                    {phase.startDate?.toLocaleDateString('pt-BR') ||
                      'Não definido'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Fim:</span>
                  <span className="ml-2 text-gray-600">
                    {phase.endDate?.toLocaleDateString('pt-BR') ||
                      'Não definido'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Duração:</span>
                  <span className="ml-2 text-gray-600">
                    {phase.estimatedDuration} dias
                  </span>
                </div>
              </div>
            </div>

            {/* Seção expandida - placeholder para futuras funcionalidades */}
            {expandedPhase === phase.id && (
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Detalhes da Fase
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Atividades em atraso:
                    </span>
                    <span className="ml-2 text-red-600">
                      {phase.delayedActivities}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Atividades no prazo:
                    </span>
                    <span className="ml-2 text-green-600">
                      {phase.onTimeActivities}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Dias restantes:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {phase.daysRemaining}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Fim estimado:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {phase.estimatedEnd}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {phases.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhuma fase encontrada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Não foi possível carregar as fases do cronograma operacional.
          </p>
        </div>
      )}
    </div>
  );
};
