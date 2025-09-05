import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, useThemeClasses } from '../contexts/ThemeContext';
import LoginModal from './LoginModal';
import CSVManagerModal from './CSVManagerModal';
import {
  LogIn,
  LogOut,
  User,
  Settings,
  Upload,
  Eye,
  Shield,
  Moon,
  Sun,
  Clock,
  FileText,
} from 'lucide-react';

interface HeaderProps {
  lastUpdate?: Date;
  onFilesUpdated?: () => void;
  onPFUS3PhasesUpdate?: (phases: any[]) => void;
  onPreparacaoUpdate?: (dadosPreparacao: any) => void;
}

const Header: React.FC<HeaderProps> = ({
  lastUpdate,
  onFilesUpdated,
  onPFUS3PhasesUpdate,
  onPreparacaoUpdate,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const themeClasses = useThemeClasses();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCSVManager, setShowCSVManager] = useState(false);

  const getRoleIcon = () => {
    if (!isAuthenticated) return <Eye className="w-4 h-4" />;
    return isAdmin ? (
      <Shield className="w-4 h-4" />
    ) : (
      <User className="w-4 h-4" />
    );
  };

  const getRoleLabel = () => {
    if (!isAuthenticated) return 'Visitante';
    return isAdmin ? 'Administrador' : 'Usuário';
  };

  const getRoleBadgeColor = () => {
    if (!isAuthenticated) return themeClasses.info;
    return isAdmin ? themeClasses.success : themeClasses.info;
  };

  return (
    <>
      <header
        className={`${themeClasses.bgPrimary} shadow-sm border-b ${themeClasses.border} sticky top-0 z-40`}
      >
        <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo e Título */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">
                  PF
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h1
                  className={`text-sm sm:text-xl font-semibold ${themeClasses.textPrimary} truncate`}
                >
                  <span className="sm:hidden">Dashboard PF</span>
                  <span className="hidden sm:inline">
                    Dashboard Parada Fria
                  </span>
                </h1>
                <div className="flex items-center gap-2 sm:gap-4">
                  <p
                    className={`text-xs ${themeClasses.textSecondary} hidden sm:block`}
                  >
                    Sistema de Monitoramento
                  </p>
                  {lastUpdate && (
                    <div
                      className={`flex items-center gap-1 text-xs ${themeClasses.textSecondary} hidden lg:flex`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        Atualizado: {lastUpdate.toLocaleDateString('pt-BR')} às{' '}
                        {lastUpdate.toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controles do usuário */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Badge de status do usuário - versão mobile compacta */}
              <div
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getRoleBadgeColor()}`}
              >
                {getRoleIcon()}
                <span className="hidden xs:inline">{getRoleLabel()}</span>
              </div>

              {/* Toggle de tema */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${themeClasses.textSecondary} hover:${themeClasses.textPrimary} hover:${themeClasses.bgSecondary} transition-colors touch-target`}
                title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Botão CSV Manager (para admins) - hidden em mobile */}
              {isAdmin && (
                <button
                  onClick={() => setShowCSVManager(true)}
                  className={`p-2 rounded-lg ${themeClasses.textSecondary} hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors hidden sm:block touch-target`}
                  title="Gerenciar arquivos CSV"
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Menu do usuário */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-medium">
                        {user?.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left hidden md:block">
                      <div
                        className={`text-sm font-medium ${themeClasses.textPrimary}`}
                      >
                        {user?.username}
                      </div>
                      <div className={`text-xs ${themeClasses.textTertiary}`}>
                        {user?.email}
                      </div>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div
                      className={`absolute right-0 mt-2 w-48 sm:w-56 ${themeClasses.card} rounded-lg ${themeClasses.shadowLg} z-50`}
                    >
                      <div className={`p-3 border-b ${themeClasses.border}`}>
                        <div
                          className={`font-medium ${themeClasses.textPrimary} text-sm sm:text-base`}
                        >
                          {user?.username}
                        </div>
                        <div
                          className={`text-xs sm:text-sm ${themeClasses.textTertiary}`}
                        >
                          {user?.email}
                        </div>
                        <div
                          className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}
                        >
                          {getRoleIcon()}
                          {getRoleLabel()}
                        </div>
                      </div>

                      <div className="p-1">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => {
                                setShowCSVManager(true);
                                setShowUserMenu(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 text-left ${themeClasses.textPrimary} hover:${themeClasses.bgSecondary} rounded-md`}
                            >
                              <FileText className="w-4 h-4" />
                              Gerenciar CSV
                            </button>
                            <button
                              className={`w-full flex items-center gap-3 px-3 py-2 text-left ${themeClasses.textPrimary} hover:${themeClasses.bgSecondary} rounded-md`}
                            >
                              <Upload className="w-4 h-4" />
                              Gerenciar Dados
                            </button>
                          </>
                        )}
                        <button
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left ${themeClasses.textPrimary} hover:${themeClasses.bgSecondary} rounded-md`}
                        >
                          <Settings className="w-4 h-4" />
                          Configurações
                        </button>
                        <hr className={`my-1 ${themeClasses.border}`} />
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal de Login */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Modal de Gerenciamento CSV */}
      <CSVManagerModal
        isOpen={showCSVManager}
        onClose={() => setShowCSVManager(false)}
        onFilesUpdated={onFilesUpdated}
        onPFUS3PhasesUpdate={onPFUS3PhasesUpdate}
        onPreparacaoUpdate={onPreparacaoUpdate}
      />

      {/* Overlay para fechar menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default Header;
