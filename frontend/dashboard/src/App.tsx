import React, { useState, useEffect } from 'react';
import { RefreshCw, Upload, Calendar, Trash2 } from 'lucide-react';
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
import Header from './components/Header';
import AdminPanel from './components/AdminPanel';
import LoadingScreen from './components/LoadingScreen';
import {
  ThemeProvider,
  useTheme,
  useThemeClasses,
} from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { dashboardAPI } from './services/api';
import { EventArea, DashboardSummary, EvolutionData } from './types';
import { getMockData } from './utils/mockData';
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
  const { isAuthenticated, isAdmin, user } = useAuth();

  const [areas, setAreas] = useState<EventArea[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [evolution, setEvolution] = useState<EvolutionData[]>([]);
  const [selectedArea, setSelectedArea] = useState<EventArea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState<
    'local' | 'csv' | 'backend' | 'mock'
  >('csv');
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showUpload, setShowUpload] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Estados para cronograma
  const [modoCronograma, setModoCronograma] = useState(true);
  const [visualizacaoExecutiva, setVisualizacaoExecutiva] = useState(true);
  const [categoriasCronograma, setCategoriasCronograma] = useState<
    CategoriaCronograma[]
  >([]);
  const [resumoCronograma, setResumoCronograma] =
    useState<ResumoCronograma | null>(null);
  const [tarefaSelecionada, setTarefaSelecionada] =
    useState<TarefaCronograma | null>(null);

  // Estados para filtros especiais
  const [mostrarApenasAtrasadas, setMostrarApenasAtrasadas] = useState(false);
  const [mostrarApenasCriticas, setMostrarApenasCriticas] = useState(false);
  const [mostrarApenasConcluidas, setMostrarApenasConcluidas] = useState(false);
  const [mostrarApenasEmAndamento, setMostrarApenasEmAndamento] =
    useState(false);
  const [mostrarApenasPendentes, setMostrarApenasPendentes] = useState(false);
  const [mostrarApenasEmDia, setMostrarApenasEmDia] = useState(false);

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
    try {
      setIsLoading(true);

      // Primeiro, tentar carregar dados salvos localmente
      if (existeCronogramaLocal()) {
        setLoadingStep('local');
        console.log('📁 Verificando dados salvos localmente...');
        const dadosSalvosCarregados = carregarDadosSalvos();
        if (dadosSalvosCarregados) {
          setLastUpdate(new Date());
          setIsLoading(false);
          return;
        }
      }

      // Se não há dados salvos de cronograma, tentar carregar o CSV diretamente
      setLoadingStep('csv');
      try {
        console.log('📄 Tentando carregar cronograma.csv...');
        const response = await fetch('/cronograma.csv');
        if (response.ok) {
          console.log('✅ CSV encontrado! Processando dados...');
          const csvContent = await response.text();
          const { processarCronogramaRealCSV } = await import(
            './utils/cronogramaProcessor'
          );
          const { categorias, resumo, evolucao } =
            processarCronogramaRealCSV(csvContent);

          console.log('📊 Dados processados com sucesso:', {
            categorias: categorias.length,
            totalTarefas: resumo.totalTarefas,
            progresso: resumo.progressoGeral,
            evolucao: evolucao ? evolucao.length : 0,
            evolucaoDetalhes: evolucao?.map((e) => ({
              nome: e.name,
              pontos: e.data?.length,
            })),
          });

          console.log('🔍 Detalhes dos dados de evolução:', evolucao);

          setCategoriasCronograma(categorias);
          setResumoCronograma(resumo);
          setEvolution(evolucao || []);
          setModoCronograma(true);
          setVisualizacaoExecutiva(true);
          setIsOnline(true);
          setLastUpdate(new Date());
          setIsLoading(false);
          return;
        } else {
          console.log('⚠️ cronograma.csv não encontrado no servidor');
        }
      } catch (csvError) {
        console.error('❌ Erro ao carregar CSV:', csvError);
      }

      // Se falhou o CSV, tentar carregar do backend
      setLoadingStep('backend');
      try {
        console.log('🔗 Tentando conectar ao backend...');
        const [areasData, summaryData, evolutionData] = await Promise.all([
          dashboardAPI.getAreas(),
          dashboardAPI.getSummary(),
          dashboardAPI.getEvolution(),
        ]);

        console.log('✅ Dados do backend carregados com sucesso');
        setAreas(areasData);
        setSummary(summaryData);
        setEvolution(evolutionData);
        setIsOnline(true);
        setLastUpdate(new Date());
        setModoCronograma(false);
      } catch (backendError) {
        console.error('❌ Erro ao carregar dados do backend:', backendError);

        // Como fallback, usar dados mockados para demonstração
        setLoadingStep('mock');
        console.log('🔄 Carregando dados de demonstração...');
        const mockData = getMockData();
        setAreas(mockData.areas);
        setSummary(mockData.summary);
        setEvolution(mockData.evolution);
        setIsOnline(false);
        setModoCronograma(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  // Atualização automática desabilitada para evitar refreshs desnecessários
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     loadData();
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, []);

  // Função para alternar entre dashboard e cronograma
  const toggleMode = () => {
    setModoCronograma(!modoCronograma);
    setVisualizacaoExecutiva(true);
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

  // Função para obter atividades críticas
  const getAtividadesCriticas = (): TarefaCronograma[] => {
    const todasTarefas: TarefaCronograma[] = [];
    categoriasCronograma.forEach((categoria) => {
      todasTarefas.push(...categoria.tarefas);
    });

    const hoje = new Date();
    return todasTarefas.filter((tarefa) => {
      if (tarefa.percentualCompleto === 100) return false;

      const fimPrevisto = new Date(tarefa.fim);
      const diasParaFim = Math.ceil(
        (fimPrevisto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
      );

      return diasParaFim <= 3 && diasParaFim >= 0;
    });
  };

  // Função para obter atividades atrasadas
  const getAtividadesAtrasadas = (): TarefaCronograma[] => {
    const todasTarefas: TarefaCronograma[] = [];
    categoriasCronograma.forEach((categoria) => {
      todasTarefas.push(...categoria.tarefas);
    });

    const hoje = new Date();
    return todasTarefas.filter((tarefa) => {
      if (tarefa.percentualCompleto === 100) return false;

      const fimPrevisto = new Date(tarefa.fim);
      const fimBaseline = new Date(tarefa.fimBaseline);
      const diasParaFim = Math.ceil(
        (fimPrevisto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
      );

      return diasParaFim < 0 || fimPrevisto > fimBaseline;
    });
  };

  // Função para obter atividades concluídas
  const getAtividadesConcluidas = (): TarefaCronograma[] => {
    const todasTarefas: TarefaCronograma[] = [];
    categoriasCronograma.forEach((categoria) => {
      todasTarefas.push(...categoria.tarefas);
    });

    return todasTarefas.filter((tarefa) => tarefa.percentualCompleto === 100);
  };

  // Função para obter atividades em andamento
  const getAtividadesEmAndamento = (): TarefaCronograma[] => {
    const todasTarefas: TarefaCronograma[] = [];
    categoriasCronograma.forEach((categoria) => {
      todasTarefas.push(...categoria.tarefas);
    });

    return todasTarefas.filter(
      (tarefa) =>
        tarefa.percentualCompleto > 0 && tarefa.percentualCompleto < 100
    );
  };

  // Função para obter atividades pendentes
  const getAtividadesPendentes = (): TarefaCronograma[] => {
    const todasTarefas: TarefaCronograma[] = [];
    categoriasCronograma.forEach((categoria) => {
      todasTarefas.push(...categoria.tarefas);
    });

    return todasTarefas.filter((tarefa) => tarefa.percentualCompleto === 0);
  };

  // Função para limpar dados salvos - apenas para administradores autenticados
  const limparDados = () => {
    if (!isAuthenticated || !isAdmin) {
      alert('Acesso negado. Apenas administradores podem limpar dados.');
      return;
    }
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
      <Header lastUpdate={lastUpdate} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controles de Interface - visível para todos */}
        <div
          className={`mb-6 p-4 rounded-lg border ${themeClasses.card} ${themeClasses.shadow}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span
                className={`text-sm font-medium ${themeClasses.textPrimary}`}
              >
                {isAuthenticated
                  ? `Bem-vindo, ${user?.username}!`
                  : 'Visitante - Visualização'}
              </span>

              {resumoCronograma && categoriasCronograma.length > 0 && (
                <div className="flex items-center space-x-4">
                  {/* Toggle Visualização Executiva/Detalhada - para todos */}
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

                  {/* Toggle Dashboard/Cronograma - para todos */}
                  <button
                    onClick={toggleMode}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      modoCronograma
                        ? 'bg-purple-500 text-white hover:bg-purple-600'
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                  >
                    <Calendar size={16} />
                    <span>
                      {modoCronograma ? 'Ver Dashboard' : 'Ver Cronograma'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Botões administrativos - apenas para administradores */}
              {isAuthenticated && isAdmin && (
                <>
                  <button
                    onClick={() => setShowAdminPanel(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Upload size={16} />
                    <span>Gerenciar Dados</span>
                  </button>

                  {existeCronogramaLocal() && (
                    <button
                      onClick={limparDados}
                      className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                      <span>Limpar Dados</span>
                    </button>
                  )}
                </>
              )}

              {/* Botão de atualização - para todos */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                <RefreshCw
                  size={16}
                  className={isLoading ? 'animate-spin' : ''}
                />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* File Upload Section - apenas para administradores */}
        {showUpload && isAdmin && (
          <div
            className={`mb-8 p-6 rounded-lg border ${themeClasses.card} ${themeClasses.shadow}`}
          >
            <FileUpload
              onDataLoaded={handleDataLoaded}
              onCronogramaLoaded={handleCronogramaLoaded}
            />
          </div>
        )}

        {/* Dashboard Content */}
        {isLoading ? (
          /* Tela de Carregamento */
          <LoadingScreen isOnline={isOnline} loadingStep={loadingStep} />
        ) : modoCronograma &&
          resumoCronograma &&
          categoriasCronograma.length > 0 ? (
          /* Modo Cronograma com Dados */
          <div>
            {visualizacaoExecutiva ? (
              /* Visualização Executiva */
              resumoCronograma && categoriasCronograma.length > 0 ? (
                <DashboardExecutivo
                  categorias={categoriasCronograma}
                  resumo={resumoCronograma}
                  onVerDetalhes={() => setVisualizacaoExecutiva(false)}
                  onAtrasadasClick={() => {
                    setMostrarApenasAtrasadas(true);
                    setMostrarApenasCriticas(false);
                    setMostrarApenasConcluidas(false);
                    setMostrarApenasEmAndamento(false);
                    setMostrarApenasPendentes(false);
                    setVisualizacaoExecutiva(false);
                  }}
                  onCriticasClick={() => {
                    setMostrarApenasCriticas(true);
                    setMostrarApenasAtrasadas(false);
                    setMostrarApenasConcluidas(false);
                    setMostrarApenasEmAndamento(false);
                    setMostrarApenasPendentes(false);
                    setVisualizacaoExecutiva(false);
                  }}
                  onConcluidasClick={() => {
                    setMostrarApenasConcluidas(true);
                    setMostrarApenasAtrasadas(false);
                    setMostrarApenasCriticas(false);
                    setMostrarApenasEmAndamento(false);
                    setMostrarApenasPendentes(false);
                    setVisualizacaoExecutiva(false);
                  }}
                  onEmAndamentoClick={() => {
                    setMostrarApenasEmAndamento(true);
                    setMostrarApenasAtrasadas(false);
                    setMostrarApenasCriticas(false);
                    setMostrarApenasConcluidas(false);
                    setMostrarApenasPendentes(false);
                    setVisualizacaoExecutiva(false);
                  }}
                  onPendentesClick={() => {
                    setMostrarApenasPendentes(true);
                    setMostrarApenasAtrasadas(false);
                    setMostrarApenasCriticas(false);
                    setMostrarApenasConcluidas(false);
                    setMostrarApenasEmAndamento(false);
                    setVisualizacaoExecutiva(false);
                  }}
                />
              ) : (
                <div className="text-center py-8">
                  <p>Carregando dados do cronograma...</p>
                  {isAdmin && (
                    <button
                      onClick={() => setShowUpload(true)}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Carregar Dados Manualmente
                    </button>
                  )}
                </div>
              )
            ) : /* Visualização Detalhada */
            resumoCronograma ? (
              <div>
                <ResumoCardsCronograma
                  resumo={resumoCronograma}
                  onAtrasadasClick={() => {
                    setMostrarApenasAtrasadas(true);
                    setMostrarApenasCriticas(false);
                    setMostrarApenasConcluidas(false);
                    setMostrarApenasEmAndamento(false);
                    setMostrarApenasPendentes(false);
                    setMostrarApenasEmDia(false);
                    setVisualizacaoExecutiva(false);
                  }}
                  onCriticasClick={() => {
                    setMostrarApenasCriticas(true);
                    setMostrarApenasAtrasadas(false);
                    setMostrarApenasConcluidas(false);
                    setMostrarApenasEmAndamento(false);
                    setMostrarApenasPendentes(false);
                    setMostrarApenasEmDia(false);
                    setVisualizacaoExecutiva(false);
                  }}
                  onEmDiaClick={() => {
                    setMostrarApenasEmDia(true);
                    setMostrarApenasAtrasadas(false);
                    setMostrarApenasCriticas(false);
                    setMostrarApenasConcluidas(false);
                    setMostrarApenasEmAndamento(false);
                    setMostrarApenasPendentes(false);
                    setVisualizacaoExecutiva(false);
                  }}
                />
                <ListaCronograma
                  categorias={categoriasCronograma}
                  onTarefaClick={setTarefaSelecionada}
                  mostrarApenasAtrasadas={mostrarApenasAtrasadas}
                  mostrarApenasCriticas={mostrarApenasCriticas}
                  mostrarApenasConcluidas={mostrarApenasConcluidas}
                  mostrarApenasEmAndamento={mostrarApenasEmAndamento}
                  mostrarApenasPendentes={mostrarApenasPendentes}
                  mostrarApenasEmDia={mostrarApenasEmDia}
                  onLimparFiltros={() => {
                    setMostrarApenasAtrasadas(false);
                    setMostrarApenasCriticas(false);
                    setMostrarApenasConcluidas(false);
                    setMostrarApenasEmAndamento(false);
                    setMostrarApenasPendentes(false);
                    setMostrarApenasEmDia(false);
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p>Nenhum dado de cronograma disponível</p>
              </div>
            )}
          </div>
        ) : modoCronograma && !resumoCronograma ? (
          /* Modo Cronograma sem Dados - Welcome Screen */
          <WelcomeScreen
            onCarregarDados={() =>
              isAuthenticated && isAdmin ? setShowUpload(true) : null
            }
            isAdmin={isAuthenticated && isAdmin}
          />
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
                  Última atualização: {lastUpdate.toLocaleDateString('pt-BR')}{' '}
                  às {lastUpdate.toLocaleTimeString('pt-BR')}
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
                <div className="flex items-center space-x-4">
                  <span>Preparação PFUS3 (73%)</span>
                  {lastUpdate && (
                    <>
                      <span>•</span>
                      <span>
                        Última atualização:{' '}
                        {lastUpdate.toLocaleDateString('pt-BR')} às{' '}
                        {lastUpdate.toLocaleTimeString('pt-BR')}
                      </span>
                    </>
                  )}
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

      {/* Admin Panel */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        onDataUpdate={loadData}
      />
    </div>
  );
}

// Componente principal que envolve tudo com os Providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
