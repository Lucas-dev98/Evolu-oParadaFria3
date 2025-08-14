import React from 'react';
import {
  BarChart3,
  Calendar,
  User,
  Upload,
  RefreshCw,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { useThemeClasses } from '../contexts/ThemeContext';

interface TopNavigationProps {
  isAuthenticated: boolean;
  user: { username: string } | null;
  isAdmin: boolean;
  modoCronograma: boolean;
  modoAnalytics: boolean;
  existeCronogramaLocal: boolean;
  resumoCronograma: any; // para verificar se tem dados de cronograma
  onAtividadesClick: () => void;
  onAnalyticsClick: () => void;
  onDashboardClick: () => void;
  onGerenciarDadosClick: () => void;
  onLimparDadosClick: () => void;
  onAtualizarClick: () => void;
  isLoading: boolean;
  // Novas props para notificações
  onNotify?: (
    type: 'success' | 'info' | 'warning' | 'error',
    title: string,
    message?: string
  ) => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  isAuthenticated,
  user,
  isAdmin,
  modoCronograma,
  modoAnalytics,
  existeCronogramaLocal,
  resumoCronograma,
  onAtividadesClick,
  onAnalyticsClick,
  onDashboardClick,
  onGerenciarDadosClick,
  onLimparDadosClick,
  onAtualizarClick,
  isLoading,
  onNotify,
}) => {
  const themeClasses = useThemeClasses();

  // Verificar se tem dados de cronograma
  const temCronograma = resumoCronograma && resumoCronograma.totalTarefas > 0;

  // TEMPORÁRIO: Forçar habilitação para teste
  const temCronogramaForced = true; // Forçar true para testar navegação

  // Debug log
  console.log('🔍 TopNavigation - Status dos dados:', {
    resumoCronograma: !!resumoCronograma,
    totalTarefas: resumoCronograma?.totalTarefas || 0,
    temCronograma,
    temCronogramaForced,
    botoesHabilitados: temCronogramaForced,
  });

  // Funções melhoradas com notificações e animações
  const handleAtividadesClick = () => {
    if (!temCronogramaForced) {
      onNotify?.(
        'warning',
        'Dados não disponíveis',
        'Carregue dados de cronograma para acessar esta visualização'
      );
      return;
    }
    onAtividadesClick();
    onNotify?.(
      'success',
      'Visualização de Atividades',
      'Mostrando atividades organizadas por frente de trabalho'
    );

    // Scroll suave para a seção principal
    setTimeout(() => {
      const mainContent = document.querySelector('main');
      mainContent?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAnalyticsClick = () => {
    if (!temCronogramaForced) {
      onNotify?.(
        'warning',
        'Dados não disponíveis',
        'Carregue dados de cronograma para acessar o Analytics'
      );
      return;
    }
    onAnalyticsClick();
    onNotify?.(
      'success',
      'Analytics Ativado',
      'Visualizando KPIs e análises avançadas'
    );

    // Scroll suave para a seção principal
    setTimeout(() => {
      const mainContent = document.querySelector('main');
      mainContent?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDashboardClick = () => {
    onDashboardClick();
    if (modoCronograma) {
      onNotify?.(
        'info',
        'Modo Dashboard',
        'Alternando para visualização de dashboard'
      );
    } else {
      onNotify?.(
        'info',
        'Modo Cronograma',
        'Alternando para visualização de cronograma'
      );
    }

    // Scroll para o topo
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleGerenciarDadosClick = () => {
    onGerenciarDadosClick();
    onNotify?.(
      'info',
      'Painel de Administração',
      'Abrindo gerenciador de dados'
    );
  };

  const handleLimparDadosClick = () => {
    if (
      window.confirm('Tem certeza que deseja limpar todos os dados salvos?')
    ) {
      onLimparDadosClick();
      onNotify?.(
        'success',
        'Dados Limpos',
        'Todos os dados salvos foram removidos'
      );
    }
  };

  const handleAtualizarClick = () => {
    onAtualizarClick();
    onNotify?.('info', 'Atualizando...', 'Recarregando dados da aplicação');
  };

  return (
    <div className={`${themeClasses.card} ${themeClasses.border} border-b`}>
      {/* Indicador de Status do Analytics */}
      {modoCronograma && !resumoCronograma && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 text-sm">
              <BarChart3 size={16} className="text-blue-500" />
              <span className="text-blue-700 dark:text-blue-300">
                <strong>Modo Analytics ativo:</strong> Carregue dados de
                cronograma para acessar todas as funcionalidades de análise
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 py-2 sm:py-0 min-h-[3rem] sm:h-12 lg:h-16">
          {/* Welcome section */}
          <div className="flex items-center space-x-2 sm:space-x-6 min-w-0 flex-shrink-0">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <User
                size={16}
                className={`${themeClasses.textSecondary} sm:w-5 sm:h-5`}
              />
              <span
                className={`text-xs sm:text-sm font-medium ${themeClasses.textPrimary} truncate`}
              >
                <span className="sm:hidden">
                  {isAuthenticated ? user?.username || 'Usuário' : 'Visitante'}
                </span>
                <span className="hidden sm:inline">
                  {isAuthenticated
                    ? `Bem-vindo, ${user?.username}!`
                    : 'Bem-vindo, visitante!'}
                </span>
              </span>
            </div>

            {/* View Toggle Buttons - Simplificado para apenas 2 modos */}
            <div className="flex items-center space-x-1 scale-90 sm:scale-100">
              <button
                onClick={handleAtividadesClick}
                disabled={!temCronogramaForced}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-1 touch-target ${
                  !modoAnalytics && modoCronograma
                    ? `bg-blue-500 text-white shadow-md`
                    : temCronogramaForced
                      ? `${themeClasses.textSecondary} hover:${themeClasses.textPrimary} hover:bg-gray-100 dark:hover:bg-gray-800`
                      : `${themeClasses.textTertiary} cursor-not-allowed opacity-50`
                }`}
              >
                <span>Atividades</span>
                {!modoAnalytics && modoCronograma && (
                  <ChevronRight size={12} className="animate-pulse" />
                )}
              </button>

              {/* Botão Analytics */}
              {modoCronograma && (
                <button
                  onClick={handleAnalyticsClick}
                  disabled={!temCronogramaForced}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-1 touch-target ${
                    modoAnalytics && modoCronograma
                      ? `bg-blue-500 text-white shadow-md`
                      : temCronogramaForced
                        ? `${themeClasses.textSecondary} hover:${themeClasses.textPrimary} hover:bg-gray-100 dark:hover:bg-gray-800`
                        : `${themeClasses.textTertiary} cursor-not-allowed opacity-50`
                  }`}
                >
                  <BarChart3 size={12} />
                  <span>Analytics</span>
                  {modoAnalytics && modoCronograma && (
                    <ChevronRight size={12} className="animate-pulse" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons - Responsivo */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:space-x-0">
            <button
              onClick={handleDashboardClick}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105 touch-target ${
                modoCronograma
                  ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-md'
                  : 'bg-gray-500 text-white hover:bg-gray-600 shadow-md'
              }`}
            >
              <Calendar size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">
                {modoCronograma ? 'Ver Dashboard' : 'Ver Cronograma'}
              </span>
              <span className="xs:hidden">
                {modoCronograma ? 'Dashboard' : 'Cronograma'}
              </span>
            </button>

            {/* Botão Analytics - versão principal sempre visível quando há cronograma */}
            {modoCronograma && (
              <button
                onClick={handleAnalyticsClick}
                disabled={!temCronogramaForced}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105 touch-target shadow-md ${
                  modoAnalytics
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : temCronogramaForced
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                <BarChart3 size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Analytics</span>
                <span className="xs:hidden">📊</span>
                {modoAnalytics && (
                  <ChevronRight size={12} className="animate-pulse" />
                )}
              </button>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <button
                  onClick={handleGerenciarDadosClick}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm font-medium shadow-md touch-target"
                >
                  <Upload size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Gerenciar Dados</span>
                  <span className="xs:hidden">Gerenciar</span>
                </button>

                {existeCronogramaLocal && (
                  <button
                    onClick={handleLimparDadosClick}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm font-medium shadow-md touch-target"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Limpar</span>
                    <span className="sm:hidden">🗑️</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={handleAtualizarClick}
              disabled={isLoading}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm font-medium shadow-md touch-target"
            >
              <RefreshCw
                size={14}
                className={`sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              <span className="hidden xs:inline">Atualizar</span>
              <span className="xs:hidden">🔄</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
