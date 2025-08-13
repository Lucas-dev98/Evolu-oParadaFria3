import React from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  Settings,
  Power,
  Wrench,
  Play,
} from 'lucide-react';
import { ParadaData } from '../types/phases';
import { useThemeClasses } from '../contexts/ThemeContext';

interface ParadaHeaderProps {
  paradaData: ParadaData;
}

const ParadaHeader: React.FC<ParadaHeaderProps> = ({ paradaData }) => {
  const themeClasses = useThemeClasses();

  const getPhaseIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Settings: <Settings className="w-5 h-5" />,
      Power: <Power className="w-5 h-5" />,
      Wrench: <Wrench className="w-5 h-5" />,
      Play: <Play className="w-5 h-5" />,
      '⚙️': <Settings className="w-5 h-5" />,
      '⚡': <Power className="w-5 h-5" />,
      '🔧': <Wrench className="w-5 h-5" />,
      '▶️': <Play className="w-5 h-5" />,
    };
    return iconMap[iconName] || <Settings className="w-5 h-5" />;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const diffTime = paradaData.estimatedEndDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCurrentPhase = () => {
    return paradaData.phases.find(
      (phase) => phase.id === paradaData.currentPhase
    );
  };

  const currentPhase = getCurrentPhase();

  return (
    <div
      className={`${themeClasses.bgPrimary} ${themeClasses.border} rounded-lg shadow-lg p-4 mb-6`}
    >
      {/* Título Principal */}
      <div className="text-center mb-4">
        <h1 className={`text-3xl font-bold ${themeClasses.textPrimary} mb-1`}>
          {paradaData.title}
        </h1>
        <h2 className={`text-lg ${themeClasses.textSecondary} font-medium`}>
          {paradaData.subtitle}
        </h2>
      </div>

      {/* Informações Gerais - Cards Compactos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div
          className={`${themeClasses.bgSecondary} rounded-lg p-3 text-center`}
        >
          <Calendar
            className={`w-5 h-5 mx-auto mb-1 ${themeClasses.textPrimary}`}
          />
          <div className={`text-xs ${themeClasses.textSecondary} mb-1`}>
            Início
          </div>
          <div className={`text-sm font-semibold ${themeClasses.textPrimary}`}>
            {formatDate(paradaData.startDate)}
          </div>
        </div>

        <div
          className={`${themeClasses.bgSecondary} rounded-lg p-3 text-center`}
        >
          <Clock
            className={`w-5 h-5 mx-auto mb-1 ${themeClasses.textPrimary}`}
          />
          <div className={`text-xs ${themeClasses.textSecondary} mb-1`}>
            Previsão Final
          </div>
          <div className={`text-sm font-semibold ${themeClasses.textPrimary}`}>
            {formatDate(paradaData.estimatedEndDate)}
          </div>
        </div>

        <div
          className={`${themeClasses.bgSecondary} rounded-lg p-3 text-center`}
        >
          <TrendingUp
            className={`w-5 h-5 mx-auto mb-1 ${themeClasses.textPrimary}`}
          />
          <div className={`text-xs ${themeClasses.textSecondary} mb-1`}>
            Progresso Geral
          </div>
          <div className={`text-sm font-semibold ${themeClasses.textPrimary}`}>
            {paradaData.overallProgress}%
          </div>
        </div>

        <div
          className={`${themeClasses.bgSecondary} rounded-lg p-3 text-center`}
        >
          <Activity
            className={`w-5 h-5 mx-auto mb-1 ${themeClasses.textPrimary}`}
          />
          <div className={`text-xs ${themeClasses.textSecondary} mb-1`}>
            Dias Restantes
          </div>
          <div
            className={`text-sm font-semibold ${themeClasses.textPrimary} ${getDaysRemaining() < 0 ? 'text-red-500' : ''}`}
          >
            {getDaysRemaining()} dias
          </div>
        </div>
      </div>

      {/* Fase Atual */}
      {currentPhase && (
        <div
          className={`${currentPhase.bgColor} ${currentPhase.borderColor} border-2 rounded-lg p-3`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div
                className={`${currentPhase.color} flex items-center justify-center`}
              >
                {getPhaseIcon(currentPhase.icon)}
              </div>
              <div>
                <h3 className={`font-bold text-base ${currentPhase.color}`}>
                  Fase Atual: {currentPhase.name}
                </h3>
                <p className={`text-xs ${themeClasses.textSecondary}`}>
                  {currentPhase.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${currentPhase.color}`}>
                {currentPhase.progress}%
              </div>
              <div className={`text-xs ${themeClasses.textSecondary}`}>
                {currentPhase.completedActivities}/{currentPhase.activities}{' '}
                atividades
              </div>
            </div>
          </div>

          {/* Barra de progresso da fase atual */}
          <div className="w-full bg-white rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentPhase.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Barra de progresso geral */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs font-medium ${themeClasses.textSecondary}`}>
            Progresso Geral da Parada
          </span>
          <span className={`text-xs font-bold ${themeClasses.textPrimary}`}>
            {paradaData.overallProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${paradaData.overallProgress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ParadaHeader;
