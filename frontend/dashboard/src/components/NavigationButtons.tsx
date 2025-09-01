import React from 'react';
import { Home, TrendingUp } from 'lucide-react';

interface NavigationButtonsProps {
  modoAnalytics: boolean;
  onDashboardClick: () => void;
  onAnalyticsClick: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  modoAnalytics,
  onDashboardClick,
  onAnalyticsClick,
}) => {
  // Prática #2: Usar props para personalizar componentes
  const getButtonClasses = (isActive: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  return (
    <div className="hidden md:flex items-center space-x-1">
      {/* Dashboard Button */}
      <button
        onClick={onDashboardClick}
        className={getButtonClasses(!modoAnalytics)}
      >
        <Home className="w-4 h-4 inline mr-2" />
        Dashboard
      </button>

      {/* Analytics Button */}
      <button
        onClick={onAnalyticsClick}
        className={getButtonClasses(modoAnalytics)}
      >
        <TrendingUp className="w-4 h-4 inline mr-2" />
        Analytics
      </button>
    </div>
  );
};

export default NavigationButtons;
