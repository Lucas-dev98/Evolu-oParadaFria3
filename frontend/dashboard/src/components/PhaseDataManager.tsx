import React, { useState } from 'react';
import { Settings, AlertCircle, Activity, PlayCircle } from 'lucide-react';
import PhaseFileUpload from './PhaseFileUpload';
import { useTheme, useThemeClasses } from '../contexts/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';

interface PhaseDataManagerProps {
  onPhasesDataUpdated: (phasesData: Record<string, any>) => void;
}

const PhaseDataManager: React.FC<PhaseDataManagerProps> = ({
  onPhasesDataUpdated,
}) => {
  const { isDark } = useTheme();
  const themeClasses = useThemeClasses();
  const notifications = useNotifications();

  const [selectedPhase, setSelectedPhase] = useState('preparacao');
  const [phasesData, setPhasesData] = useState<Record<string, any>>({});

  const phases = [
    {
      id: 'preparacao',
      name: 'Preparação',
      icon: Settings,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      id: 'parada',
      name: 'Parada',
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      id: 'manutencao',
      name: 'Manutenção',
      icon: Activity,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      id: 'partida',
      name: 'Partida',
      icon: PlayCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
  ];

  const handlePhaseDataLoaded = (phaseId: string, data: any) => {
    const updatedPhasesData = {
      ...phasesData,
      [phaseId]: data,
    };

    setPhasesData(updatedPhasesData);
    onPhasesDataUpdated(updatedPhasesData);

    // Salvar no localStorage
    localStorage.setItem('phases_data_all', JSON.stringify(updatedPhasesData));
  };

  const getPhaseDataCount = (phaseId: string) => {
    const data = localStorage.getItem(`phase_data_${phaseId}`);
    if (!data) return 0;

    try {
      const parsed = JSON.parse(data);
      return parsed.activities?.length || 0;
    } catch {
      return 0;
    }
  };

  return (
    <div className={`space-y-6`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${themeClasses.textPrimary}`}>
          Gerenciamento de Dados por Fase
        </h2>
        <p className={`${themeClasses.textSecondary}`}>
          Carregue os dados específicos de cada fase da parada de usina
        </p>
      </div>

      {/* Cards de Seleção de Fase */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {phases.map((phase) => {
          const PhaseIcon = phase.icon;
          const dataCount = getPhaseDataCount(phase.id);
          const isSelected = selectedPhase === phase.id;

          return (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(phase.id)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${
                  isSelected
                    ? `border-blue-500 ${phase.bgColor}`
                    : `border-gray-200 dark:border-gray-700 ${themeClasses.card} hover:border-gray-300 dark:hover:border-gray-600`
                }
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${isSelected ? 'bg-white dark:bg-gray-800' : phase.bgColor}`}
                >
                  <PhaseIcon className={`w-5 h-5 ${phase.color}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${themeClasses.textPrimary}`}>
                    {phase.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${themeClasses.textSecondary}`}>
                      {dataCount} atividades
                    </span>
                    {dataCount > 0 && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Upload Component para Fase Selecionada */}
      <PhaseFileUpload
        selectedPhase={selectedPhase}
        onPhaseDataLoaded={handlePhaseDataLoaded}
      />

      {/* Resumo dos Dados Carregados */}
      <div
        className={`p-6 rounded-lg border ${themeClasses.card} ${themeClasses.shadow}`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${themeClasses.textPrimary}`}
        >
          Resumo dos Dados Carregados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {phases.map((phase) => {
            const PhaseIcon = phase.icon;
            const dataCount = getPhaseDataCount(phase.id);
            const hasData = dataCount > 0;

            return (
              <div
                key={phase.id}
                className={`
                  p-4 rounded-lg border
                  ${
                    hasData
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${hasData ? 'bg-green-500' : 'bg-gray-400'}`}
                  >
                    <PhaseIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className={`font-medium ${themeClasses.textPrimary}`}>
                      {phase.name}
                    </h4>
                    <p
                      className={`text-sm ${hasData ? 'text-green-600 dark:text-green-400' : themeClasses.textSecondary}`}
                    >
                      {hasData ? `${dataCount} atividades` : 'Sem dados'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            Total de atividades carregadas:{' '}
            {phases.reduce(
              (total, phase) => total + getPhaseDataCount(phase.id),
              0
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhaseDataManager;
