import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useThemeClasses } from '../contexts/ThemeContext';
import { LogIn, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const themeClasses = useThemeClasses();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        setUsername('');
        setPassword('');
        onClose();
      } else {
        setError('Credenciais inválidas. Tente novamente.');
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    {
      label: 'Administrador',
      username: process.env.REACT_APP_ADMIN_USERNAME || 'admin',
      password: process.env.REACT_APP_ADMIN_PASSWORD || 'admin123',
      role: 'Acesso completo',
    },
    {
      label: 'Supervisor',
      username: process.env.REACT_APP_SUPER_USERNAME || 'supervisor',
      password: process.env.REACT_APP_SUPER_PASSWORD || 'super123',
      role: 'Acesso completo',
    },
    {
      label: 'Visitante',
      username: process.env.REACT_APP_GUEST_USERNAME || 'guest',
      password: process.env.REACT_APP_GUEST_PASSWORD || 'guest123',
      role: 'Apenas visualização',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-lg shadow-xl max-w-md w-full ${themeClasses.card}`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg`}>
              <LogIn className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2
                className={`text-xl font-semibold ${themeClasses.textPrimary}`}
              >
                Login do Sistema
              </h2>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                Acesse com suas credenciais
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}
              >
                Usuário
              </label>
              <div className="relative">
                <User
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textTertiary}`}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input} ${themeClasses.inputFocus}`}
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}
              >
                Senha
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textTertiary}`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input} ${themeClasses.inputFocus}`}
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textTertiary} hover:${themeClasses.textSecondary}`}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${themeClasses.textSecondary} ${themeClasses.bgTertiary} hover:${themeClasses.cardHover}`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>

          {/* Credenciais de demonstração */}
          <div className={`mt-6 pt-6 border-t ${themeClasses.border}`}>
            <h3
              className={`text-sm font-medium ${themeClasses.textPrimary} mb-3`}
            >
              Credenciais de Demonstração:
            </h3>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${themeClasses.bgSecondary}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div
                        className={`font-medium text-sm ${themeClasses.textPrimary}`}
                      >
                        {cred.label}
                      </div>
                      <div className={`text-xs ${themeClasses.textSecondary}`}>
                        {cred.role}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername(cred.username);
                        setPassword(cred.password);
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Usar
                    </button>
                  </div>
                  <div className={`text-xs ${themeClasses.textTertiary} mt-1`}>
                    {cred.username} / {cred.password}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
