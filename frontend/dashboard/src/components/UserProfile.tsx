import React from 'react';
import { User, LogIn, LogOut } from 'lucide-react';

interface UserProfileProps {
  user: { username: string; role?: string } | null;
  isAuthenticated: boolean;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  isAuthenticated,
  onLoginClick,
  onLogoutClick,
}) => {
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuário';
      case 'visitor':
        return 'Visitante';
      default:
        return 'Visualizador';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
        <button
          onClick={onLoginClick}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">Fazer Login</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user?.username || 'Usuário'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getRoleLabel(user?.role)}
          </p>
        </div>
      </div>

      {onLogoutClick && (
        <button
          onClick={onLogoutClick}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Fazer logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default UserProfile;
