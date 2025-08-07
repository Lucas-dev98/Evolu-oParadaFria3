import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export interface User {
  id: string;
  username: string;
  role: 'visitor' | 'admin';
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simular verificação de autenticação ao carregar a página
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('dashboard_user');
      const savedToken = localStorage.getItem('dashboard_token');

      if (savedUser && savedToken) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Erro ao carregar usuário salvo:', error);
          localStorage.removeItem('dashboard_user');
          localStorage.removeItem('dashboard_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setLoading(true);

    try {
      // Simular chamada de API para autenticação
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Credenciais hardcoded para demonstração
      const validCredentials = [
        { username: 'admin', password: 'admin123', role: 'admin' as const },
        {
          username: 'supervisor',
          password: 'super123',
          role: 'admin' as const,
        },
        { username: 'guest', password: 'guest123', role: 'visitor' as const },
      ];

      const credential = validCredentials.find(
        (cred) => cred.username === username && cred.password === password
      );

      if (credential) {
        const newUser: User = {
          id: `user_${Date.now()}`,
          username: credential.username,
          role: credential.role,
          email: `${credential.username}@empresa.com`,
        };

        setUser(newUser);

        // Salvar no localStorage
        localStorage.setItem('dashboard_user', JSON.stringify(newUser));
        localStorage.setItem('dashboard_token', `token_${Date.now()}`);

        setLoading(false);
        return true;
      } else {
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dashboard_user');
    localStorage.removeItem('dashboard_token');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
