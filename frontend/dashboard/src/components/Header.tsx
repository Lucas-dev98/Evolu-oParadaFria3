import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, useThemeClasses } from '../contexts/ThemeContext';
import LoginModal from './LoginModal';
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
} from 'lucide-react';

interface HeaderProps {
  lastUpdate?: Date;
}

const Header: React.FC<HeaderProps> = ({ lastUpdate }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const themeClasses = useThemeClasses();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo e Título */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PF</span>
              </div>
              <div>
                <h1
                  className={`text-xl font-semibold ${themeClasses.textPrimary}`}
                >
                  Dashboard Parada Fria
                </h1>
                <div className="flex items-center gap-4">
                  <p className={`text-xs ${themeClasses.textSecondary}`}>
                    Sistema de Monitoramento
                  </p>
                  {lastUpdate && (
                    <div
                      className={`flex items-center gap-1 text-xs ${themeClasses.textSecondary}`}
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
            <div className="flex items-center gap-4">
              {/* Badge de status do usuário */}
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}
              >
                {getRoleIcon()}
                <span>{getRoleLabel()}</span>
              </div>

              {/* Toggle de tema */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${themeClasses.textSecondary} hover:${themeClasses.textPrimary} hover:${themeClasses.bgSecondary} transition-colors`}
                title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>

              {/* Menu do usuário */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-sm font-medium text-gray-700">
                        {user?.username}
                      </div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-3 border-b border-gray-100">
                        <div className="font-medium text-gray-800">
                          {user?.username}
                        </div>
                        <div className="text-sm text-gray-500">
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
                          <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md">
                            <Upload className="w-4 h-4" />
                            Gerenciar Dados
                          </button>
                        )}
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md">
                          <Settings className="w-4 h-4" />
                          Configurações
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-md"
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
