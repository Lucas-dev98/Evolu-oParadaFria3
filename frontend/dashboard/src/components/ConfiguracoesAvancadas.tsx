import React, { useState } from 'react';
import { Settings, Database, Zap, Shield, Download } from 'lucide-react';
import { cacheManager } from '../utils/cacheManager';

interface ConfiguracoesAvancadasProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConfiguracoesAvancadas: React.FC<ConfiguracoesAvancadasProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('performance');
  const [settings, setSettings] = useState({
    // Performance
    enableCache: true,
    cacheTimeout: 5, // minutos
    enablePerformanceMonitor: true,

    // Validação
    strictValidation: true,
    skipWarnings: false,
    autoFixEncoding: true,

    // Logs
    enableVerboseLogs: false,
    logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',

    // Interface
    showDevTools: process.env.NODE_ENV === 'development',
    autoRefresh: false,
    refreshInterval: 30, // segundos
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Aplicar configurações imediatamente
    switch (key) {
      case 'enableCache':
        if (!value) {
          cacheManager.clear();
        }
        break;
      case 'enableVerboseLogs':
        // Configurar nível de logs
        break;
    }
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pfus3-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (
      window.confirm(
        'Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.'
      )
    ) {
      cacheManager.clear();
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'validation', label: 'Validação', icon: Shield },
    { id: 'data', label: 'Dados', icon: Database },
    { id: 'interface', label: 'Interface', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            ⚙️ Configurações Avançadas
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">
                  ⚡ Configurações de Performance
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Habilitar Cache</label>
                      <p className="text-sm text-gray-600">
                        Cache automático para acelerar carregamentos
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableCache}
                      onChange={(e) =>
                        handleSettingChange('enableCache', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">
                      Timeout do Cache (minutos)
                    </label>
                    <input
                      type="number"
                      value={settings.cacheTimeout}
                      onChange={(e) =>
                        handleSettingChange(
                          'cacheTimeout',
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      max="60"
                      className="w-20 px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">
                        Monitor de Performance
                      </label>
                      <p className="text-sm text-gray-600">
                        Exibir métricas de performance em tempo real
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enablePerformanceMonitor}
                      onChange={(e) =>
                        handleSettingChange(
                          'enablePerformanceMonitor',
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'validation' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">
                  🛡️ Configurações de Validação
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Validação Rigorosa</label>
                      <p className="text-sm text-gray-600">
                        Rejeitar arquivos com erros críticos
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.strictValidation}
                      onChange={(e) =>
                        handleSettingChange(
                          'strictValidation',
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">
                        Correção Automática de Encoding
                      </label>
                      <p className="text-sm text-gray-600">
                        Tentar corrigir problemas de encoding automaticamente
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoFixEncoding}
                      onChange={(e) =>
                        handleSettingChange('autoFixEncoding', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Ignorar Avisos</label>
                      <p className="text-sm text-gray-600">
                        Processar arquivos mesmo com avisos
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.skipWarnings}
                      onChange={(e) =>
                        handleSettingChange('skipWarnings', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">💾 Gestão de Dados</h3>

                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      ⚠️ Zona de Perigo
                    </h4>
                    <p className="text-sm text-yellow-700 mb-4">
                      As ações abaixo podem causar perda de dados.
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={() => cacheManager.clear()}
                        className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Limpar Cache
                      </button>

                      <button
                        onClick={clearAllData}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Limpar Todos os Dados
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">
                      📊 Estatísticas
                    </h4>
                    <div className="text-sm space-y-1">
                      <div>Cache: {cacheManager.getStats().size} entradas</div>
                      <div>
                        localStorage: {Object.keys(localStorage).length} chaves
                      </div>
                      <div>
                        sessionStorage: {Object.keys(sessionStorage).length}{' '}
                        chaves
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'interface' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">🎨 Interface</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">
                        Ferramentas de Desenvolvimento
                      </label>
                      <p className="text-sm text-gray-600">
                        Exibir botões de debug e ferramentas
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showDevTools}
                      onChange={(e) =>
                        handleSettingChange('showDevTools', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">
                        Atualização Automática
                      </label>
                      <p className="text-sm text-gray-600">
                        Recarregar dados automaticamente
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoRefresh}
                      onChange={(e) =>
                        handleSettingChange('autoRefresh', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>

                  {settings.autoRefresh && (
                    <div>
                      <label className="block font-medium mb-2">
                        Intervalo de Atualização (segundos)
                      </label>
                      <input
                        type="number"
                        value={settings.refreshInterval}
                        onChange={(e) =>
                          handleSettingChange(
                            'refreshInterval',
                            parseInt(e.target.value)
                          )
                        }
                        min="10"
                        max="300"
                        className="w-24 px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={exportSettings}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Configurações</span>
          </button>

          <div className="space-x-3">
            <button
              onClick={() =>
                setSettings({
                  enableCache: true,
                  cacheTimeout: 5,
                  enablePerformanceMonitor: true,
                  strictValidation: true,
                  skipWarnings: false,
                  autoFixEncoding: true,
                  enableVerboseLogs: false,
                  logLevel: 'info',
                  showDevTools: process.env.NODE_ENV === 'development',
                  autoRefresh: false,
                  refreshInterval: 30,
                })
              }
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Restaurar Padrões
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Salvar e Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesAvancadas;
