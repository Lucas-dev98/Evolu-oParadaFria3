import React, { useState } from 'react';
import { BarChart3, Menu, X } from 'lucide-react';
import { useThemeClasses } from '../contexts/ThemeContext';
import ActionButtons from './ActionButtons';
import NavigationButtons from './NavigationButtons';
import UserProfile from './UserProfile';
import StatusIndicator from './StatusIndicator';

// Prática #6: Documentar props com TypeScript (substitui PropTypes)
interface TopNavigationProps {
  isAuthenticated: boolean;
  user: { username: string; role?: string } | null;
  modoAnalytics: boolean;
  existeCronogramaLocal: boolean;
  resumoCronograma: any;
  onAnalyticsClick: () => void;
  onDashboardClick: () => void;
  onLimparDadosClick: () => void;
  onAtualizarClick: () => void;
  onCarregarCSV?: () => void;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  isLoading: boolean;
  onNotify?: (type: string, title: string, message?: string) => void;
}

// Prática #1: Dividir componentes em partes menores
// Prática #2: Usar props para personalizar componentes
const TopNavigation: React.FC<TopNavigationProps> = ({
  isAuthenticated,
  user,
  modoAnalytics,
  existeCronogramaLocal,
  resumoCronograma,
  onAnalyticsClick,
  onDashboardClick,
  onLimparDadosClick,
  onAtualizarClick,
  onCarregarCSV,
  onLoginClick,
  onLogoutClick,
  isLoading,
  onNotify,
}) => {
  const themeClasses = useThemeClasses();

  // Prática #3: Usar estados para controlar o comportamento do componente
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prática #4: Usar eventos para interagir com outros componentes
  const handleRefresh = async () => {
    try {
      onAtualizarClick();
      onNotify?.(
        'success',
        'Dados Atualizados',
        'Dashboard atualizado com sucesso'
      );
    } catch (error) {
      onNotify?.('error', 'Erro na Atualização', 'Falha ao atualizar dados');
    }
  };

  const handleLimparDados = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados?')) {
      onLimparDadosClick();
      onNotify?.('info', 'Dados Limpos', 'Todos os dados foram removidos');
    }
  };

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                Parada Fria 3
              </h1>
            </div>
          </div>

          {/* Prática #1: Componentes menores e específicos */}
          <NavigationButtons
            modoAnalytics={modoAnalytics}
            onDashboardClick={onDashboardClick}
            onAnalyticsClick={onAnalyticsClick}
          />

          {/* Action Buttons e User Profile */}
          <div className="flex items-center space-x-4">
            <ActionButtons
              onRefresh={handleRefresh}
              onCarregarCSV={onCarregarCSV}
              onLimparDados={handleLimparDados}
              isLoading={isLoading}
            />

            <UserProfile
              user={user}
              isAuthenticated={isAuthenticated}
              onLoginClick={onLoginClick}
              onLogoutClick={onLogoutClick}
            />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Prática #9: Renderização condicional */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  onDashboardClick();
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !modoAnalytics
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => {
                  onAnalyticsClick();
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  modoAnalytics
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Analytics
              </button>

              <hr className="border-gray-200 dark:border-gray-700 my-2" />

              <button
                onClick={() => {
                  onCarregarCSV?.();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
              >
                Carregar CSV
              </button>

              <button
                onClick={() => {
                  handleLimparDados();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              >
                Limpar Dados
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Indicator - Prática #1: Componente específico */}
      <StatusIndicator
        existeCronogramaLocal={existeCronogramaLocal}
        isLoading={isLoading}
        resumoCronograma={resumoCronograma}
      />
    </nav>
  );
};

export default TopNavigation;
