import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
} from 'lucide-react';

interface ModernKPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend: 'up' | 'down' | 'stable' | 'warning';
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red';
}

const ModernKPICard: React.FC<ModernKPICardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'blue',
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-accent-green" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-accent-yellow" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-gradient-to-br from-accent-green/10 to-accent-green/5',
          border: 'border-accent-green/20',
          icon: 'text-accent-green',
          accent: 'accent-green',
        };
      case 'orange':
        return {
          bg: 'bg-gradient-to-br from-accent-orange/10 to-accent-orange/5',
          border: 'border-accent-orange/20',
          icon: 'text-accent-orange',
          accent: 'accent-orange',
        };
      case 'red':
        return {
          bg: 'bg-gradient-to-br from-red-500/10 to-red-500/5',
          border: 'border-red-500/20',
          icon: 'text-red-500',
          accent: 'red-500',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-primary-500/10 to-primary-500/5',
          border: 'border-primary-500/20',
          icon: 'text-primary-500',
          accent: 'primary-500',
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div
      className={`
        relative p-6 rounded-modern-lg border-2 transition-all duration-300
        ${colorClasses.bg} ${colorClasses.border}
        hover:shadow-modern-lg hover:scale-[1.02] hover:-translate-y-1
        dark:bg-gray-800/50 dark:border-gray-700/50
        group cursor-pointer
      `}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-modern-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-modern-md ${colorClasses.bg} ${colorClasses.icon}`}
          >
            {icon}
          </div>
          <div className="flex items-center gap-1">{getTrendIcon()}</div>
        </div>

        {/* Main value */}
        <div className="mb-2">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {value}
          </h3>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {title}
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>

        {/* Progress indicator (subtle) */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div
              className={`h-1 rounded-full bg-${colorClasses.accent} transition-all duration-500`}
              style={{ width: '75%' }}
            />
          </div>
        </div>
      </div>

      {/* Subtle animation dot */}
      <div
        className={`absolute top-4 right-4 w-2 h-2 bg-${colorClasses.accent} rounded-full animate-pulse-soft opacity-60`}
      />
    </div>
  );
};

export default ModernKPICard;
