import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
} from 'lucide-react';
import { cacheManager } from '../utils/cacheManager';

interface SystemStatusProps {
  isVisible: boolean;
  onClose: () => void;
}

interface SystemStats {
  frontend: {
    isOnline: boolean;
    lastUpdate: Date;
    cacheStats: {
      size: number;
      keys: string[];
    };
  };
  backend: {
    isOnline: boolean;
    lastPing: Date;
    port: number;
  };
  data: {
    lastProcessed: Date | null;
    totalPhases: number;
    totalActivities: number;
    processingErrors: string[];
  };
}

const SystemStatus: React.FC<SystemStatusProps> = ({ isVisible, onClose }) => {
  const [stats, setStats] = useState<SystemStats>({
    frontend: {
      isOnline: true,
      lastUpdate: new Date(),
      cacheStats: { size: 0, keys: [] },
    },
    backend: {
      isOnline: false,
      lastPing: new Date(),
      port: 3001,
    },
    data: {
      lastProcessed: null,
      totalPhases: 0,
      totalActivities: 0,
      processingErrors: [],
    },
  });

  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/health', {
        method: 'GET',
        timeout: 5000,
      } as any);

      setStats((prev) => ({
        ...prev,
        backend: {
          ...prev.backend,
          isOnline: response.ok,
          lastPing: new Date(),
        },
      }));
    } catch (error) {
      setStats((prev) => ({
        ...prev,
        backend: {
          ...prev.backend,
          isOnline: false,
          lastPing: new Date(),
        },
      }));
    }
  };

  const updateStats = () => {
    const cacheStats = cacheManager.getStats();

    setStats((prev) => ({
      ...prev,
      frontend: {
        ...prev.frontend,
        lastUpdate: new Date(),
        cacheStats,
      },
    }));

    checkBackendStatus();
  };

  useEffect(() => {
    if (isVisible) {
      updateStats();
      const interval = setInterval(updateStats, 10000); // Atualizar a cada 10 segundos
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isVisible]);

  const clearCache = () => {
    cacheManager.clear();
    updateStats();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            📊 Status do Sistema
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Frontend Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Frontend</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium text-green-600">Online</span>
              </div>
              <div className="flex justify-between">
                <span>Última atualização:</span>
                <span className="text-gray-600">
                  {stats.frontend.lastUpdate.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cache entries:</span>
                <span className="text-gray-600">
                  {stats.frontend.cacheStats.size}
                </span>
              </div>
            </div>
          </div>

          {/* Backend Status */}
          <div
            className={`border rounded-lg p-4 ${
              stats.backend.isOnline
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center space-x-2 mb-3">
              {stats.backend.isOnline ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <h3
                className={`font-semibold ${
                  stats.backend.isOnline ? 'text-green-800' : 'text-red-800'
                }`}
              >
                Backend
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={`font-medium ${
                    stats.backend.isOnline ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stats.backend.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Porta:</span>
                <span className="text-gray-600">{stats.backend.port}</span>
              </div>
              <div className="flex justify-between">
                <span>Último ping:</span>
                <span className="text-gray-600">
                  {stats.backend.lastPing.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Data Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Database className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Dados</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Fases carregadas:</span>
                <span className="text-gray-600">{stats.data.totalPhases}</span>
              </div>
              <div className="flex justify-between">
                <span>Atividades:</span>
                <span className="text-gray-600">
                  {stats.data.totalActivities}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Último processamento:</span>
                <span className="text-gray-600">
                  {stats.data.lastProcessed
                    ? stats.data.lastProcessed.toLocaleTimeString()
                    : 'Nunca'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cache Details */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">💾 Cache do Sistema</h3>
            <button
              onClick={clearCache}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Limpar Cache
            </button>
          </div>
          <div className="text-sm space-y-1">
            <p>
              <strong>Entradas:</strong> {stats.frontend.cacheStats.size}
            </p>
            {stats.frontend.cacheStats.keys.length > 0 && (
              <div>
                <strong>Chaves:</strong>
                <ul className="mt-1 ml-4 list-disc">
                  {stats.frontend.cacheStats.keys.map((key) => (
                    <li key={key} className="text-gray-600">
                      {key}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex space-x-3">
          <button
            onClick={updateStats}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>Atualizar Status</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
