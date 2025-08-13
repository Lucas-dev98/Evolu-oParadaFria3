import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Target,
  Calendar,
  Activity,
  ChevronRight,
  Info,
} from 'lucide-react';
import { EventArea } from '../types';
import { useThemeClasses } from '../contexts/ThemeContext';

interface AreaCardEnhancedProps {
  area: EventArea;
  onClick: () => void;
  showTrend?: boolean;
  showMiniChart?: boolean;
  layout?: 'card' | 'compact' | 'detailed';
}

const AreaCardEnhanced: React.FC<AreaCardEnhancedProps> = ({
  area,
  onClick,
  showTrend = true,
  showMiniChart = true,
  layout = 'card',
}) => {
  const themeClasses = useThemeClasses();
  const [isHovered, setIsHovered] = useState(false);

  const progressPercentage = area.currentOccupancy;

  // Calcular tendência baseada nos dados de evolução
  const getTrend = () => {
    if (area.evolution.length < 2) return { direction: 'stable', value: 0 };

    const recent = area.evolution.slice(-3);
    const oldest = recent[0];
    const newest = recent[recent.length - 1];
    const change = newest.occupancy - oldest.occupancy;

    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      value: Math.abs(change),
    };
  };

  const trend = getTrend();

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'from-green-500 to-emerald-600';
    if (percentage >= 75) return 'from-blue-500 to-cyan-600';
    if (percentage >= 50) return 'from-yellow-500 to-orange-600';
    if (percentage >= 25) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-50 border-green-200';
    if (percentage >= 75) return 'bg-blue-50 border-blue-200';
    if (percentage >= 50) return 'bg-yellow-50 border-yellow-200';
    if (percentage >= 25) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getCategoryIcon = (areaName: string) => {
    if (areaName.includes('Logística')) return '🚛';
    if (areaName.includes('Refratário')) return '🧱';
    if (areaName.includes('Elétrica')) return '⚡';
    if (areaName.includes('Mecânica')) return '⚙️';
    if (areaName.includes('Preparação')) return '🏗️';
    if (areaName.includes('Barramentos')) return '🔌';
    if (areaName.includes('Soldagem')) return '🔥';
    if (areaName.includes('Tubulação')) return '🔧';
    if (areaName.includes('Instrumentação')) return '📡';
    return '⚡';
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'normal':
        return {
          text: 'No Prazo',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
        };
      case 'warning':
        return {
          text: 'Atenção',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertTriangle,
        };
      case 'critical':
        return {
          text: 'Crítico',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
        };
      default:
        return {
          text: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Info,
        };
    }
  };

  const statusInfo = getStatusInfo(area.status);
  const StatusIcon = statusInfo.icon;

  // Mini chart data - últimos 7 pontos
  const miniChartData = area.evolution.slice(-7);

  if (layout === 'compact') {
    return (
      <div
        className={`
          ${themeClasses.card} rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 
          hover:shadow-lg hover:-translate-y-1 ${getProgressBgColor(progressPercentage)}
        `}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getCategoryIcon(area.name)}</div>
            <div>
              <h3
                className={`font-semibold text-sm ${themeClasses.textPrimary}`}
              >
                {area.name}
              </h3>
              <p className={`text-xs ${themeClasses.textSecondary}`}>
                {progressPercentage}% completo
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {showTrend && (
              <div className="flex items-center space-x-1">
                {trend.direction === 'up' && (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                )}
                {trend.direction === 'down' && (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                {trend.direction === 'stable' && (
                  <Activity className="w-4 h-4 text-gray-400" />
                )}
              </div>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'detailed') {
    return (
      <div
        className={`
          ${themeClasses.card} rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 
          hover:shadow-xl hover:-translate-y-2 ${getProgressBgColor(progressPercentage)}
          ${isHovered ? 'ring-2 ring-blue-300' : ''}
        `}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">
              {getCategoryIcon(area.name)}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${themeClasses.textPrimary}`}>
                {area.name}
              </h3>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                {area.category}
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}
          >
            <div className="flex items-center space-x-1">
              <StatusIcon className="w-3 h-3" />
              <span>{statusInfo.text}</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-sm font-medium ${themeClasses.textSecondary}`}
            >
              Progresso Geral
            </span>
            <span className={`text-2xl font-bold ${themeClasses.textPrimary}`}>
              {progressPercentage}%
            </span>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor(progressPercentage)} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="w-4 h-4 text-blue-500" />
              <span className={`text-xs ${themeClasses.textSecondary}`}>
                Meta
              </span>
            </div>
            <p className={`text-lg font-bold ${themeClasses.textPrimary}`}>
              {area.capacity}
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-green-500" />
              <span className={`text-xs ${themeClasses.textSecondary}`}>
                Atual
              </span>
            </div>
            <p className={`text-lg font-bold ${themeClasses.textPrimary}`}>
              {area.currentOccupancy}
            </p>
          </div>
        </div>

        {/* Trend and Mini Chart */}
        <div className="flex items-center justify-between">
          {showTrend && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {trend.direction === 'up' && (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                )}
                {trend.direction === 'down' && (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                {trend.direction === 'stable' && (
                  <Activity className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-sm ${themeClasses.textSecondary}`}>
                  {trend.direction === 'up' && '+'}
                  {trend.direction === 'down' && '-'}
                  {trend.value > 0 ? trend.value.toFixed(1) : 'Estável'}
                </span>
              </div>
            </div>
          )}

          {showMiniChart && miniChartData.length > 1 && (
            <div className="flex items-end space-x-1 h-8">
              {miniChartData.map((point, index) => (
                <div
                  key={index}
                  className="w-1 bg-blue-300 rounded-t"
                  style={{
                    height: `${Math.max((point.occupancy / Math.max(...miniChartData.map((p) => p.occupancy))) * 100, 10)}%`,
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Action Indicator */}
        <div className="flex items-center justify-center mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-blue-600">
            <span className="text-sm font-medium">Ver Detalhes</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  // Default card layout
  return (
    <div
      className={`
        ${themeClasses.card} rounded-xl shadow-md p-6 cursor-pointer transition-all duration-300 
        hover:shadow-xl hover:-translate-y-1 ${themeClasses.cardHover}
        ${isHovered ? 'ring-2 ring-blue-300' : ''}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xl">
            {getCategoryIcon(area.name)}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
              {area.name}
            </h3>
            <span className={`text-sm ${themeClasses.textSecondary}`}>
              {area.category}
            </span>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
        >
          <div className="flex items-center space-x-1">
            <StatusIcon className="w-3 h-3" />
            <span>{statusInfo.text}</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-blue-500" />
            <span className={`text-sm ${themeClasses.textSecondary}`}>
              Progresso
            </span>
          </div>
          <span className={`text-sm font-bold ${themeClasses.textPrimary}`}>
            {progressPercentage}%
          </span>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor(progressPercentage)} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div
            className={`flex items-center space-x-1 ${themeClasses.textSecondary}`}
          >
            <Target size={12} />
            <span>Meta: {area.capacity}</span>
          </div>
          <div
            className={`flex items-center space-x-1 ${themeClasses.textSecondary}`}
          >
            <Users size={12} />
            <span>Atual: {area.currentOccupancy}</span>
          </div>
        </div>

        {/* Trend */}
        {showTrend && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {trend.direction === 'up' && (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
              {trend.direction === 'down' && (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              {trend.direction === 'stable' && (
                <Activity className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-xs ${themeClasses.textSecondary}`}>
                Tendência:{' '}
                {trend.direction === 'up'
                  ? 'Crescendo'
                  : trend.direction === 'down'
                    ? 'Declinando'
                    : 'Estável'}
              </span>
            </div>

            {showMiniChart && miniChartData.length > 1 && (
              <div className="flex items-end space-x-px h-6">
                {miniChartData.slice(-5).map((point, index) => (
                  <div
                    key={index}
                    className="w-1 bg-blue-300 rounded-t"
                    style={{
                      height: `${Math.max((point.occupancy / Math.max(...miniChartData.map((p) => p.occupancy))) * 100, 20)}%`,
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaCardEnhanced;
