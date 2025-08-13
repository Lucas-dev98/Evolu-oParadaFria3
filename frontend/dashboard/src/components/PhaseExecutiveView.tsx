import React from 'react';
import { useThemeClasses } from '../contexts/ThemeContext';
import {
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Timer,
  Activity,
  Clock,
  BarChart3,
  Eye,
} from 'lucide-react';

interface PhaseData {
  id: string;
  name: string;
  progress: number;
  activities: number;
  completedActivities: number;
  delayedActivities: number;
  criticalActivities: number;
  onTimeActivities: number;
  advancedActivities: number;
  estimatedEnd: string;
  daysRemaining: number;
  totalTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  categories: {
    name: string;
    delayed: number;
    critical: number;
    progress: number;
    color?: string;
  }[];
}

interface PhaseExecutiveViewProps {
  phaseData: PhaseData;
  onDetailsClick?: (category: string) => void;
}

const PhaseExecutiveView: React.FC<PhaseExecutiveViewProps> = ({
  phaseData,
  onDetailsClick,
}) => {
  const themeClasses = useThemeClasses();

  const statusCards = [
    {
      title: 'Progresso Geral',
      value: `${phaseData.progress.toFixed(1)}%`,
      icon: <Target className="w-6 h-6" />,
      color: 'text-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      isMain: true,
    },
    {
      title: 'Concluídas',
      value: phaseData.completedActivities,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-600',
      bgGradient: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-200',
    },
    {
      title: 'Críticas',
      value: phaseData.criticalActivities,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-red-600',
      bgGradient: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200',
    },
    {
      title: 'Atrasadas',
      value: phaseData.delayedActivities,
      icon: <Timer className="w-6 h-6" />,
      color: 'text-orange-600',
      bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
    },
    {
      title: 'Em Dia',
      value: phaseData.onTimeActivities,
      icon: <Activity className="w-6 h-6" />,
      color: 'text-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Adiantadas',
      value: phaseData.advancedActivities,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-purple-600',
      bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <div className={`${themeClasses.bgApp} space-y-6`}>
      {/* Header da Fase */}
      <div
        className={`${themeClasses.card} ${themeClasses.shadow} p-6 rounded-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className={`text-2xl font-bold ${themeClasses.textPrimary} mb-1`}
            >
              {phaseData.name}
            </h2>
            <p className={`${themeClasses.textSecondary} text-sm`}>
              Visão Executiva do Cronograma
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
            ATENÇÃO
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Status do Projeto</h3>
        </div>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        {statusCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgGradient} ${card.borderColor} border rounded-lg p-4 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg`}
          >
            <div className={`${card.color} mb-2 flex justify-center`}>
              {card.icon}
            </div>
            <div className={`text-2xl font-bold ${card.color} mb-1`}>
              {card.isMain ? card.value : card.value}
            </div>
            <div
              className={`text-xs ${themeClasses.textSecondary} font-medium`}
            >
              {card.title}
            </div>
          </div>
        ))}
      </div>

      {/* Atividades Principais */}
      <div
        className={`${themeClasses.card} ${themeClasses.shadow} p-6 rounded-lg`}
      >
        <h3 className={`text-xl font-bold ${themeClasses.textPrimary} mb-4`}>
          Atividades Principais
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {phaseData.categories.map((category, index) => (
            <div
              key={index}
              className={`${themeClasses.bgSecondary} border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer`}
              onClick={() => onDetailsClick?.(category.name)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-semibold ${themeClasses.textPrimary}`}>
                  {category.name}
                </h4>
                <button className="text-blue-600 hover:text-blue-800 transition-colors">
                  <Eye size={16} />
                </button>
              </div>

              {category.delayed > 0 && (
                <div className="text-red-600 text-sm mb-1">
                  {category.delayed} atrasadas
                </div>
              )}
              {category.critical > 0 && (
                <div className="text-orange-600 text-sm mb-1">
                  {category.critical} críticas
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <div
                  className={`text-2xl font-bold ${category.progress === 100 ? 'text-green-600' : 'text-blue-600'}`}
                >
                  {category.progress}%
                </div>
                <span className="text-xs text-gray-500">
                  {category.progress === 100 ? 'Concluída' : 'Em andamento'}
                </span>
              </div>

              {/* Barra de progresso */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    category.progress === 100
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}
                  style={{ width: `${category.progress}%` }}
                ></div>
              </div>

              <div className="mt-2 text-right">
                <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                  Ver Detalhes
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cronograma e Estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Cronograma */}
        <div
          className={`${themeClasses.card} ${themeClasses.shadow} p-6 rounded-lg`}
        >
          <h3
            className={`text-xl font-bold ${themeClasses.textPrimary} mb-4 flex items-center`}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Cronograma
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={`${themeClasses.textSecondary} text-sm`}>
                Conclusão Prevista:
              </span>
              <span className={`${themeClasses.textPrimary} font-semibold`}>
                {phaseData.estimatedEnd}
              </span>
            </div>

            <div className="flex justify-between">
              <span className={`${themeClasses.textSecondary} text-sm`}>
                Dias Restantes:
              </span>
              <span
                className={`${themeClasses.textPrimary} font-semibold ${
                  phaseData.daysRemaining < 0
                    ? 'text-red-600'
                    : phaseData.daysRemaining < 7
                      ? 'text-orange-600'
                      : 'text-green-600'
                }`}
              >
                {phaseData.daysRemaining} dias
              </span>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div
          className={`${themeClasses.card} ${themeClasses.shadow} p-6 rounded-lg`}
        >
          <h3
            className={`text-xl font-bold ${themeClasses.textPrimary} mb-4 flex items-center`}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Estatísticas
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={`${themeClasses.textSecondary} text-sm`}>
                Total de Tarefas:
              </span>
              <span className={`${themeClasses.textPrimary} font-semibold`}>
                {phaseData.totalTasks}
              </span>
            </div>

            <div className="flex justify-between">
              <span className={`${themeClasses.textSecondary} text-sm`}>
                Em Andamento:
              </span>
              <span className={`${themeClasses.textPrimary} font-semibold`}>
                {phaseData.inProgressTasks}
              </span>
            </div>

            <div className="flex justify-between">
              <span className={`${themeClasses.textSecondary} text-sm`}>
                Pendentes:
              </span>
              <span className={`${themeClasses.textPrimary} font-semibold`}>
                {phaseData.pendingTasks}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseExecutiveView;
