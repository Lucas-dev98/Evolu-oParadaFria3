import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Wifi,
  WifiOff,
  Upload,
  Calendar,
  Database,
  Trash2,
} from 'lucide-react';
import AreaCard from './components/AreaCard';
import SummaryCards from './components/SummaryCards';
import EvolutionChart from './components/EvolutionChart';
import CategoryChart from './components/CategoryChart';
import AreaDetailModal from './components/AreaDetailModal';
import FileUpload from './components/FileUpload';
import ResumoCardsCronograma from './components/ResumoCardsCronograma';
import ListaCronograma from './components/ListaCronograma';
import DashboardExecutivo from './components/DashboardExecutivo';
import WelcomeScreen from './components/WelcomeScreen';
import ThemeToggle from './components/ThemeToggle';
import {
  ThemeProvider,
  useTheme,
  useThemeClasses,
} from './contexts/ThemeContext';
import { dashboardAPI } from './services/api';
import { EventArea, DashboardSummary, EvolutionData } from './types';
import {
  CategoriaCronograma,
  ResumoCronograma,
  TarefaCronograma,
} from './types/cronograma';
import {
  carregarCronogramaLocal,
  existeCronogramaLocal,
  limparCronogramaLocal,
} from './utils/cronogramaProcessor';
import './App.css';

function AppContent() {
  const { isDark } = useTheme();
  const themeClasses = useThemeClasses();

  const [areas, setAreas] = useState<EventArea[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [evolution, setEvolution] = useState<EvolutionData[]>([]);
  const [selectedArea, setSelectedArea] = useState<EventArea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showUpload, setShowUpload] = useState(false);

  // Estados para cronograma
  const [modoCronograma, setModoCronograma] = useState(true); // Iniciar em modo cronograma por padrão
  const [visualizacaoExecutiva, setVisualizacaoExecutiva] = useState(true); // Nova visualização executiva por padrão
  const [categoriasCronograma, setCategoriasCronograma] = useState<
    CategoriaCronograma[]
  >([]);
  const [resumoCronograma, setResumoCronograma] =
    useState<ResumoCronograma | null>(null);
  const [tarefaSelecionada, setTarefaSelecionada] =
    useState<TarefaCronograma | null>(null);

  // Função para carregar dados salvos localmente
  const carregarDadosSalvos = () => {
    try {
      const dadosCarregados = carregarCronogramaLocal();
      if (dadosCarregados) {
        setCategoriasCronograma(dadosCarregados.categorias);
        setResumoCronograma(dadosCarregados.resumo);
        setModoCronograma(true);
        setIsOnline(true);
        console.log('✅ Dados salvos carregados automaticamente:', {
          categorias: dadosCarregados.categorias.length,
          tarefas: dadosCarregados.resumo.totalTarefas,
          arquivo: dadosCarregados.metadados.nomeArquivo,
        });
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados salvos:', error);
    }
    return false;
  };

  // Função para carregar todos os dados
  const loadData = async () => {
    console.log('🔄 loadData iniciado - Estado atual:', {
      modoCronograma,
      visualizacaoExecutiva,
      existeDadosLocais: existeCronogramaLocal(),
      categoriasCronograma: categoriasCronograma.length,
      resumoCronograma: resumoCronograma ? 'presente' : 'ausente',
    });

    try {
      setIsLoading(true);

      // Primeiro, tentar carregar dados salvos localmente
      if (existeCronogramaLocal()) {
        console.log('🔄 Tentando carregar dados salvos localmente...');
        const dadosSalvosCarregados = carregarDadosSalvos();
        if (dadosSalvosCarregados) {
          setLastUpdate(new Date());
          setIsLoading(false);
          return;
        }
      }

      // Se não há dados salvos de cronograma, tentar carregar o CSV diretamente
      console.log('🔍 Tentando carregar cronograma CSV diretamente...');
      try {
        const response = await fetch('/cronograma.csv');
        console.log('📄 CSV Response status:', response.status, response.ok);
        if (response.ok) {
          const csvContent = await response.text();
          console.log(
            '📊 CSV carregado, tamanho:',
            csvContent.length,
            'caracteres'
          );

          const { processarCronogramaRealCSV } = await import(
            './utils/cronogramaProcessor'
          );
          const { categorias, resumo } = processarCronogramaRealCSV(csvContent);

          console.log('🎯 Dados processados do CSV:', {
            categorias: categorias.length,
            resumo,
          });

          // Definir dados do cronograma
          setCategoriasCronograma(categorias);
          setResumoCronograma(resumo);
          setModoCronograma(true);
          setVisualizacaoExecutiva(true);
          setIsOnline(true);
          setLastUpdate(new Date());
          setIsLoading(false);
          return;
        }
      } catch (csvError) {
        console.error('❌ Erro ao carregar CSV:', csvError);
      }

      // Se falhou o CSV, tentar carregar do backend
      try {
        const [areasData, summaryData, evolutionData] = await Promise.all([
          dashboardAPI.getAreas(),
          dashboardAPI.getSummary(),
          dashboardAPI.getEvolution(),
        ]);

        console.log('Dados recebidos do backend:', {
          areasData,
          summaryData,
          evolutionData,
        });
        setAreas(areasData);
        setSummary(summaryData);
        setEvolution(evolutionData);
        setIsOnline(true);
        setLastUpdate(new Date());
        setModoCronograma(false); // Modo dashboard quando vem do backend
      } catch (backendError) {
        console.error('❌ Erro ao carregar dados do backend:', backendError);
        setIsOnline(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    console.log('🚀 useEffect inicial - forçando carregamento de dados');
    loadData();
  }, []);

  // Atualização automática a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Função para alternar entre dashboard e cronograma
  const toggleMode = () => {
    setModoCronograma(!modoCronograma);
    setVisualizacaoExecutiva(true); // Reset para visualização executiva
  };

  // Função para abrir modal de detalhes
  const handleAreaClick = (area: EventArea) => {
    setSelectedArea(area);
    setIsModalOpen(true);
  };

  // Função para fechar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArea(null);
  };

  // Função para atualização manual
  const handleRefresh = () => {
    loadData();
  };

  // Função para limpar dados salvos
  const limparDados = () => {
    limparCronogramaLocal();
    setCategoriasCronograma([]);
    setResumoCronograma(null);
    setModoCronograma(false);
    setVisualizacaoExecutiva(true);
    setShowUpload(false);
  };

  // Função para lidar com dados carregados do arquivo
  const handleDataLoaded = (uploadedAreas: EventArea[]) => {
    setAreas(uploadedAreas);
    setShowUpload(false);
    setModoCronograma(false);
    // Atualizar dados
    loadData();
  };

  // Função para lidar com cronograma carregado
  const handleCronogramaLoaded = (
    categorias: CategoriaCronograma[],
    resumo: ResumoCronograma
  ) => {
    setCategoriasCronograma(categorias);
    setResumoCronograma(resumo);
    setModoCronograma(true);
    setVisualizacaoExecutiva(true);
    setShowUpload(false);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${themeClasses.bgApp}`}
    >
      {/* Header */}
      <header
        className={`${themeClasses.bgPrimary} shadow-lg border-b ${themeClasses.border}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Database className={`h-8 w-8 ${themeClasses.textPrimary}`} />
                <div>
                  <h1
                    className={`text-xl font-bold ${themeClasses.textPrimary}`}
                  >
                    Dashboard PFUS3
                  </h1>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    Monitoramento de Atividades da Preparação
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isOnline
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isOnline ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Controles condicionais */}
              {resumoCronograma && categoriasCronograma.length > 0 && (
                <div className="flex items-center space-x-4">
                  {/* Toggle Visualização Executiva/Detalhada - só no modo cronograma */}
                  {modoCronograma && (
                    <div
                      className={`flex ${themeClasses.bgSecondary} rounded-lg p-1`}
                    >
                      <button
                        onClick={() => setVisualizacaoExecutiva(true)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          visualizacaoExecutiva
                            ? `${themeClasses.bgPrimary} ${themeClasses.textPrimary} shadow-sm`
                            : `${themeClasses.textSecondary} hover:${themeClasses.textPrimary}`
                        }`}
                      >
                        Executivo
                      </button>
                      <button
                        onClick={() => setVisualizacaoExecutiva(false)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          !visualizacaoExecutiva
                            ? `${themeClasses.bgPrimary} ${themeClasses.textPrimary} shadow-sm`
                            : `${themeClasses.textSecondary} hover:${themeClasses.textPrimary}`
                        }`}
                      >
                        Detalhado
                      </button>
                    </div>
                  )}

                  {/* Toggle Dashboard/Cronograma */}
                  <button
                    onClick={toggleMode}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      modoCronograma
                        ? 'bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700'
                        : `${isDark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white`
                    }`}
                  >
                    <Calendar size={16} />
                    <span>
                      {modoCronograma ? 'Ver Dashboard' : 'Ver Cronograma'}
                    </span>
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowUpload(!showUpload)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
              >
                <Upload size={16} />
                <span>Carregar Dados</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCw
                  size={16}
                  className={isLoading ? 'animate-spin' : ''}
                />
                <span>Atualizar</span>
              </button>

              {/* Botão Limpar Dados - só aparece se há dados salvos */}
              {existeCronogramaLocal() && (
                <button
                  onClick={limparDados}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Trash2 size={16} />
                  <span>Limpar Dados</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Upload Section */}
        {showUpload && (
          <div
            className={`mb-8 p-6 rounded-lg border ${themeClasses.card} ${themeClasses.shadow}`}
          >
            <FileUpload
              onDataLoaded={handleDataLoaded}
              onCronogramaLoaded={handleCronogramaLoaded}
            />
          </div>
        )}

        {modoCronograma &&
        resumoCronograma &&
        categoriasCronograma.length > 0 ? (
          /* Modo Cronograma com Dados */
          (() => {
            console.log('🎯 Renderizando DashboardExecutivo com:', {
              visualizacaoExecutiva,
              categorias: categoriasCronograma.length,
              resumo: resumoCronograma ? 'presente' : 'ausente',
            });
            return null;
          })() || (
            <div>
              {visualizacaoExecutiva ? (
                /* Visualização Executiva */
                <DashboardExecutivo
                  categorias={categoriasCronograma}
                  resumo={resumoCronograma}
                  onVerDetalhes={() => setVisualizacaoExecutiva(false)}
                />
              ) : (
                /* Visualização Detalhada */
                <div>
                  <ResumoCardsCronograma resumo={resumoCronograma} />
                  <ListaCronograma
                    categorias={categoriasCronograma}
                    onTarefaClick={setTarefaSelecionada}
                  />
                </div>
              )}
            </div>
          )
        ) : modoCronograma && !resumoCronograma ? (
          /* Modo Cronograma sem Dados - Welcome Screen */
          <WelcomeScreen onCarregarDados={() => setShowUpload(true)} />
        ) : (
          /* Modo Dashboard Original */
          <div>
            {/* Summary Cards */}
            {summary && <SummaryCards summary={summary} />}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <EvolutionChart data={evolution} />
              {summary && <CategoryChart summary={summary} />}
            </div>

            {/* Areas Grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-semibold ${themeClasses.textPrimary}`}
                >
                  Atividades da Preparação
                </h2>
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  Última atualização: {lastUpdate.toLocaleTimeString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {areas.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className={themeClasses.textSecondary}>
                      {isLoading
                        ? 'Carregando atividades...'
                        : 'Nenhuma atividade encontrada'}
                    </p>
                  </div>
                ) : (
                  areas.map((area) => (
                    <AreaCard
                      key={area.id}
                      area={area}
                      onClick={() => handleAreaClick(area)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Status Footer */}
            <div
              className={`${themeClasses.bgPrimary} rounded-lg shadow-md p-4 border ${themeClasses.border}`}
            >
              <div
                className={`flex items-center justify-between text-sm ${themeClasses.textSecondary}`}
              >
                <div>
                  Preparação PFUS3 (73%) - Atualização automática a cada 30
                  segundos
                </div>
                <div className="flex items-center space-x-4">
                  <span>Total de atividades: {areas.length}</span>
                  <span>•</span>
                  <span>Status: {isOnline ? 'Conectado' : 'Desconectado'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Detalhes */}
      <AreaDetailModal
        area={selectedArea}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

// Componente principal que envolve tudo com o ThemeProvider
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
