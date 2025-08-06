import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        relative inline-flex items-center justify-center
        rounded-lg transition-all duration-300 p-2
        ${
          isDark
            ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300'
            : 'bg-gray-100 hover:bg-gray-200 text-orange-500'
        }
        border-2 ${isDark ? 'border-gray-600' : 'border-gray-200'}
        shadow-md hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDark ? 'focus:ring-blue-400' : 'focus:ring-blue-500'}
        transform hover:scale-105
        ${className}
      `}
      title={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
      aria-label={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Ícone do Sol */}
        <Sun
          size={iconSizes[size]}
          className={`
            absolute transition-all duration-300 transform
            ${
              isDark
                ? 'opacity-0 rotate-90 scale-0'
                : 'opacity-100 rotate-0 scale-100'
            }
          `}
        />

        {/* Ícone da Lua */}
        <Moon
          size={iconSizes[size]}
          className={`
            absolute transition-all duration-300 transform
            ${
              isDark
                ? 'opacity-100 rotate-0 scale-100'
                : 'opacity-0 -rotate-90 scale-0'
            }
          `}
        />
      </div>

      {/* Efeito de brilho */}
      <div
        className={`
        absolute inset-0 rounded-lg transition-opacity duration-300
        ${
          isDark
            ? 'bg-gradient-to-r from-yellow-400/10 to-orange-400/10'
            : 'bg-gradient-to-r from-blue-400/10 to-purple-400/10'
        }
        ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}
      `}
      />
    </button>
  );
};

export default ThemeToggle;
