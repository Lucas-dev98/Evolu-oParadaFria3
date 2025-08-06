import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'pfus3_theme_preference';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Verificar localStorage primeiro
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }

    // Verificar preferência do sistema
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }

    // Padrão é modo claro
    return 'light';
  });

  useEffect(() => {
    // Salvar preferência no localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Aplicar classes CSS no documento
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Atualizar meta theme-color para mobile
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#1f2937' : '#ffffff'
      );
    }
  }, [theme]);

  // Escutar mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Só aplicar se não houver preferência salva
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook para obter classes CSS baseadas no tema
export const useThemeClasses = () => {
  const { isDark } = useTheme();

  return {
    // Backgrounds
    bgPrimary: isDark ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
    bgTertiary: isDark ? 'bg-gray-700' : 'bg-gray-100',
    bgApp: isDark ? 'bg-gray-900' : 'bg-gray-100',

    // Text colors
    textPrimary: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDark ? 'text-gray-400' : 'text-gray-500',

    // Borders
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    borderLight: isDark ? 'border-gray-600' : 'border-gray-300',

    // Cards and containers
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    cardHover: isDark
      ? 'hover:bg-gray-750 hover:border-gray-600'
      : 'hover:bg-gray-50 hover:border-gray-300',

    // Inputs
    input: isDark
      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
    inputFocus: isDark
      ? 'focus:border-blue-400 focus:ring-blue-400/20'
      : 'focus:border-blue-500 focus:ring-blue-500/20',

    // Shadows
    shadow: isDark ? 'shadow-gray-900/20' : 'shadow-gray-900/10',
    shadowLg: isDark
      ? 'shadow-xl shadow-gray-900/30'
      : 'shadow-xl shadow-gray-900/10',

    // Status colors (mantém as cores mas com opacidade ajustada)
    success: isDark
      ? 'bg-green-900/20 text-green-300 border-green-700'
      : 'bg-green-50 text-green-800 border-green-200',
    warning: isDark
      ? 'bg-yellow-900/20 text-yellow-300 border-yellow-700'
      : 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: isDark
      ? 'bg-red-900/20 text-red-300 border-red-700'
      : 'bg-red-50 text-red-800 border-red-200',
    info: isDark
      ? 'bg-blue-900/20 text-blue-300 border-blue-700'
      : 'bg-blue-50 text-blue-800 border-blue-200',
  };
};
