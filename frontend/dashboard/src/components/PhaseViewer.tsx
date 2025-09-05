import React, { useState, useEffect } from 'react';
import {
  PhaseData,
  ActivityItem,
  csvPhaseProcessor,
} from '../utils/csvPhaseProcessor';

interface PhaseViewerProps {
  csvData?: string;
}

interface ActivityRowProps {
  activity: ActivityItem;
  depth?: number;
}

const ActivityRow: React.FC<ActivityRowProps> = ({ activity, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = activity.children && activity.children.length > 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressColorLight = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 70) return 'bg-yellow-100';
    if (percentage >= 50) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <>
      <tr className={`hover:bg-gray-50 ${depth > 0 ? 'bg-gray-25' : ''}`}>
        <td
          className="px-6 py-3 text-sm font-medium text-gray-900"
          style={{ paddingLeft: `${24 + depth * 20}px` }}
        >
          <div className="flex items-center">
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <span className="text-gray-600">▼</span>
                ) : (
                  <span className="text-gray-600">▶</span>
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6 mr-2"></div>}
            <span>{activity.nome}</span>
          </div>
        </td>
        <td className="px-6 py-3 text-sm text-gray-500">{activity.edt}</td>
        <td className="px-6 py-3 text-sm text-gray-500">
          Nível {activity.nivel}
        </td>
        <td className="px-6 py-3 text-sm text-gray-900">
          <div className="flex items-center">
            <div
              className={`w-20 h-2 rounded-full ${getProgressColorLight(activity.percentualPlanejado)} mr-2`}
            >
              <div
                className={`h-2 rounded-full ${getProgressColor(activity.percentualPlanejado)}`}
                style={{ width: `${activity.percentualPlanejado}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">
              {activity.percentualPlanejado}%
            </span>
          </div>
        </td>
        <td className="px-6 py-3 text-sm text-gray-900">
          <div className="flex items-center">
            <div
              className={`w-20 h-2 rounded-full ${getProgressColorLight(activity.percentualRealizado)} mr-2`}
            >
              <div
                className={`h-2 rounded-full ${getProgressColor(activity.percentualRealizado)}`}
                style={{ width: `${activity.percentualRealizado}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">
              {activity.percentualRealizado}%
            </span>
          </div>
        </td>
        <td className="px-6 py-3 text-sm text-gray-500">
          {activity.dashboard === 'S' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Dashboard
            </span>
          )}
        </td>
      </tr>
      {isExpanded &&
        hasChildren &&
        activity.children!.map((child) => (
          <ActivityRow key={child.id} activity={child} depth={depth + 1} />
        ))}
    </>
  );
};

interface PhaseCardProps {
  phase: PhaseData;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ phase }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPhaseColor = (phaseId: string) => {
    switch (phaseId) {
      case 'preparacao':
        return 'bg-blue-500';
      case 'parada':
        return 'bg-orange-500';
      case 'manutencao':
        return 'bg-purple-500';
      case 'partida':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPhaseColorLight = (phaseId: string) => {
    switch (phaseId) {
      case 'preparacao':
        return 'bg-blue-50 border-blue-200';
      case 'parada':
        return 'bg-orange-50 border-orange-200';
      case 'manutencao':
        return 'bg-purple-50 border-purple-200';
      case 'partida':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`rounded-lg border-2 ${getPhaseColorLight(phase.id)} mb-6`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div
              className={`w-4 h-4 rounded-full ${getPhaseColor(phase.id)} mr-3`}
            ></div>
            <h3 className="text-xl font-semibold text-gray-900">
              {phase.name}
            </h3>
            <span className="ml-2 text-sm text-gray-500">({phase.edt})</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
          >
            {isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes'}
            {isExpanded ? (
              <span className="ml-2 text-gray-600">▼</span>
            ) : (
              <span className="ml-2 text-gray-600">▶</span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Progresso Planejado</p>
            <div className="flex items-center">
              <div className="w-32 h-3 bg-gray-200 rounded-full mr-3">
                <div
                  className={`h-3 rounded-full ${getPhaseColor(phase.id)}`}
                  style={{ width: `${phase.percentualPlanejado}%` }}
                ></div>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {phase.percentualPlanejado}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Progresso Realizado</p>
            <div className="flex items-center">
              <div className="w-32 h-3 bg-gray-200 rounded-full mr-3">
                <div
                  className={`h-3 rounded-full ${getPhaseColor(phase.id)} opacity-70`}
                  style={{ width: `${phase.percentualRealizado}%` }}
                ></div>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {phase.percentualRealizado}%
              </span>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <span className="font-medium">{phase.activities.length}</span>{' '}
          atividades principais
        </div>

        {isExpanded && (
          <div className="mt-6">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Atividade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EDT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nível
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Planejado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Realizado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {phase.activities.map((activity) => (
                    <ActivityRow key={activity.id} activity={activity} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const PhaseViewer: React.FC<PhaseViewerProps> = ({ csvData }) => {
  const [phases, setPhases] = useState<PhaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPhases = async () => {
      try {
        setLoading(true);
        setError(null);

        let dataToProcess = csvData;

        if (!dataToProcess) {
          // Try to load from public folder
          const response = await fetch('/api/csv/pfbt1');
          if (!response.ok) {
            throw new Error('Não foi possível carregar o arquivo CSV');
          }
          dataToProcess = await response.text();
        }

        const processedPhases = csvPhaseProcessor.processCSVData(dataToProcess);
        setPhases(processedPhases);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    loadPhases();
  }, [csvData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando fases...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erro ao carregar fases
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhuma fase encontrada nos dados CSV.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Fases do Projeto
            </h2>
            <p className="text-gray-600">
              Visualização detalhada das fases de preparação, parada, manutenção
              e partida
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {phases.map((phase) => (
              <div
                key={phase.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{phase.name}</h4>
                  <span className="text-xs text-gray-500">{phase.edt}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Planejado</span>
                      <span>{phase.percentualPlanejado}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${phase.percentualPlanejado}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Realizado</span>
                      <span>{phase.percentualRealizado}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${phase.percentualRealizado}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            {phases.map((phase) => (
              <PhaseCard key={phase.id} phase={phase} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseViewer;
