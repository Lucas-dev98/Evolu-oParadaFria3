import React from 'react';
import {
  ChevronRight,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Settings,
  Power,
  Wrench,
  Play,
} from 'lucide-react';
import { Phase, PhaseType } from '../types/phases';
import { useThemeClasses } from '../contexts/ThemeContext';

interface PhasesNavigationProps {
  phases: Phase[];
  currentPhase: PhaseType;
  onPhaseSelect: (phaseId: PhaseType) => void;
}

const PhasesNavigation: React.FC<PhasesNavigationProps> = ({
  phases,
  currentPhase,
  onPhaseSelect,
}) => {
  const themeClasses = useThemeClasses();

  // Log para debug
  React.useEffect(() => {
    console.log(
      '🎨 PhasesNavigation renderizado com fases:',
      phases.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        progress: p.progress,
        completedActivities: p.completedActivities,
        activities: p.activities,
      }))
    );
  }, [phases]);

  const getPhaseIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Settings: <Settings className="w-8 h-8" />,
      Power: <Power className="w-8 h-8" />,
      Wrench: <Wrench className="w-8 h-8" />,
      Play: <Play className="w-8 h-8" />,
      '⚙️': <Settings className="w-8 h-8" />,
      '⚡': <Power className="w-8 h-8" />,
      '🔧': <Wrench className="w-8 h-8" />,
      '▶️': <Play className="w-8 h-8" />,
    };
    return iconMap[iconName] || <Settings className="w-8 h-8" />;
  };

  const getStatusIcon = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'in-progress':
        return <PlayCircle className="w-5 h-5 text-orange-500" />;
      case 'not-started':
        return <PauseCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'active':
        return 'Ativa';
      case 'in-progress':
        return 'Em Andamento';
      case 'not-started':
        return 'Não Iniciada';
      default:
        return 'Pendente';
    }
  };

  return (
    <div
      className={`${themeClasses.bgPrimary} ${themeClasses.border} rounded-lg shadow-lg p-6 mb-8`}
    >
      <h2
        className={`text-2xl font-bold ${themeClasses.textPrimary} mb-6 text-center`}
      >
        Fases da Parada de Usina
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {phases.map((phase, index) => (
          <div key={phase.id} className="relative">
            <button
              onClick={() => onPhaseSelect(phase.id)}
              className={`w-full transition-all duration-300 hover:scale-105 ${
                phase.id === currentPhase
                  ? `${phase.bgColor} ${phase.borderColor} border-2 shadow-lg ring-2 ring-blue-300`
                  : `${themeClasses.bgSecondary} ${themeClasses.border} border hover:shadow-md`
              } rounded-lg p-4`}
            >
              {/* Ícone e Título */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`${phase.color} flex items-center justify-center`}
                  >
                    {getPhaseIcon(phase.icon)}
                  </div>
                  <div className="text-left">
                    <h3
                      className={`font-bold text-lg ${
                        phase.id === currentPhase
                          ? phase.color
                          : themeClasses.textPrimary
                      }`}
                    >
                      {phase.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(phase.status)}
                      <span className={`text-xs ${themeClasses.textSecondary}`}>
                        {getStatusText(phase.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <p
                className={`text-sm ${themeClasses.textSecondary} mb-3 text-left`}
              >
                {phase.description}
              </p>

              {/* Estatísticas */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={themeClasses.textSecondary}>Progresso:</span>
                  <span
                    className={`font-semibold ${
                      phase.id === currentPhase
                        ? phase.color
                        : themeClasses.textPrimary
                    }`}
                  >
                    {phase.progress}%
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className={themeClasses.textSecondary}>
                    Atividades:
                  </span>
                  <span
                    className={`font-semibold ${
                      phase.id === currentPhase
                        ? phase.color
                        : themeClasses.textPrimary
                    }`}
                  >
                    {phase.completedActivities}/{phase.activities}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className={themeClasses.textSecondary}>Duração:</span>
                  <span
                    className={`font-semibold ${
                      phase.id === currentPhase
                        ? phase.color
                        : themeClasses.textPrimary
                    }`}
                  >
                    {phase.estimatedDuration} dias
                  </span>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      phase.status === 'completed'
                        ? 'bg-green-500'
                        : phase.status === 'active' ||
                            phase.status === 'in-progress'
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                    }`}
                    style={{ width: `${phase.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Indicador de fase atual */}
              {phase.id === currentPhase && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  ATUAL
                </div>
              )}
            </button>

            {/* Seta conectora (exceto na última fase) */}
            {index < phases.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                <ChevronRight
                  className={`w-6 h-6 ${themeClasses.textSecondary}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Timeline visual para mobile */}
      <div className="lg:hidden mt-6">
        <div className="flex justify-between items-center">
          {phases.map((phase, index) => (
            <div key={phase.id} className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full ${
                  phase.status === 'completed'
                    ? 'bg-green-500'
                    : phase.status === 'active' ||
                        phase.status === 'in-progress'
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                }`}
              ></div>
              {index < phases.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs">
          {phases.map((phase) => (
            <span
              key={phase.id}
              className={`${themeClasses.textSecondary} text-center max-w-16`}
            >
              {phase.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhasesNavigation;
