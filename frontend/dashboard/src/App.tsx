import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Route, TrendingUp, Activity, Settings } from 'lucide-react';
import AreaGridEnhanced from './components/AreaGridEnhanced';
import AreaDetailModalEnhanced from './components/AreaDetailModalEnhanced';
import SummaryCards from './components/SummaryCards';
import EvolutionChart from './components/EvolutionChart';
import CategoryChart from './components/CategoryChart';
import FileUpload from './components/FileUpload';
import ResumoCardsCronograma from './components/ResumoCardsCronograma';
import ListaCronograma from './components/ListaCronograma';
import WelcomeScreen from './components/WelcomeScreen';
import Header from './components/Header';
import AdminPanel from './components/AdminPanel';
import LoadingScreen from './components/LoadingScreen';
import GanttChart from './components/GanttChart';
import KPIDashboard from './components/KPIDashboard-Real';
import CPMAnalysis from './components/CPMAnalysisReal';
import AIAnalysisComponent from './components/AIAnalysisComponent';
import TestGeminiAPI from './components/TestGeminiAPI';
import FasesProximasManager from './components/FasesProximasManager';
import AtividadeDetailModal from './components/AtividadeDetailModal';
import { processarCronogramaOperacional } from './utils/cronogramaOperacionalProcessor';
import { processarCronogramaPreparacao } from './utils/cronogramaPreparacaoProcessor';
import TarefaDetailModal from './components/TarefaDetailModal';
import ParadaHeader from './components/ParadaHeader';
import PhasesNavigation from './components/PhasesNavigation';
import TopNavigation from './components/TopNavigation';
import PhaseExecutiveView from './components/PhaseExecutiveView';
import PhaseDataManager from './components/PhaseDataManager';
import CronogramaUpload from './components/CronogramaUpload';
import PreparacaoUpload from './components/PreparacaoUpload';
import { NotificationContainer } from './components/NotificationToast';
import { useNotifications } from './hooks/useNotifications';
import { ThemeProvider, useThemeClasses } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MobileProvider } from './contexts/MobileContext';
import { dashboardAPI } from './services/api';
import { EventArea, DashboardSummary, EvolutionData } from './types';
import { getMockData } from './utils/mockData';
import { mlPrevisaoService } from './services/MLPrevisaoService';
import {
  CategoriaCronograma,
  ResumoCronograma,
  TarefaCronograma,
} from './types/cronograma';
import { ParadaData, PhaseType, getPhasesMockData } from './types/phases';
import {
  carregarCronogramaLocal,
  existeCronogramaLocal,
  limparCronogramaLocal,
} from './utils/cronogramaProcessor';
import './App.css';

function AppContent() {
  const themeClasses = useThemeClasses();
  const { isAuthenticated, isAdmin, user } = useAuth();

  // Sistema de notificações
  const notifications = useNotifications();

  // Debug: Logs dos estados iniciais
  console.log('🏁 AppContent iniciado');

  const [areas, setAreas] = useState<EventArea[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [evolution, setEvolution] = useState<EvolutionData[]>([]);
  const [selectedArea, setSelectedArea] = useState<EventArea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false); // Flag para evitar múltiplas execuções
  const [loadingStep, setLoadingStep] = useState<
    'local' | 'csv' | 'backend' | 'mock'
  >('csv');
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showUpload, setShowUpload] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [uploadMode, setUploadMode] = useState<
    'traditional' | 'phases' | 'cronograma' | 'preparacao'
  >('traditional');

  // Estados para cronograma
  const [modoCronograma, setModoCronograma] = useState(false);
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

  // Estados para Analytics Avançados
  const [abaAnalytics, setAbaAnalytics] = useState<
    'kpi' | 'gantt' | 'cpm' | 'tendencias' | 'fases' | 'teste'
  >('kpi');
  const [modalTarefaDetalhes, setModalTarefaDetalhes] = useState(false);
  const [modalAtividades, setModalAtividades] = useState(false);
  const [dadosPreparacaoProcessados, setDadosPreparacaoProcessados] =
    useState<any>(null);
  const [modoAnalytics, setModoAnalytics] = useState(false);
  const [navegacaoAtiva, setNavegacaoAtiva] = useState(false);

  // Estados para controle das fases da parada
  const [paradaData, setParadaData] = useState<ParadaData>(getPhasesMockData());
  const [selectedPhase, setSelectedPhase] = useState<PhaseType>('preparacao');

  // Função para filtrar áreas pela fase selecionada
  const getFilteredAreasByPhase = (phase: PhaseType) => {
    // Por enquanto, retorna todas as áreas
    // No futuro, você pode implementar filtros específicos por fase
    const phaseKeywords = {
      preparacao: ['planejamento', 'preparação', 'cronograma', 'recursos'],
      parada: ['desligamento', 'isolamento', 'segurança', 'parada'],
      manutencao: ['manutenção', 'reparo', 'inspeção', 'substituição'],
      partida: ['startup', 'comissionamento', 'testes', 'operação'],
    };

    return areas.filter((area) => {
      const keywords = phaseKeywords[phase] || [];
      return keywords.some((keyword) =>
        area.name.toLowerCase().includes(keyword.toLowerCase())
      );
    });
  };

  // Função para obter o nome da fase atual
  const getCurrentPhaseName = () => {
    const phase = paradaData.phases.find((p) => p.id === selectedPhase);
    return phase ? phase.name : 'Preparação';
  };

  // Função para carregar dados salvos localmente
  const carregarDadosSalvos = useCallback(() => {
    try {
      console.log('🔍 carregarDadosSalvos: Iniciando carregamento...');
      const dadosCarregados = carregarCronogramaLocal();
      console.log(
        '🔍 carregarDadosSalvos: Dados carregados =',
        dadosCarregados
      );
      if (dadosCarregados) {
        console.log(
          '🔍 carregarDadosSalvos: Categorias encontradas =',
          dadosCarregados.categorias?.length || 0
        );
        setCategoriasCronograma(dadosCarregados.categorias);
        setResumoCronograma(dadosCarregados.resumo);
        setModoCronograma(true);
        setIsOnline(true);

        // Inicializar dados simulados para ML
        inicializarDadosML(dadosCarregados.categorias);

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
  }, []);

  // Função para inicializar dados simulados do ML
  const inicializarDadosML = (categorias: CategoriaCronograma[]) => {
    try {
      // Simular dados históricos para algumas tarefas
      categorias.forEach((categoria) => {
        categoria.tarefas.forEach((tarefa) => {
          // Simular 5-10 pontos de progresso histórico
          const pontosHistoricos = Math.floor(Math.random() * 6) + 5;

          for (let i = 0; i < pontosHistoricos; i++) {
            const diasAtras = pontosHistoricos - i;
            const dataHistorica = new Date(
              Date.now() - diasAtras * 24 * 60 * 60 * 1000
            );

            // Progresso simulado baseado no tempo decorrido
            const progressoSimulado = Math.min(
              tarefa.percentualCompleto,
              (i / pontosHistoricos) * tarefa.percentualCompleto +
                Math.random() * 10
            );

            mlPrevisaoService.registrarProgresso(
              tarefa.id.toString(),
              progressoSimulado,
              dataHistorica
            );
          }

          // Adicionar subatividades também
          if (tarefa.subatividades) {
            tarefa.subatividades.forEach((sub) => {
              for (let i = 0; i < pontosHistoricos; i++) {
                const diasAtras = pontosHistoricos - i;
                const dataHistorica = new Date(
                  Date.now() - diasAtras * 24 * 60 * 60 * 1000
                );
                const progressoSimulado = Math.min(
                  sub.percentualCompleto,
                  (i / pontosHistoricos) * sub.percentualCompleto +
                    Math.random() * 10
                );
                mlPrevisaoService.registrarProgresso(
                  sub.id.toString(),
                  progressoSimulado,
                  dataHistorica
                );
              }
            });
          }
        });
      });

      console.log('🤖 Dados simulados do ML inicializados');
    } catch (error) {
      console.error('❌ Erro ao inicializar dados ML:', error);
    }
  };

  // Função para carregar dados do cronograma do backend
  const loadCronogramaFromBackend = useCallback(async () => {
    try {
      console.log('🔗 Tentando conectar ao backend...');
      const response = await fetch('http://localhost:3001/api/cronograma');
      if (response.ok) {
        const cronogramaData = await response.json();

        if (cronogramaData.fases && cronogramaData.fases.length > 0) {
          console.log('📊 Cronograma carregado do backend:', cronogramaData);

          // Atualizar dados das fases
          const novasParadaData = {
            ...paradaData,
            fases: cronogramaData.fases,
          };
          setParadaData(novasParadaData);
          setModoCronograma(true);
          setVisualizacaoExecutiva(true);

          // Calcular resumo baseado nas fases
          const totalTarefas = cronogramaData.atividades?.length || 0;
          const tarefasConcluidas =
            cronogramaData.atividades?.filter(
              (a: any) => a.status === 'completed'
            ).length || 0;
          const tarefasEmAndamento =
            cronogramaData.atividades?.filter(
              (a: any) => a.status === 'in-progress'
            ).length || 0;
          const tarefasPendentes =
            cronogramaData.atividades?.filter(
              (a: any) => a.status === 'pending'
            ).length || 0;

          const resumo = {
            totalTarefas,
            tarefasConcluidas,
            tarefasEmAndamento,
            tarefasPendentes,
            progressoGeral: cronogramaData.metadata?.progressoGeral || 0,
            diasRestantes: Math.max(
              ...cronogramaData.fases.map((f: any) => f.daysRemaining)
            ),
            atividadesCriticas:
              cronogramaData.atividades?.filter((a: any) => a.isCritical)
                .length || 0,
            atividadesAtrasadas:
              cronogramaData.atividades?.filter(
                (a: any) => a.status === 'delayed'
              ).length || 0,
            dataPrevistaConclusao: cronogramaData.metadata?.dataFim || '',
          };

          setResumoCronograma(resumo);
          return true;
        }
      } else {
        console.log('⚠️ Backend retornou status:', response.status);
      }
    } catch (error) {
      console.warn('❌ Erro ao conectar ao backend:', error);
    }

    return false;
  }, []);

  // Função para carregar todos os dados
  const loadData = useCallback(async () => {
    // Evitar múltiplas execuções simultâneas
    if (isLoadingData) {
      console.log('⚠️ Carregamento já em andamento, ignorando nova tentativa');
      return;
    }

    try {
      setIsLoadingData(true);
      setIsLoading(true);
      console.log('🔄 Iniciando carregamento de dados...');

      // PRIORIDADE 1: Carregar dados reais dos CSVs do PFUS3 PRIMEIRO
      setLoadingStep('csv');
      try {
        console.log('📄 Carregando cronogramas reais do PFUS3...');

        // Carregar cronograma operacional
        console.log('📥 Iniciando fetch dos arquivos CSV...');
        const [operacionalResponse, preparacaoResponse] = await Promise.all([
          fetch('/cronograma-operacional.csv'),
          fetch('/cronograma-preparacao-real.csv'),
        ]);

        console.log('📊 Status das respostas:', {
          operacional: {
            ok: operacionalResponse.ok,
            status: operacionalResponse.status,
          },
          preparacao: {
            ok: preparacaoResponse.ok,
            status: preparacaoResponse.status,
          },
        });

        if (operacionalResponse.ok && preparacaoResponse.ok) {
          console.log('✅ CSVs encontrados! Processando dados reais...');

          const [operacionalContent, preparacaoContent] = await Promise.all([
            operacionalResponse.text(),
            preparacaoResponse.text(),
          ]);

          console.log('📝 Conteúdo carregado:', {
            operacional: `${operacionalContent.length} caracteres`,
            preparacao: `${preparacaoContent.length} caracteres`,
          });

          // Processar ambos os cronogramas
          console.log('⚙️ Processando cronogramas...');
          const [dadosOperacional, dadosPreparacao] = await Promise.all([
            processarCronogramaOperacional(operacionalContent),
            processarCronogramaPreparacao(preparacaoContent),
          ]);

          console.log('📊 Dados processados com sucesso!');

          // Armazenar dados de preparação processados para uso no modal
          setDadosPreparacaoProcessados(dadosPreparacao);

          // Combinar dados das duas fases
          const todasFases = [dadosPreparacao.fase, ...dadosOperacional.fases];

          // Criar resumo combinado
          const resumoCombinado = {
            totalTarefas:
              dadosPreparacao.atividades.length +
              dadosOperacional.atividades.length,
            tarefasConcluidas: [
              ...dadosPreparacao.atividades.filter((a) => a.percentual === 100),
              ...dadosOperacional.atividades.filter(
                (a) => a.status === 'completed'
              ),
            ].length,
            tarefasEmAndamento: [
              ...dadosPreparacao.atividades.filter(
                (a) => a.percentual > 0 && a.percentual < 100
              ),
              ...dadosOperacional.atividades.filter(
                (a) => a.status === 'in-progress'
              ),
            ].length,
            tarefasPendentes: [
              ...dadosPreparacao.atividades.filter((a) => a.percentual === 0),
              ...dadosOperacional.atividades.filter(
                (a) => a.status === 'pending'
              ),
            ].length,
            progressoGeral: Math.round(
              (dadosPreparacao.metadata.progressoGeral + 0) / 2
            ),
            diasRestantes: Math.max(
              ...todasFases.map((f) => f.daysRemaining || 0)
            ),
            atividadesCriticas: [
              ...dadosPreparacao.atividades.filter((a) => a.critica),
              ...dadosOperacional.marcos,
            ].length,
            atividadesAtrasadas: dadosPreparacao.atividades.filter(
              (a) => a.atrasada
            ).length,
            dataPrevistaConclusao: dadosOperacional.metadata.dataFim,
          };

          // Criar dados de evolução baseados nos dados reais
          const evolutionData: EvolutionData[] = [
            {
              name: 'Progresso Geral',
              data: [
                { x: '2025-07-01', y: 45 },
                { x: '2025-07-15', y: 62 },
                {
                  x: '2025-08-01',
                  y: Math.round(dadosPreparacao.metadata.progressoGeral),
                },
                {
                  x: new Date().toISOString().split('T')[0],
                  y: Math.round(dadosPreparacao.metadata.progressoGeral),
                },
              ],
            },
            {
              name: 'Atividades Concluídas',
              data: [
                { x: '2025-07-01', y: 159 },
                { x: '2025-07-15', y: 218 },
                {
                  x: '2025-08-01',
                  y: dadosPreparacao.atividades.filter(
                    (a) => a.percentual === 100
                  ).length,
                },
                {
                  x: new Date().toISOString().split('T')[0],
                  y: dadosPreparacao.atividades.filter(
                    (a) => a.percentual === 100
                  ).length,
                },
              ],
            },
            {
              name: 'Atividades Críticas',
              data: [
                { x: '2025-07-01', y: 15 },
                { x: '2025-07-15', y: 20 },
                {
                  x: '2025-08-01',
                  y: dadosPreparacao.atividades.filter((a) => a.critica).length,
                },
                {
                  x: new Date().toISOString().split('T')[0],
                  y: dadosPreparacao.atividades.filter((a) => a.critica).length,
                },
              ],
            },
          ];

          // Criar dados de resumo (summary) baseados nos dados reais
          const summaryData: DashboardSummary = {
            totalAreas: todasFases.length,
            totalCapacity: resumoCombinado.totalTarefas,
            totalOccupancy: resumoCombinado.tarefasConcluidas,
            occupancyRate: resumoCombinado.progressoGeral,
            areasByCategory: {},
            activeAreas: todasFases.filter(
              (f) => f.status === 'in-progress' || f.status === 'active'
            ).length,
            averageTemperature: '22°C',
            averageHumidity: '65%',
          };

          // Criar dados de áreas baseados nas fases
          const areasData: EventArea[] = todasFases.map((fase, index) => ({
            id: index + 1,
            name: fase.name,
            category: fase.name,
            capacity: fase.activities,
            currentOccupancy: fase.completedActivities,
            evolution: [
              {
                time: '08:00',
                occupancy: Math.max(0, fase.completedActivities - 20),
              },
              {
                time: '12:00',
                occupancy: Math.max(0, fase.completedActivities - 10),
              },
              { time: '16:00', occupancy: fase.completedActivities },
              { time: '20:00', occupancy: fase.completedActivities },
            ],
            status: fase.status,
            temperature: 22 + Math.random() * 6,
            humidity: 60 + Math.random() * 10,
          }));

          // Atualizar estado com dados reais
          setParadaData({ ...paradaData, phases: todasFases });
          setResumoCronograma(resumoCombinado);
          setEvolution(evolutionData);
          setSummary(summaryData);
          setAreas(areasData);
          setModoCronograma(true);
          setVisualizacaoExecutiva(true);
          setIsOnline(true);
          setLastUpdate(new Date());

          console.log('✅ Dados reais carregados com sucesso!');
          setIsLoading(false);
          return;
        } else {
          console.log('⚠️ Arquivos CSV não encontrados');
        }
      } catch (csvError) {
        console.error('❌ Erro ao carregar CSVs reais:', csvError);
      }

      // PRIORIDADE 2: Dados salvos localmente
      console.log('📁 Verificando dados salvos localmente...');
      const dadosLocaisExistem = existeCronogramaLocal();
      if (dadosLocaisExistem) {
        setLoadingStep('local');
        const dadosSalvosCarregados = carregarDadosSalvos();
        if (dadosSalvosCarregados) {
          console.log('✅ Dados locais carregados com sucesso!');
          setLastUpdate(new Date());
          setIsLoading(false);
          return;
        }
      }

      // PRIORIDADE 3: Backend (provavelmente falhará)
      setLoadingStep('backend');
      console.log('🔗 Tentando carregar cronograma do backend...');
      const cronogramaCarregado = await loadCronogramaFromBackend();

      if (cronogramaCarregado) {
        console.log('✅ Cronograma carregado do backend com sucesso!');
        setLastUpdate(new Date());
        setIsLoading(false);
        return;
      }

      // PRIORIDADE 4: Se falhou backend, tentar carregar do API dashboard
      setLoadingStep('backend');
      try {
        console.log('📄 Carregando cronogramas reais do PFUS3...');

        // Carregar cronograma operacional
        console.log('📥 Iniciando fetch dos arquivos CSV...');
        const [operacionalResponse, preparacaoResponse] = await Promise.all([
          fetch('/cronograma-operacional.csv'),
          fetch('/cronograma-preparacao-real.csv'),
        ]);

        console.log('📊 Status das respostas:', {
          operacional: {
            ok: operacionalResponse.ok,
            status: operacionalResponse.status,
          },
          preparacao: {
            ok: preparacaoResponse.ok,
            status: preparacaoResponse.status,
          },
        });

        if (operacionalResponse.ok && preparacaoResponse.ok) {
          console.log('✅ CSVs encontrados! Processando dados reais...');

          const [operacionalContent, preparacaoContent] = await Promise.all([
            operacionalResponse.text(),
            preparacaoResponse.text(),
          ]);

          console.log('📝 Conteúdo carregado:', {
            operacional: `${operacionalContent.length} caracteres`,
            preparacao: `${preparacaoContent.length} caracteres`,
          });

          // Importar processadores
          console.log('🔧 Importando processadores...');
          const { processarCronogramaOperacional } = await import(
            './utils/cronogramaOperacionalProcessor'
          );
          const { processarCronogramaPreparacao } = await import(
            './utils/cronogramaPreparacaoProcessor'
          );

          // Processar ambos os cronogramas
          console.log('⚙️ Processando cronogramas...');
          try {
            const [dadosOperacional, dadosPreparacao] = await Promise.all([
              processarCronogramaOperacional(operacionalContent),
              processarCronogramaPreparacao(preparacaoContent),
            ]);

            console.log('📊 Dados operacionais processados:', {
              fases: dadosOperacional.fases.length,
              atividades: dadosOperacional.atividades.length,
              marcos: dadosOperacional.marcos.length,
            });
            console.log('📊 Dados de preparação processados:', {
              atividades: dadosPreparacao.atividades.length,
              fase: dadosPreparacao.fase?.name || 'Não definida',
            });

            // Armazenar dados de preparação processados para uso no modal
            setDadosPreparacaoProcessados(dadosPreparacao);

            // Combinar dados das duas fases
            console.log('🔗 Combinando dados das fases...');
            const todasFases = [
              dadosPreparacao.fase,
              ...dadosOperacional.fases,
            ];

            // Criar resumo combinado
            const resumoCombinado = {
              totalTarefas:
                dadosPreparacao.atividades.length +
                dadosOperacional.atividades.length,
              tarefasConcluidas: [
                ...dadosPreparacao.atividades.filter(
                  (a) => a.percentual === 100
                ),
                ...dadosOperacional.atividades.filter(
                  (a) => a.status === 'completed'
                ),
              ].length,
              tarefasEmAndamento: [
                ...dadosPreparacao.atividades.filter(
                  (a) => a.percentual > 0 && a.percentual < 100
                ),
                ...dadosOperacional.atividades.filter(
                  (a) => a.status === 'in-progress'
                ),
              ].length,
              tarefasPendentes: [
                ...dadosPreparacao.atividades.filter((a) => a.percentual === 0),
                ...dadosOperacional.atividades.filter(
                  (a) => a.status === 'pending'
                ),
              ].length,
              progressoGeral: Math.round(
                (dadosPreparacao.metadata.progressoGeral + 0) / 2
              ), // Operacional ainda não iniciado
              diasRestantes: Math.max(
                ...todasFases.map((f) => f.daysRemaining || 0)
              ),
              atividadesCriticas: [
                ...dadosPreparacao.atividades.filter((a) => a.critica),
                ...dadosOperacional.marcos,
              ].length,
              atividadesAtrasadas: dadosPreparacao.atividades.filter(
                (a) => a.atrasada
              ).length,
              dataPrevistaConclusao: dadosOperacional.metadata.dataFim,
            };

            console.log('📈 Resumo combinado criado:', resumoCombinado);

            // Atualizar estado com dados reais
            console.log('💾 Atualizando estado com dados reais...');
            setParadaData({
              ...paradaData,
              phases: todasFases,
            });

            setResumoCronograma(resumoCombinado);
            setModoCronograma(true);
            setVisualizacaoExecutiva(true);
            setIsOnline(true);
            setLastUpdate(new Date());

            console.log('✅ Dados reais carregados com sucesso!');
            setIsLoading(false);
            return;
          } catch (processingError) {
            console.error(
              '❌ Erro durante processamento dos dados:',
              processingError
            );
            throw processingError; // Re-throw para o catch externo
          }
        } else {
          console.log('⚠️ Arquivos CSV não encontrados');
        }
      } catch (csvError) {
        console.error('❌ Erro ao carregar CSVs reais:', csvError);
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
      setIsLoadingData(false); // Reset da flag
    }
  }, [loadCronogramaFromBackend, carregarDadosSalvos, isLoadingData]); // Adicionado isLoadingData

  // Carregar dados iniciais - APENAS UMA VEZ
  useEffect(() => {
    loadData();
  }, []); // Array de dependências vazio para executar apenas uma vez

  // Ativar automaticamente o modo executivo quando há dados de cronograma PELA PRIMEIRA VEZ
  useEffect(() => {
    if (
      modoCronograma &&
      resumoCronograma &&
      resumoCronograma.totalTarefas > 0 &&
      !navegacaoAtiva // Só ativar se o usuário não estiver navegando
    ) {
      // Se estamos no modo cronograma e temos dados, mas nenhuma visualização está ativa
      // SOMENTE na inicialização, não interferir com navegação do usuário
      if (!visualizacaoExecutiva && !modoAnalytics) {
        console.log(
          '🔄 Ativando visualização executiva por padrão (inicialização)'
        );
        setVisualizacaoExecutiva(true);
      }
    }
  }, [modoCronograma, resumoCronograma, navegacaoAtiva]); // Removido visualizacaoExecutiva e modoAnalytics das dependências

  // Debug: Estados de navegação em tempo real
  useEffect(() => {
    console.log('🔄 ESTADOS DE NAVEGAÇÃO MUDARAM:', {
      modoCronograma,
      visualizacaoExecutiva,
      modoAnalytics,
      navegacaoAtiva,
      timestamp: new Date().toLocaleTimeString(),
    });
  }, [visualizacaoExecutiva, modoAnalytics, modoCronograma, navegacaoAtiva]);

  // Debug: Estado de aba Analytics em tempo real
  useEffect(() => {
    console.log('📋 ABA ANALYTICS MUDOU:', {
      abaAnalytics,
      modoAnalytics,
      timestamp: new Date().toLocaleTimeString(),
    });
  }, [abaAnalytics, modoAnalytics]);

  // Debug: Mostrar estado atual dos dados (comentado para reduzir spam no console)
  /*
  React.useEffect(() => {
    console.log('📊 ESTADO ATUAL DOS DADOS:');
    console.log('- Areas:', areas.length, areas);
    console.log(
      '- Categorias Cronograma:',
      categoriasCronograma.length,
      categoriasCronograma
    );
    console.log('- Resumo:', resumoCronograma);
    console.log('- Summary:', summary);
    console.log('- Evolution:', evolution.length, evolution);
    console.log('- Mode:', { modoCronograma, isLoading, isOnline });
  }, [
    areas,
    categoriasCronograma,
    resumoCronograma,
    summary,
    evolution,
    modoCronograma,
    isLoading,
    isOnline,
  ]);
  */

  // Função de debug para forçar carregamento de dados de demonstração
  const forcarDadosDemo = () => {
    console.log('🔧 FORÇANDO carregamento de dados de demonstração...');
    setIsLoading(true);
    setLoadingStep('mock');

    try {
      const mockData = getMockData();
      console.log('📊 Dados de demonstração:', mockData);
      setAreas(mockData.areas);
      setSummary(mockData.summary);
      setEvolution(mockData.evolution);
      setIsOnline(false);
      setModoCronograma(false);
      setLastUpdate(new Date());
      console.log('✅ Dados de demonstração carregados!');
    } catch (error) {
      console.error('❌ Erro ao carregar dados de demonstração:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    notifications.info('Atualizando', 'Buscando os dados mais recentes...');
  };

  // Funções de filtro de atividades (comentadas para evitar warnings ESLint)
  // const getAtividadesCriticas = (): TarefaCronograma[] => {
  //   const todasTarefas: TarefaCronograma[] = [];
  //   categoriasCronograma.forEach((categoria) => {
  //     todasTarefas.push(...categoria.tarefas);
  //   });

  //   const hoje = new Date();
  //   return todasTarefas.filter((tarefa) => {
  //     if (tarefa.percentualCompleto === 100) return false;

  //     const fimPrevisto = new Date(tarefa.fim);
  //     const diasParaFim = Math.ceil(
  //       (fimPrevisto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  //     );

  //     return diasParaFim <= 3 && diasParaFim >= 0;
  //   });
  // };

  // const getAtividadesAtrasadas = (): TarefaCronograma[] => {
  //   const todasTarefas: TarefaCronograma[] = [];
  //   categoriasCronograma.forEach((categoria) => {
  //     todasTarefas.push(...categoria.tarefas);
  //   });

  //   const hoje = new Date();
  //   return todasTarefas.filter((tarefa) => {
  //     if (tarefa.percentualCompleto === 100) return false;

  //     const fimPrevisto = new Date(tarefa.fim);
  //     const fimBaseline = new Date(tarefa.fimBaseline);
  //     const diasParaFim = Math.ceil(
  //       (fimPrevisto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  //     );

  //     return diasParaFim < 0 || fimPrevisto > fimBaseline;
  //   });
  // };

  // const getAtividadesConcluidas = (): TarefaCronograma[] => {
  //   const todasTarefas: TarefaCronograma[] = [];
  //   categoriasCronograma.forEach((categoria) => {
  //     todasTarefas.push(...categoria.tarefas);
  //   });

  //   return todasTarefas.filter((tarefa) => tarefa.percentualCompleto === 100);
  // };

  // const getAtividadesEmAndamento = (): TarefaCronograma[] => {
  //   const todasTarefas: TarefaCronograma[] = [];
  //   categoriasCronograma.forEach((categoria) => {
  //     todasTarefas.push(...categoria.tarefas);
  //   });

  //   return todasTarefas.filter(
  //     (tarefa) =>
  //       tarefa.percentualCompleto > 0 && tarefa.percentualCompleto < 100
  //   );
  // };

  // const getAtividadesPendentes = (): TarefaCronograma[] => {
  //   const todasTarefas: TarefaCronograma[] = [];
  //   categoriasCronograma.forEach((categoria) => {
  //     todasTarefas.push(...categoria.tarefas);
  //   });

  //   return todasTarefas.filter((tarefa) => tarefa.percentualCompleto === 0);
  // };

  // Função para limpar dados salvos - apenas para administradores autenticados
  const limparDados = () => {
    if (!isAuthenticated || !isAdmin) {
      notifications.error(
        'Acesso negado',
        'Apenas administradores podem limpar dados'
      );
      return;
    }
    limparCronogramaLocal();
    setCategoriasCronograma([]);
    setResumoCronograma(null);
    setModoCronograma(false);
    setVisualizacaoExecutiva(true);
    setShowUpload(false);
    notifications.success(
      'Dados limpos',
      'Todos os dados salvos foram removidos com sucesso'
    );
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
    setModoAnalytics(false);
    setShowUpload(false);

    // Inicializar dados simulados para ML
    inicializarDadosML(categorias);
  };

  // Função para lidar com dados das fases carregados
  const handlePhasesDataUpdated = (phasesData: Record<string, any>) => {
    console.log('Dados das fases atualizados:', phasesData);

    // Atualizar dados das fases no paradaData
    const updatedPhases = paradaData.phases.map((phase) => {
      const phaseData = phasesData[phase.id];
      if (phaseData) {
        return {
          ...phase,
          activities: phaseData.activities?.length || phase.activities,
          completedActivities:
            phaseData.activities?.filter((a: any) => a.status === 'concluida')
              .length || phase.completedActivities,
          delayedActivities:
            phaseData.activities?.filter((a: any) => a.status === 'atrasada')
              .length || phase.delayedActivities,
          criticalActivities:
            phaseData.activities?.filter((a: any) => a.criticidade === 'alta')
              .length || phase.criticalActivities,
          // Calcular progresso baseado nas atividades
          progress:
            phaseData.activities?.length > 0
              ? Math.round(
                  (phaseData.activities.filter(
                    (a: any) => a.status === 'concluida'
                  ).length /
                    phaseData.activities.length) *
                    100
                )
              : phase.progress,
        };
      }
      return phase;
    });

    setParadaData({
      ...paradaData,
      phases: updatedPhases,
    });

    notifications.success(
      'Dados Atualizados',
      'Dados das fases foram atualizados com base nos arquivos carregados'
    );
  };

  // Função para lidar com cronograma operacional processado
  const handleCronogramaOperacional = (cronograma: any) => {
    console.log('Cronograma operacional processado:', cronograma);

    // Atualizar dados das fases com informações do cronograma real
    const updatedPhases = paradaData.phases.map((phase, index) => {
      const cronogramaPhase = cronograma.fases[index];
      if (cronogramaPhase) {
        return {
          ...phase,
          estimatedEnd: cronogramaPhase.estimatedEnd,
          daysRemaining: cronogramaPhase.daysRemaining,
          startDate: cronogramaPhase.startDate,
          endDate: cronogramaPhase.endDate,
        };
      }
      return phase;
    });

    setParadaData({
      ...paradaData,
      phases: updatedPhases,
      subtitle: cronograma.metadata.titulo,
      startDate: new Date(cronograma.metadata.dataInicio),
      estimatedEndDate: new Date(cronograma.metadata.dataFim),
    });

    // Atualizar estado do modo cronograma
    setModoCronograma(true);
    setVisualizacaoExecutiva(true);

    notifications.success(
      'Cronograma Operacional Carregado',
      `${cronograma.metadata.titulo} integrado ao sistema`
    );
  };

  // Função para lidar com cronograma de preparação processado
  const handlePreparacaoProcessed = (preparacao: any) => {
    console.log('Cronograma de preparação processado:', preparacao);

    // Atualizar especificamente a fase de preparação com dados reais
    const updatedPhases = paradaData.phases.map((phase) => {
      if (phase.id === 'preparacao') {
        return {
          ...phase,
          ...preparacao.fase,
          status: 'in-progress' as const,
        };
      }
      return phase;
    });

    setParadaData({
      ...paradaData,
      phases: updatedPhases,
      subtitle: preparacao.metadata.titulo,
    });

    notifications.success(
      'Cronograma de Preparação Carregado',
      `Fase de preparação atualizada: ${preparacao.fase.progress}% concluída`
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${themeClasses.bgApp}`}
    >
      {/* Header */}
      <Header
        lastUpdate={lastUpdate}
        onFilesUpdated={() => {
          console.log('🔄 Arquivos atualizados, recarregando dados...');
          loadData();
        }}
      />

      {/* Botão de Debug - só aparece se não há dados */}
      {(!areas || areas.length === 0) &&
        (!categoriasCronograma || categoriasCronograma.length === 0) && (
          <div className="fixed top-20 right-4 z-50">
            <button
              onClick={forcarDadosDemo}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg"
              title="Forçar carregamento de dados de demonstração"
            >
              🔧 Debug: Carregar Dados Demo
            </button>
          </div>
        )}

      {/* Top Navigation */}
      <TopNavigation
        isAuthenticated={isAuthenticated}
        user={user}
        isAdmin={isAdmin}
        modoCronograma={modoCronograma}
        visualizacaoExecutiva={visualizacaoExecutiva}
        modoAnalytics={modoAnalytics}
        existeCronogramaLocal={existeCronogramaLocal()}
        resumoCronograma={resumoCronograma}
        onExecutivoClick={() => {
          console.log('🎯 Executivo clicado - antes:', {
            modoCronograma,
            visualizacaoExecutiva,
            modoAnalytics,
          });
          setNavegacaoAtiva(true); // Marcar que usuário está navegando
          setModoCronograma(true);
          setVisualizacaoExecutiva(true);
          setModoAnalytics(false);
          console.log(
            '🎯 Executivo clicado - depois: setando modoCronograma=true, visualizacaoExecutiva=true, modoAnalytics=false'
          );

          // Confirmar mudança de estado após um pequeno delay
          setTimeout(() => {
            console.log('🎯 EXECUTIVO - Estado confirmado após mudança:', {
              modoCronograma: true,
              visualizacaoExecutiva: true,
              modoAnalytics: false,
            });
            setNavegacaoAtiva(false); // Resetar flag após navegação
          }, 100);
        }}
        onDetalhadoClick={() => {
          console.log('🔍 Detalhado clicado - antes:', {
            modoCronograma,
            visualizacaoExecutiva,
            modoAnalytics,
          });
          setNavegacaoAtiva(true); // Marcar que usuário está navegando
          setModoCronograma(true);
          setVisualizacaoExecutiva(false);
          setModoAnalytics(false);
          console.log(
            '🔍 Detalhado clicado - depois: setando modoCronograma=true, visualizacaoExecutiva=false, modoAnalytics=false'
          );

          // Confirmar mudança de estado após um pequeno delay
          setTimeout(() => {
            console.log('🔍 DETALHADO - Estado confirmado após mudança:', {
              modoCronograma: true,
              visualizacaoExecutiva: false,
              modoAnalytics: false,
            });
            setNavegacaoAtiva(false); // Resetar flag após navegação
          }, 100);
        }}
        onAnalyticsClick={() => {
          console.log('📊 Analytics clicado - antes:', {
            modoCronograma,
            visualizacaoExecutiva,
            modoAnalytics,
          });
          setNavegacaoAtiva(true); // Marcar que usuário está navegando
          setModoCronograma(true);
          setVisualizacaoExecutiva(false);
          setModoAnalytics(true);
          // Removido: setAbaAnalytics('kpi') - para manter a aba atual selecionada
          console.log(
            '📊 Analytics clicado - depois: setando modoCronograma=true, visualizacaoExecutiva=false, modoAnalytics=true'
          );

          // Confirmar mudança de estado após um pequeno delay
          setTimeout(() => {
            console.log('📊 ANALYTICS - Estado confirmado após mudança:', {
              modoCronograma: true,
              visualizacaoExecutiva: false,
              modoAnalytics: true,
            });
            setNavegacaoAtiva(false); // Resetar flag após navegação
          }, 100);
        }}
        onDashboardClick={toggleMode}
        onGerenciarDadosClick={() => setShowAdminPanel(true)}
        onLimparDadosClick={limparDados}
        onAtualizarClick={handleRefresh}
        isLoading={isLoading}
        onNotify={(type, title, message) => {
          if (type === 'success') notifications.success(title, message);
          else if (type === 'info') notifications.info(title, message);
          else if (type === 'warning') notifications.warning(title, message);
          else if (type === 'error') notifications.error(title, message);
        }}
      />

      {/* Sistema de Notificações */}
      <NotificationContainer
        toasts={notifications.toasts}
        onDismiss={notifications.removeToast}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Cabeçalho da Parada */}
        <div className="mb-4 sm:mb-6">
          <ParadaHeader paradaData={paradaData} />
        </div>

        {/* Navegação das Fases */}
        <div className="mb-4 sm:mb-6">
          <PhasesNavigation
            phases={paradaData.phases}
            currentPhase={selectedPhase}
            onPhaseSelect={setSelectedPhase}
          />
        </div>

        {/* File Upload Section - apenas para administradores */}
        {showUpload && isAdmin && (
          <div
            className={`mb-8 p-6 rounded-lg border ${themeClasses.card} ${themeClasses.shadow}`}
          >
            {/* Seletor de Modo de Upload */}
            <div className="mb-6">
              <h3
                className={`text-lg font-semibold mb-4 ${themeClasses.textPrimary}`}
              >
                Modo de Upload
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setUploadMode('traditional')}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${
                      uploadMode === 'traditional'
                        ? 'bg-blue-500 text-white'
                        : `${themeClasses.card} ${themeClasses.textPrimary} hover:bg-gray-100 dark:hover:bg-gray-700`
                    }
                  `}
                >
                  Upload Tradicional
                </button>
                <button
                  onClick={() => setUploadMode('phases')}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${
                      uploadMode === 'phases'
                        ? 'bg-blue-500 text-white'
                        : `${themeClasses.card} ${themeClasses.textPrimary} hover:bg-gray-100 dark:hover:bg-gray-700`
                    }
                  `}
                >
                  Upload por Fases
                </button>
                <button
                  onClick={() => setUploadMode('cronograma')}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${
                      uploadMode === 'cronograma'
                        ? 'bg-blue-500 text-white'
                        : `${themeClasses.card} ${themeClasses.textPrimary} hover:bg-gray-100 dark:hover:bg-gray-700`
                    }
                  `}
                >
                  Cronograma Operacional
                </button>
                <button
                  onClick={() => setUploadMode('preparacao')}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${
                      uploadMode === 'preparacao'
                        ? 'bg-blue-500 text-white'
                        : `${themeClasses.card} ${themeClasses.textPrimary} hover:bg-gray-100 dark:hover:bg-gray-700`
                    }
                  `}
                >
                  Cronograma Preparação
                </button>
              </div>
            </div>

            {/* Componente de Upload baseado no modo selecionado */}
            {uploadMode === 'traditional' ? (
              <FileUpload
                onDataLoaded={handleDataLoaded}
                onCronogramaLoaded={handleCronogramaLoaded}
              />
            ) : uploadMode === 'phases' ? (
              <PhaseDataManager onPhasesDataUpdated={handlePhasesDataUpdated} />
            ) : uploadMode === 'cronograma' ? (
              <CronogramaUpload
                onCronogramaProcessed={handleCronogramaOperacional}
              />
            ) : (
              <PreparacaoUpload
                onPreparacaoProcessed={handlePreparacaoProcessed}
              />
            )}
          </div>
        )}

        {/* Dashboard Content */}
        {isLoading ? (
          /* Tela de Carregamento */
          <LoadingScreen isOnline={isOnline} loadingStep={loadingStep} />
        ) : modoCronograma ? (
          /* Modo Cronograma - TEMPORÁRIO: Removida verificação de dados para testar navegação */
          <div>
            {/* Indicador da Visualização Atual */}
            <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* DEBUG: Estados atuais */}
                  <div className="text-xs bg-gray-100 p-1 rounded">
                    Exec: {visualizacaoExecutiva.toString()} | Analytics:{' '}
                    {modoAnalytics.toString()}
                  </div>

                  {visualizacaoExecutiva && !modoAnalytics ? (
                    <>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-blue-700 dark:text-blue-300">
                        🎯 Visualização Executiva
                      </span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        - KPIs e resumo gerencial por fase
                      </span>
                    </>
                  ) : !visualizacaoExecutiva && !modoAnalytics ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-green-700 dark:text-green-300">
                        🔍 Visualização Detalhada
                      </span>
                      <span className="text-sm text-green-600 dark:text-green-400">
                        - Lista completa de atividades e subatividades
                      </span>
                    </>
                  ) : modoAnalytics ? (
                    <>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-purple-700 dark:text-purple-300">
                        📊 Analytics Avançado
                      </span>
                      <span className="text-sm text-purple-600 dark:text-purple-400">
                        - Análises com IA e predições inteligentes
                      </span>
                    </>
                  ) : null}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {resumoCronograma?.totalTarefas || 0} atividades carregadas
                </div>
              </div>
            </div>

            {/* Renderização baseada nos estados */}
            {visualizacaoExecutiva && !modoAnalytics ? (
              /* Visualização Executiva por Fase */
              <div>
                <PhaseExecutiveView
                  phaseData={{
                    id: selectedPhase,
                    name: `${paradaData.phases.find((p) => p.id === selectedPhase)?.name} PFUS3 2025`,
                    progress:
                      paradaData.phases.find((p) => p.id === selectedPhase)
                        ?.progress || 0,
                    activities:
                      paradaData.phases.find((p) => p.id === selectedPhase)
                        ?.activities || 0,
                    completedActivities:
                      paradaData.phases.find((p) => p.id === selectedPhase)
                        ?.completedActivities || 0,
                    delayedActivities:
                      paradaData.phases.find((p) => p.id === selectedPhase)
                        ?.delayedActivities || 0,
                    criticalActivities:
                      paradaData.phases.find((p) => p.id === selectedPhase)
                        ?.criticalActivities || 0,
                    onTimeActivities:
                      paradaData.phases.find((p) => p.id === selectedPhase)
                        ?.onTimeActivities || 0,
                    advancedActivities:
                      paradaData.phases.find((p) => p.id === selectedPhase)
                        ?.advancedActivities || 0,
                    estimatedEnd:
                      paradaData.phases.find((p) => p.id === selectedPhase)
                        ?.estimatedEnd || '',
                    daysRemaining:
                      paradaData.phases.find((p) => p.id === selectedPhase)
                        ?.daysRemaining || 0,
                    totalTasks:
                      paradaData.phases.find((p) => p.id === selectedPhase)
                        ?.totalTasks || 0,
                    inProgressTasks:
                      paradaData.phases.find((p) => p.id === selectedPhase)
                        ?.inProgressTasks || 0,
                    pendingTasks:
                      paradaData.phases.find((p) => p.id === selectedPhase)
                        ?.pendingTasks || 0,
                    categories:
                      paradaData.phases.find((p) => p.id === selectedPhase)
                        ?.categories || [],
                  }}
                  onDetailsClick={(category) => {
                    notifications.info(
                      'Ver Detalhes',
                      `Abrindo detalhes de ${category}`
                    );
                    // Implementação futura: navegação para detalhes da categoria
                  }}
                />
              </div>
            ) : !modoAnalytics && !visualizacaoExecutiva && resumoCronograma ? (
              /* Visualização Detalhada - Lista Completa de Tarefas */
              <div>
                {/* Botão de Detalhamento de Atividades */}
                {dadosPreparacaoProcessados &&
                  dadosPreparacaoProcessados.atividadesHierarchicas && (
                    <div className="mb-6">
                      <button
                        onClick={() => setModalAtividades(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
                      >
                        <div className="flex items-center justify-center">
                          <Activity className="w-5 h-5 mr-2" />
                          <span className="font-semibold">
                            Ver Detalhamento Completo das Atividades
                          </span>
                          <div className="ml-3 text-sm opacity-90">
                            ({dadosPreparacaoProcessados.atividades.length}{' '}
                            atividades com hierarquia)
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                {resumoCronograma && (
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
                )}
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
            ) : modoAnalytics ? (
              /* Visualização Analytics Avançados */
              <div>
                {/* Navegação das Abas de Analytics */}
                <div className={`mb-6 ${themeClasses.card} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className={`text-xl font-semibold ${themeClasses.textPrimary}`}
                    >
                      🚀 Analytics Avançados & IA
                    </h2>
                    {/* Debug: Verificar dados */}
                    {(() => {
                      console.log('🔍 DEBUG Analytics Render:', {
                        categoriasCronograma: categoriasCronograma?.length || 0,
                        categoriasCompletas: categoriasCronograma,
                        abaAnalytics,
                        temDados:
                          !!categoriasCronograma &&
                          categoriasCronograma.length > 0,
                      });
                      return null;
                    })()}
                    {/* DEBUG: Indicador da aba ativa */}
                    <div className="text-xs bg-yellow-100 p-1 rounded">
                      Aba ativa: {abaAnalytics}
                    </div>
                    <div
                      className={`flex ${themeClasses.bgSecondary} rounded-lg p-1`}
                    >
                      <button
                        onClick={() => {
                          console.log('🎯 KPI clicado - mudando para:', 'kpi');
                          setAbaAnalytics('kpi');
                        }}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          abaAnalytics === 'kpi'
                            ? `${themeClasses.bgPrimary} ${themeClasses.textPrimary} shadow-sm`
                            : `${themeClasses.textSecondary} hover:${themeClasses.textPrimary}`
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>KPIs</span>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          console.log(
                            '📊 Gantt clicado - mudando para:',
                            'gantt'
                          );
                          setAbaAnalytics('gantt');
                        }}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          abaAnalytics === 'gantt'
                            ? `${themeClasses.bgPrimary} ${themeClasses.textPrimary} shadow-sm`
                            : `${themeClasses.textSecondary} hover:${themeClasses.textPrimary}`
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>Gantt</span>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          console.log('🔄 CPM clicado - mudando para:', 'cpm');
                          setAbaAnalytics('cpm');
                        }}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          abaAnalytics === 'cpm'
                            ? `${themeClasses.bgPrimary} ${themeClasses.textPrimary} shadow-sm`
                            : `${themeClasses.textSecondary} hover:${themeClasses.textPrimary}`
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <Route className="w-4 h-4" />
                          <span>CPM</span>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          console.log(
                            '⚙️ Fases clicado - mudando para:',
                            'fases'
                          );
                          setAbaAnalytics('fases');
                        }}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          abaAnalytics === 'fases'
                            ? `${themeClasses.bgPrimary} ${themeClasses.textPrimary} shadow-sm`
                            : `${themeClasses.textSecondary} hover:${themeClasses.textPrimary}`
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <Settings className="w-4 h-4" />
                          <span>Fases</span>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          console.log(
                            '🤖 IA clicado - mudando para:',
                            'tendencias'
                          );
                          setAbaAnalytics('tendencias');
                        }}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          abaAnalytics === 'tendencias'
                            ? `${themeClasses.bgPrimary} ${themeClasses.textPrimary} shadow-sm`
                            : `${themeClasses.textSecondary} hover:${themeClasses.textPrimary}`
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <Activity className="w-4 h-4" />
                          <span>IA</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conteúdo das Abas de Analytics */}
                {(() => {
                  console.log('🎯 DEBUG: abaAnalytics =', abaAnalytics);
                  console.log(
                    '🎯 DEBUG: categoriasCronograma length =',
                    categoriasCronograma?.length || 0
                  );
                  console.log(
                    '🎯 DEBUG: renderizando KPI?',
                    abaAnalytics === 'kpi'
                  );
                  return null;
                })()}
                {abaAnalytics === 'kpi' && (
                  <div>
                    {/* DEBUG: Criar categorias fake se necessário */}
                    {(() => {
                      if (
                        (!categoriasCronograma ||
                          categoriasCronograma.length === 0) &&
                        resumoCronograma?.totalTarefas &&
                        resumoCronograma.totalTarefas > 0
                      ) {
                        console.log(
                          '⚡ CARREGANDO dados reais do CSV para Analytics...'
                        );

                        // Função para carregar e processar o CSV real
                        const carregarCSVReal = async () => {
                          try {
                            const response = await fetch(
                              '/cronograma-preparacao-real.csv'
                            );
                            const csvText = await response.text();

                            const linhas = csvText.split('\n').slice(1); // Remove header
                            const categorias = new Map();

                            linhas.forEach((linha, index) => {
                              if (!linha.trim()) return;

                              const campos = linha.split(',');
                              if (campos.length < 16) return;

                              const id = campos[0];
                              const nomeCompleto = campos[1];
                              const percentCompleto =
                                parseInt(campos[2].replace('%', '')) || 0;
                              const percentFisico =
                                parseInt(campos[3].replace('%', '')) || 0;
                              const percentReplanejamento =
                                parseInt(campos[4]) || 0;
                              const duracao = campos[5] || '1 day';
                              const inicio = campos[6];
                              const fim = campos[7];

                              // Determinar nível hierárquico pelos espaços
                              const match = nomeCompleto.match(/^(\s*)/);
                              const espacos = (
                                match && match[1] ? match[1] : ''
                              ).length;
                              const nome = nomeCompleto.trim();

                              // Categorizar baseado no nível hierárquico e conteúdo
                              let categoria = 'Outras Atividades';
                              if (nome.includes('Logística'))
                                categoria = 'Logística';
                              else if (nome.includes('Refratário'))
                                categoria = 'Refratário';
                              else if (
                                nome.includes('Mobilização') ||
                                nome.includes('Canteiro')
                              )
                                categoria = 'Mobilização e Canteiros';
                              else if (espacos === 4)
                                categoria = 'Preparação Principal';
                              else if (espacos === 8)
                                categoria = 'Atividades Detalhadas';

                              if (!categorias.has(categoria)) {
                                categorias.set(categoria, {
                                  id: categoria
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]/g, '-'),
                                  nome: categoria,
                                  descricao: `Categoria ${categoria} - PFUS3 2025`,
                                  cor:
                                    categoria === 'Logística'
                                      ? '#3B82F6'
                                      : categoria === 'Refratário'
                                        ? '#EF4444'
                                        : categoria ===
                                            'Mobilização e Canteiros'
                                          ? '#10B981'
                                          : categoria === 'Preparação Principal'
                                            ? '#F59E0B'
                                            : '#8B5CF6',
                                  tarefas: [],
                                });
                              }

                              const tarefa = {
                                id: parseInt(id) || 0,
                                nome: nome,
                                percentualCompleto: percentCompleto,
                                percentualFisico: percentFisico,
                                percentualReplanejamento: percentReplanejamento,
                                duracao: duracao,
                                inicio:
                                  inicio ||
                                  new Date().toISOString().split('T')[0],
                                fim:
                                  fim || new Date().toISOString().split('T')[0],
                                inicioBaseline:
                                  inicio ||
                                  new Date().toISOString().split('T')[0],
                                fimBaseline:
                                  fim || new Date().toISOString().split('T')[0],
                                percentualFisicoPrev: percentFisico,
                                percentualFisicoReplan: percentFisico,
                                percentualFisicoCalc: percentFisico,
                                nivel: Math.floor(espacos / 4),
                                categoria: categoria,
                              };

                              categorias.get(categoria).tarefas.push(tarefa);
                            });

                            const categoriasArray = Array.from(
                              categorias.values()
                            );
                            console.log(
                              '📊 Dados reais carregados do CSV PFUS3:',
                              categoriasArray.length,
                              'categorias com',
                              categoriasArray.reduce(
                                (acc, cat) => acc + cat.tarefas.length,
                                0
                              ),
                              'tarefas reais'
                            );

                            setCategoriasCronograma(categoriasArray as any);
                          } catch (error) {
                            console.error(
                              '❌ Erro ao carregar CSV real:',
                              error
                            );
                            // Fallback para dados simulados em caso de erro
                            console.log(
                              '🔄 Usando dados simulados como fallback...'
                            );
                            const totalTarefas = resumoCronograma.totalTarefas;
                            const categoriasFallback = [
                              {
                                id: 'fallback-prep',
                                nome: 'Preparação (Simulado)',
                                descricao: 'Dados simulados como fallback',
                                cor: '#3B82F6',
                                tarefas: Array.from(
                                  { length: Math.floor(totalTarefas * 0.5) },
                                  (_, i) => ({
                                    id: `fallback-${i}`,
                                    titulo: `Atividade Simulada ${i + 1}`,
                                    descricao: `Atividade de fallback ${i + 1}`,
                                    inicio: new Date()
                                      .toISOString()
                                      .split('T')[0],
                                    fim: new Date().toISOString().split('T')[0],
                                    percentualCompleto: Math.floor(
                                      Math.random() * 100
                                    ),
                                    percentualFisico: Math.floor(
                                      Math.random() * 100
                                    ),
                                    duracao: `${Math.floor(Math.random() * 10) + 1} days`,
                                    responsavel: 'Equipe Simulada',
                                    prioridade: 'media' as any,
                                    dependencias: [],
                                    recursos: [],
                                  })
                                ),
                              },
                            ];
                            setCategoriasCronograma(categoriasFallback as any);
                          }
                        };

                        carregarCSVReal();
                      }
                      return null;
                    })()}
                    {/* KPI Dashboard - Aba KPI ativa */}
                    <KPIDashboard categorias={categoriasCronograma} />
                  </div>
                )}

                {abaAnalytics === 'gantt' && (
                  <div>
                    {/* Gantt Chart - Aba Gantt ativa */}
                    <GanttChart
                      categorias={categoriasCronograma}
                      onTarefaClick={(tarefa) => {
                        setTarefaSelecionada(tarefa);
                        setModalTarefaDetalhes(true);
                      }}
                    />
                  </div>
                )}

                {abaAnalytics === 'cpm' && (
                  <div>
                    {/* CPM Analysis - Aba CPM ativa */}
                    <CPMAnalysis
                      categorias={categoriasCronograma}
                      onTarefaClick={(tarefa) => {
                        setTarefaSelecionada(tarefa);
                        setModalTarefaDetalhes(true);
                      }}
                    />
                  </div>
                )}

                {abaAnalytics === 'fases' && (
                  <div>
                    {/* Fases Próximas Manager - Aba Fases ativa */}
                    <FasesProximasManager />
                  </div>
                )}

                {abaAnalytics === 'tendencias' && resumoCronograma && (
                  <div className="space-y-6">
                    <AIAnalysisComponent
                      categorias={categoriasCronograma}
                      resumo={resumoCronograma}
                    />
                    <KPIDashboard categorias={categoriasCronograma} />
                    <CPMAnalysis
                      categorias={categoriasCronograma}
                      onTarefaClick={(tarefa) => {
                        setTarefaSelecionada(tarefa);
                        setModalTarefaDetalhes(true);
                      }}
                    />
                  </div>
                )}

                {abaAnalytics === 'teste' && (
                  <div className="space-y-6">
                    <TestGeminiAPI />
                  </div>
                )}
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
              <EvolutionChart
                data={evolution}
                additionalInfo={{
                  totalAtividades: resumoCronograma?.totalTarefas || 0,
                  atividadesConcluidas:
                    resumoCronograma?.tarefasConcluidas || 0,
                  atividadesCriticas: resumoCronograma?.tarefasEmAndamento || 0,
                  progressoGeral: resumoCronograma?.progressoGeral || 0,
                  faseAtual: getCurrentPhaseName(),
                }}
              />
              {summary && <CategoryChart summary={summary} />}
            </div>

            {/* Areas Grid - Enhanced View Only */}
            <div className="mb-4 p-4 rounded-lg border-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="font-bold text-lg text-blue-700">
                    📋 {getCurrentPhaseName()} - Atividades e Acompanhamento
                  </span>
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    FASE ATIVA
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600 font-medium">
                    {getFilteredAreasByPhase(selectedPhase).length} atividades
                    da fase
                  </div>
                  <div className="text-xs text-gray-500">
                    {paradaData.phases.find((p) => p.id === selectedPhase)
                      ?.progress || 0}
                    % concluído
                  </div>
                </div>
              </div>
            </div>

            <AreaGridEnhanced
              areas={getFilteredAreasByPhase(selectedPhase)}
              onAreaClick={handleAreaClick}
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />

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

      {/* Modal de Detalhes - Enhanced Only */}
      <AreaDetailModalEnhanced
        area={selectedArea}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Modal de Detalhes da Tarefa */}
      {tarefaSelecionada && (
        <TarefaDetailModal
          tarefa={tarefaSelecionada}
          isOpen={modalTarefaDetalhes}
          onClose={() => {
            setModalTarefaDetalhes(false);
            setTarefaSelecionada(null);
          }}
        />
      )}

      {/* Modal de Detalhamento de Atividades */}
      {dadosPreparacaoProcessados && (
        <AtividadeDetailModal
          isOpen={modalAtividades}
          onClose={() => setModalAtividades(false)}
          atividades={dadosPreparacaoProcessados.atividadesHierarchicas || []}
          titulo={
            dadosPreparacaoProcessados.metadata?.titulo ||
            'Cronograma de Preparação'
          }
        />
      )}

      {/* Admin Panel */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        onDataUpdate={loadData}
      />

      {/* Modal de Atividades Detalhadas */}
      {dadosPreparacaoProcessados && (
        <AtividadeDetailModal
          isOpen={modalAtividades}
          onClose={() => setModalAtividades(false)}
          atividades={
            dadosPreparacaoProcessados.atividadesHierarchicas ||
            dadosPreparacaoProcessados.atividades ||
            []
          }
          titulo={
            dadosPreparacaoProcessados.metadata?.titulo ||
            'Atividades de Preparação'
          }
        />
      )}
    </div>
  );
}

// Componente principal que envolve tudo com os Providers
function App() {
  return (
    <MobileProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </MobileProvider>
  );
}

export default App;
