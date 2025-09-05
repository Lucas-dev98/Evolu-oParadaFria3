import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart3,
  Route,
  TrendingUp,
  Activity,
  Users,
  ChevronRight,
} from 'lucide-react';
import AreaGridEnhanced from './components/AreaGridEnhanced';
import AreaDetailModalEnhanced from './components/AreaDetailModalEnhanced';
import FileUpload from './components/FileUpload';
import WelcomeScreen from './components/WelcomeScreen';
import Header from './components/Header';
import AdminPanel from './components/AdminPanel';
import LoadingScreen from './components/LoadingScreen';
import GanttChart from './components/GanttChart';
import KPIDashboard from './components/KPIDashboard-Real';
import CPMAnalysis from './components/CPMAnalysisReal';
import AIAnalysisComponent from './components/AIAnalysisComponent';
import TestGeminiAPI from './components/TestGeminiAPI';
import { processarCronogramaOperacional } from './utils/cronogramaOperacionalProcessor';
import { processarCronogramaOperacional as processarCronogramaOperacionalPFUS3 } from './utils/cronogramaOperacionalProcessorPFUS3';
import { processarCronogramaPreparacao } from './utils/cronogramaPreparacaoProcessor';
import TarefaDetailModal from './components/TarefaDetailModal';
import ParadaHeader from './components/ParadaHeader';
import ImageCarousel from './components/ImageCarousel';

import PhasesNavigation from './components/PhasesNavigation';
import TopNavigation from './components/TopNavigation';
import PhaseExecutiveView from './components/PhaseExecutiveView';
import PhaseDataManager from './components/PhaseDataManager';
import CronogramaUpload from './components/CronogramaUpload';
import PreparacaoUpload from './components/PreparacaoUpload';
import PhaseActivitiesManager from './components/PhaseActivitiesManager';
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
import {
  ParadaData,
  PhaseType,
  Phase,
  getPhasesMockData,
  updateParadaDataWithCalculatedProgress,
} from './types/phases';
import {
  carregarCronogramaLocal,
  existeCronogramaLocal,
  limparCronogramaLocal,
} from './utils/cronogramaProcessor';
import './App.css';

function AppContent() {
  // Estado para lista de imagens do carrossel
  const [imageList, setImageList] = useState<string[]>([
    '/static/img/1.jpg',
    '/static/img/2.jpg',
    '/static/img/3.jpg',
    '/static/img/4.jpg',
    '/static/img/5.jpg',
    '/static/img/6.jpg',
  ]);
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
  const [dataLoadTime, setDataLoadTime] = useState<number>(0);
  const [uploadMode, setUploadMode] = useState<
    'traditional' | 'phases' | 'cronograma' | 'preparacao'
  >('traditional');

  // Estados para cronograma
  const [modoCronograma, setModoCronograma] = useState(true); // Iniciar em modo cronograma
  const [categoriasCronograma, setCategoriasCronograma] = useState<
    CategoriaCronograma[]
  >([]);
  const [resumoCronograma, setResumoCronograma] =
    useState<ResumoCronograma | null>(null);
  const [tarefaSelecionada, setTarefaSelecionada] =
    useState<TarefaCronograma | null>(null);

  // Estados para Analytics Avançados
  const [abaAnalytics, setAbaAnalytics] = useState<
    'kpi' | 'gantt' | 'cpm' | 'tendencias' | 'teste' | 'fases'
  >('kpi');
  const [faseAnalyticsSelecionada, setFaseAnalyticsSelecionada] =
    useState<string>('todas'); // 'todas', 'preparacao', 'parada', 'manutencao', 'partida'
  const [modalTarefaDetalhes, setModalTarefaDetalhes] = useState(false);
  const [dadosPreparacaoProcessados, setDadosPreparacaoProcessados] =
    useState<any>(null);
  const [modoAnalytics, setModoAnalytics] = useState(false); // false = modo Atividades, true = modo Analytics
  const [navegacaoAtiva, setNavegacaoAtiva] = useState(false);

  // Estados para controle das fases da parada
  const [paradaData, setParadaData] = useState<ParadaData>(() => {
    // Tentar carregar dados de preparação salvos na inicialização
    try {
      const savedPreparacao = localStorage.getItem('preparacao_data');
      if (savedPreparacao) {
        const dadosPreparacao = JSON.parse(savedPreparacao);
        console.log('🔄 Inicializando com dados de preparação salvos');
        return getPhasesMockData(dadosPreparacao);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar dados salvos na inicialização:', error);
    }
    return getPhasesMockData();
  });
  const [selectedPhase, setSelectedPhase] = useState<PhaseType>('preparacao');
  const [phasesPFUS3, setPhasesPFUS3] = useState<Phase[]>([]);

  // Função auxiliar para atualizar ParadaData com recálculo automático do progresso geral
  const updateParadaData = useCallback((newParadaData: ParadaData) => {
    const dataWithCalculatedProgress =
      updateParadaDataWithCalculatedProgress(newParadaData);
    setParadaData(dataWithCalculatedProgress);
    console.log(
      '📊 Progresso geral recalculado:',
      dataWithCalculatedProgress.overallProgress + '%'
    );
  }, []);

  // Função auxiliar para atualizar dados de preparação dinamicamente
  const updatePreparacaoData = useCallback(
    (dadosPreparacao: any) => {
      console.log(
        '🔄 Atualizando dados de preparação dinamicamente:',
        dadosPreparacao
      );
      const progressoCalculado =
        dadosPreparacao.fase?.progress ||
        dadosPreparacao.metadata?.progressoGeral ||
        100;
      console.log(
        '📊 Progresso da preparação calculado:',
        progressoCalculado + '%'
      );

      // Regenerar ParadaData com os novos dados de preparação
      const newParadaData = getPhasesMockData(dadosPreparacao);
      console.log(
        '📈 Nova fase de preparação gerada:',
        newParadaData.phases.find((p) => p.id === 'preparacao')
      );

      // Preservar outras fases que podem ter sido atualizadas
      const updatedParadaData = {
        ...newParadaData,
        phases: newParadaData.phases.map((newPhase) => {
          if (newPhase.id === 'preparacao') {
            return newPhase; // Use os novos dados de preparação
          }
          // Manter os dados existentes das outras fases
          const existingPhase = paradaData.phases.find(
            (p) => p.id === newPhase.id
          );
          return existingPhase || newPhase;
        }),
      };

      updateParadaData(updatedParadaData);
      console.log('✅ Dados de preparação atualizados dinamicamente');
    },
    [paradaData.phases, updateParadaData]
  );

  // Estados para filtros de atividades
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('');
  const [filtroFrente, setFiltroFrente] = useState<string>('');
  const [termoPesquisa, setTermoPesquisa] = useState<string>('');

  // Função para calcular progresso de preparação dinamicamente
  const getPreparacaoProgress = useCallback((): number => {
    try {
      const savedPreparacao = localStorage.getItem('preparacao_data');
      if (savedPreparacao) {
        const dadosPreparacao = JSON.parse(savedPreparacao);
        return (
          dadosPreparacao.fase?.progress ||
          dadosPreparacao.metadata?.progressoGeral ||
          100
        );
      }
    } catch (error) {
      console.warn('Erro ao carregar progresso de preparação:', error);
    }
    return 100; // Default para 100% se não houver dados salvos
  }, []);

  // Efeito para sincronizar fases quando dados do CSV Manager mudarem
  useEffect(() => {
    const syncPhasesWithCSVData = () => {
      try {
        const savedPreparacao = localStorage.getItem('preparacao_data');
        if (savedPreparacao) {
          const dadosPreparacao = JSON.parse(savedPreparacao);
          const progressoReal =
            dadosPreparacao.fase?.progress ||
            dadosPreparacao.metadata?.progressoGeral ||
            100;

          console.log(
            '🔄 Sincronizando fases com dados do CSV Manager - Progresso:',
            progressoReal + '%'
          );

          // Force update das fases para refletir os novos dados
          setParadaData((prevData) => {
            const updatedPhases = prevData.phases.map((phase) => {
              if (phase.id === 'preparacao') {
                return {
                  ...phase,
                  progress: progressoReal,
                  status: (progressoReal === 100
                    ? 'completed'
                    : progressoReal > 0
                      ? 'in-progress'
                      : 'not-started') as
                    | 'not-started'
                    | 'in-progress'
                    | 'completed'
                    | 'active',
                };
              }
              return phase;
            });

            return { ...prevData, phases: updatedPhases };
          });

          // Também atualizar phasesPFUS3 se existir
          if (phasesPFUS3.length > 0) {
            setPhasesPFUS3((prevPhases) => {
              return prevPhases.map((phase) => {
                if (phase.id === 'preparacao') {
                  return {
                    ...phase,
                    progress: progressoReal,
                    status: (progressoReal === 100
                      ? 'completed'
                      : progressoReal > 0
                        ? 'in-progress'
                        : 'not-started') as
                      | 'not-started'
                      | 'in-progress'
                      | 'completed'
                      | 'active',
                  };
                }
                return phase;
              });
            });
          }
        }
      } catch (error) {
        console.warn('⚠️ Erro ao sincronizar fases:', error);
      }
    };

    // Sincronizar imediatamente
    syncPhasesWithCSVData();

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preparacao_data') {
        console.log(
          '📢 Detectada mudança nos dados de preparação, sincronizando...'
        );
        syncPhasesWithCSVData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [phasesPFUS3]); // Dependência para reagir a mudanças em phasesPFUS3

  // Função para carregar dados persistidos do backend
  const loadBackendData = useCallback(async () => {
    try {
      console.log('🔄 Backend desabilitado - usando apenas dados locais...');

      // TEMPORARIAMENTE DESABILITADO: chamadas da API estão causando timeouts
      // Quando o backend estiver funcionando, descomente as linhas abaixo

      /*
      // Carregar áreas do backend
      try {
        const areasData = await dashboardAPI.getAreas();
        if (areasData && areasData.length > 0) {
          setAreas(areasData);
          console.log('✅ Áreas carregadas do backend:', areasData.length);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao carregar áreas do backend:', error);
      }
      */

      // Carregar cronograma do backend
      try {
        const cronogramaData = await dashboardAPI.getCronograma();
        if (
          cronogramaData &&
          cronogramaData.atividades &&
          cronogramaData.atividades.length > 0
        ) {
          // Converter dados do backend para formato do frontend
          const categorias: CategoriaCronograma[] = [];
          const atividadesPorCategoria = cronogramaData.atividades.reduce(
            (acc: any, ativ: any) => {
              if (!acc[ativ.categoria]) {
                acc[ativ.categoria] = [];
              }
              acc[ativ.categoria].push({
                id: ativ.id,
                nome: ativ.nome,
                inicio: ativ.dataInicio,
                fim: ativ.dataFim,
                duracao: ativ.duracao,
                percentualCompleto: ativ.percentualCompleto,
                status: ativ.status,
                dependencias: ativ.dependencias || [],
                recursos: ativ.recursos || [],
                responsavel: ativ.responsavel || '',
              });
              return acc;
            },
            {}
          );

          Object.keys(atividadesPorCategoria).forEach((categoria, index) => {
            const tarefas = atividadesPorCategoria[categoria];
            const totalTarefas = tarefas.length;
            const tarefasConcluidas = tarefas.filter(
              (t: any) => t.percentualCompleto >= 100
            ).length;
            const progresso =
              totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 0;

            categorias.push({
              nome: categoria,
              tarefas: tarefas,
              cor: `hsl(${(index * 60) % 360}, 70%, 50%)`, // Cores automáticas
              icone: 'activity', // Ícone padrão
              progresso: progresso,
            });
          });

          // Não posso usar setCategorias aqui pois não existe esse estado,
          // mas os dados estão sendo carregados para uso futuro
          console.log(
            '✅ Cronograma carregado do backend:',
            categorias.length,
            'categorias'
          );
        }
      } catch (error) {
        console.warn('⚠️ Erro ao carregar cronograma do backend:', error);
      }

      // Carregar fases do backend
      try {
        const fasesIds = ['preparacao', 'parada', 'manutencao', 'partida'];
        const fasePromises = fasesIds.map((id) => dashboardAPI.getFase(id));
        const fasesResults = await Promise.allSettled(fasePromises);

        fasesResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.fase) {
            const faseId = fasesIds[index] as PhaseType;
            console.log(`✅ Dados da fase ${faseId} carregados do backend`);
            // Aqui você pode atualizar o estado das fases conforme necessário
          }
        });
      } catch (error) {
        console.warn('⚠️ Erro ao carregar fases do backend:', error);
      }
    } catch (error) {
      console.error('❌ Erro geral ao carregar dados do backend:', error);
    }
  }, []);

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

  // Função para obter os dados corretos das fases (prioriza dados do CSV Manager)
  const getActivePhases = () => {
    // Priorizar dados salvos do CSV Manager se disponíveis
    try {
      const savedPreparacao = localStorage.getItem('preparacao_data');
      if (savedPreparacao) {
        const dadosPreparacao = JSON.parse(savedPreparacao);

        // Atualizar a fase de preparação com dados reais
        const fasesAtualizadas =
          phasesPFUS3.length > 0 ? [...phasesPFUS3] : [...paradaData.phases];

        const indexPreparacao = fasesAtualizadas.findIndex(
          (f) => f.id === 'preparacao'
        );
        if (indexPreparacao !== -1) {
          fasesAtualizadas[indexPreparacao] = {
            ...fasesAtualizadas[indexPreparacao],
            progress:
              dadosPreparacao.fase?.progress ||
              dadosPreparacao.metadata?.progressoGeral ||
              100,
            status:
              dadosPreparacao.fase?.progress === 100
                ? 'completed'
                : dadosPreparacao.fase?.progress > 0
                  ? 'in-progress'
                  : 'not-started',
            completedActivities:
              dadosPreparacao.atividades?.filter(
                (a: any) => a.percentual === 100
              ).length || fasesAtualizadas[indexPreparacao].completedActivities,
            activities:
              dadosPreparacao.atividades?.length ||
              fasesAtualizadas[indexPreparacao].activities,
          };

          console.log(
            '🔄 Fase de preparação atualizada com dados do CSV Manager:',
            fasesAtualizadas[indexPreparacao].progress + '%'
          );
        }

        return fasesAtualizadas;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar dados do CSV Manager:', error);
    }

    return phasesPFUS3.length > 0 ? phasesPFUS3 : paradaData.phases;
  };

  // Função para obter o nome da fase atual
  const getCurrentPhaseName = () => {
    const phase = getActivePhases().find((p) => p.id === selectedPhase);
    return phase ? phase.name : 'Preparação';
  };

  // Funções para gerenciar dados PFUS3
  const loadPFUS3Data = useCallback(async () => {
    try {
      console.log('🚀 loadPFUS3Data: Iniciando carregamento...');

      // Sempre tentar recarregar do arquivo público para pegar mudanças no processador
      try {
        console.log('🔄 Recarregando dados PFUS3 do arquivo público...');

        // Limpar dados salvos para forçar reprocessamento
        localStorage.removeItem('pfus3_phases');
        console.log('🗑️ Dados PFUS3 antigos removidos do localStorage');

        const response = await fetch('/250820 - Report PFUS3.csv');
        if (response.ok) {
          const csvText = await response.text();
          const { processarCronogramaOperacional } = await import(
            './utils/cronogramaOperacionalProcessorPFUS3'
          );
          const processedData = await processarCronogramaOperacional(csvText);

          console.log('✅ Dados PFUS3 reprocessados:', processedData.phases);
          console.log(
            '📊 Total de fases encontradas:',
            processedData.phases.length
          );

          // Mostrar detalhes de cada fase
          processedData.phases.forEach((phase: Phase) => {
            console.log(
              `📋 Fase: ${phase.name} (${phase.id}) - ${phase.activities} atividades - ${phase.progress}%`
            );
          });

          setPhasesPFUS3(processedData.phases);

          // Salvar dados atualizados
          localStorage.setItem(
            'pfus3_phases',
            JSON.stringify(processedData.phases)
          );
          console.log('💾 Dados PFUS3 atualizados salvos no localStorage');

          notifications.success(
            'PFUS3 Atualizado',
            `${processedData.phases.length} fases recarregadas automaticamente`
          );
          return;
        }
      } catch (reloadError) {
        console.log(
          '⚠️ Não foi possível recarregar do arquivo, usando dados salvos...',
          reloadError
        );
      }

      // Fallback: tentar carregar dados salvos
      const savedPhases = localStorage.getItem('pfus3_phases');
      if (savedPhases) {
        const phases = JSON.parse(savedPhases);
        setPhasesPFUS3(phases);
        console.log(
          '✅ Dados PFUS3 carregados do localStorage:',
          phases.length,
          'fases'
        );

        // Notificar sobre carregamento local
        notifications.info(
          'PFUS3 Local',
          `${phases.length} fases carregadas do armazenamento local`
        );
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados PFUS3 salvos:', error);
    }
  }, []); // Removido notifications para evitar loops

  const handlePFUS3PhasesUpdate = useCallback(
    (phases: Phase[]) => {
      console.log(
        '🔄 handlePFUS3PhasesUpdate: Atualizando fases PFUS3:',
        phases
      );
      setPhasesPFUS3(phases);
      notifications.success(
        'Fases Atualizadas',
        `${phases.length} fases carregadas do cronograma PFUS3`
      );
    },
    [] // Removido notifications para evitar loops
  );

  const handlePFUS3UploadSuccess = useCallback(
    (message: string) => {
      notifications.success('Upload Realizado', message);
    },
    [] // Removido notifications para evitar loops
  );

  const handlePFUS3UploadError = useCallback(
    (error: string) => {
      notifications.error('Erro no Upload', error);
    },
    [] // Removido notifications para evitar loops
  );

  // Função para identificar ativos da usina baseado no nome da atividade
  const identificarAtivoUsina = (nomeAtividade: string, area: string) => {
    const nome = nomeAtividade.toLowerCase();
    const areaLower = area.toLowerCase();

    // Ativos principais da usina termoelétrica
    if (nome.includes('precipitador') || areaLower.includes('precipitador')) {
      return 'Precipitadores';
    } else if (nome.includes('caldeira') || areaLower.includes('caldeira')) {
      return 'Caldeiras';
    } else if (nome.includes('turbina') || areaLower.includes('turbina')) {
      return 'Turbinas';
    } else if (nome.includes('gerador') || areaLower.includes('gerador')) {
      return 'Geradores';
    } else if (
      nome.includes('condensador') ||
      areaLower.includes('condensador')
    ) {
      return 'Condensadores';
    } else if (nome.includes('bomba') || areaLower.includes('bomba')) {
      return 'Sistema de Bombas';
    } else if (
      nome.includes('ventilador') ||
      areaLower.includes('ventilador')
    ) {
      return 'Ventiladores';
    } else if (
      nome.includes('chaminé') ||
      nome.includes('chamines') ||
      areaLower.includes('chaminé')
    ) {
      return 'Chaminés';
    } else if (
      nome.includes('transformador') ||
      areaLower.includes('transformador')
    ) {
      return 'Transformadores';
    } else if (
      nome.includes('sistema elétrico') ||
      nome.includes('eletrico') ||
      areaLower.includes('eletrico')
    ) {
      return 'Sistema Elétrico';
    } else if (
      nome.includes('sistema de água') ||
      nome.includes('agua') ||
      areaLower.includes('agua')
    ) {
      return 'Sistema de Água';
    } else if (
      nome.includes('sistema de combustível') ||
      nome.includes('combustivel') ||
      areaLower.includes('combustivel')
    ) {
      return 'Sistema de Combustível';
    } else if (
      nome.includes('instrumentação') ||
      areaLower.includes('instrumentacao')
    ) {
      return 'Instrumentação e Controle';
    } else if (
      nome.includes('estrutura') ||
      nome.includes('civil') ||
      areaLower.includes('estrutura')
    ) {
      return 'Estruturas e Civil';
    } else {
      return 'Outros Equipamentos';
    }
  };

  // Função para organizar atividades por ativos da usina
  const organizarAtividadesPorAtivos = (atividades: any[]) => {
    console.log('🏭 Organizando atividades por ativos da usina...');

    const ativosPorFrente: { [frente: string]: { [ativo: string]: any[] } } =
      {};

    atividades.forEach((atividade) => {
      const frente = atividade.frenteTrabalho;
      const ativo = identificarAtivoUsina(atividade.nome, atividade.area || '');

      // Inicializar estrutura se não existir
      if (!ativosPorFrente[frente]) {
        ativosPorFrente[frente] = {};
      }
      if (!ativosPorFrente[frente][ativo]) {
        ativosPorFrente[frente][ativo] = [];
      }

      // Adicionar atividade como subatividade do ativo
      ativosPorFrente[frente][ativo].push({
        ...atividade,
        isSubatividade: true,
        ativoParent: ativo,
      });
    });

    // Converter para formato hierárquico
    const atividadesHierarquicas: any[] = [];

    Object.keys(ativosPorFrente).forEach((frente) => {
      Object.keys(ativosPorFrente[frente]).forEach((ativo) => {
        const subatividades = ativosPorFrente[frente][ativo];

        // Calcular métricas do ativo baseado nas subatividades
        const percentualMedio =
          subatividades.reduce(
            (acc, sub) => acc + (sub.percentualCompleto || 0),
            0
          ) / subatividades.length;
        const percentualFisicoMedio =
          subatividades.reduce(
            (acc, sub) => acc + (sub.percentualFisico || 0),
            0
          ) / subatividades.length;

        // Determinar status do ativo baseado nas subatividades
        let statusAtivo = 'pendente';
        const concluidas = subatividades.filter(
          (sub) => sub.status === 'concluida'
        ).length;
        const emAndamento = subatividades.filter(
          (sub) => sub.status === 'em-andamento'
        ).length;
        const atrasadas = subatividades.filter(
          (sub) => sub.status === 'atrasada'
        ).length;

        if (concluidas === subatividades.length) {
          statusAtivo = 'concluida';
        } else if (atrasadas > 0) {
          statusAtivo = 'atrasada';
        } else if (emAndamento > 0 || concluidas > 0) {
          statusAtivo = 'em-andamento';
        }

        // Determinar prioridade do ativo
        const prioridadesAltas = subatividades.filter(
          (sub) => sub.prioridade === 'alta'
        ).length;
        let prioridadeAtivo: 'alta' | 'media' | 'baixa' = 'media';
        if (prioridadesAltas > subatividades.length / 2) {
          prioridadeAtivo = 'alta';
        } else if (prioridadesAltas === 0) {
          prioridadeAtivo = 'baixa';
        }

        // Criar o ativo principal
        const ativoMain = {
          id: `ativo-${frente.replace(/\s+/g, '-').toLowerCase()}-${ativo.replace(/\s+/g, '-').toLowerCase()}`,
          nome: ativo,
          frenteTrabalho: frente,
          percentualCompleto: Math.round(percentualMedio),
          percentualFisico: Math.round(percentualFisicoMedio),
          duracao: `${subatividades.length} atividades`,
          inicio:
            subatividades.map((s) => s.inicio).sort()[0] ||
            new Date().toISOString().split('T')[0],
          fim:
            subatividades
              .map((s) => s.fim)
              .sort()
              .reverse()[0] || new Date().toISOString().split('T')[0],
          responsavel: `Coordenador ${ativo}`,
          prioridade: prioridadeAtivo,
          status: statusAtivo,
          dependencias: [],
          recursos: [`Ativo: ${ativo}`, `Equipe ${frente}`],
          fase: subatividades[0]?.fase || 'Operacional',
          categoria: `Ativo da Usina - ${ativo}`,
          nivel: 0, // Nível do ativo principal
          source: 'PFUS3-Ativo',
          edt: subatividades[0]?.edt || '',
          area: ativo,
          isAtivo: true, // Identificador de ativo principal
          subatividades: subatividades.map((sub) => ({
            ...sub,
            nivel: 1, // Nível das subatividades
          })),
          totalSubatividades: subatividades.length,
          subatividadesConcluidas: concluidas,
          subatividadesEmAndamento: emAndamento,
          subatividadesAtrasadas: atrasadas,
        };

        atividadesHierarquicas.push(ativoMain);
      });
    });

    console.log('🏭 Ativos organizados:', atividadesHierarquicas.length);
    console.log('📋 Detalhes dos ativos:');
    atividadesHierarquicas.forEach((ativo) => {
      console.log(
        `  - ${ativo.nome}: ${ativo.totalSubatividades} subatividades (${ativo.subatividadesConcluidas} concluídas)`
      );
    });

    return atividadesHierarquicas;
  };
  const getAtividadesPorFase = (fase: PhaseType) => {
    console.log('🔍 getAtividadesPorFase chamada para fase:', fase);
    console.log(' phasesPFUS3:', phasesPFUS3);
    console.log(' dadosPreparacaoProcessados:', dadosPreparacaoProcessados);

    const atividadesDaFase: any[] = [];

    // PRIORIDADE 0: Usar dados de preparação do CSV se disponível e for fase de preparação
    if (
      fase === 'preparacao' &&
      dadosPreparacaoProcessados &&
      dadosPreparacaoProcessados.atividades &&
      dadosPreparacaoProcessados.atividades.length > 0
    ) {
      console.log(
        '📊 Usando dados de preparação carregados via CSV para fase:',
        fase
      );
      console.log(
        ' Total de atividades de preparação:',
        dadosPreparacaoProcessados.atividades.length
      );

      // Converter dados de preparação para o formato esperado pelo componente
      dadosPreparacaoProcessados.atividades.forEach(
        (item: any, index: number) => {
          // Determinar status baseado no progresso
          let status:
            | 'nao-iniciada'
            | 'em-andamento'
            | 'concluida'
            | 'atrasada' = 'nao-iniciada';
          const progresso = item.percentual || 0;

          if (progresso === 0) {
            status = 'nao-iniciada';
          } else if (progresso > 0 && progresso < 100) {
            status = 'em-andamento';
          } else if (progresso >= 100) {
            status = 'concluida';
          }

          // Verificar se está atrasada (pode adicionar lógica de data aqui)
          const dataFim = new Date(item.dataFim);
          const hoje = new Date();
          if (progresso < 100 && dataFim < hoje) {
            status = 'atrasada';
          }

          atividadesDaFase.push({
            id: item.id || `prep-${index}`,
            nome: item.nome || item.nomeOriginal || `Atividade ${index + 1}`,
            frenteTrabalho: item.categoria || 'Preparação',
            percentualCompleto: progresso,
            percentualFisico:
              item.percentualFisico || Math.max(0, progresso - 5),
            duracao: item.duracao || '1 day',
            inicio: item.dataInicio || new Date().toISOString().split('T')[0],
            fim: item.dataFim || new Date().toISOString().split('T')[0],
            responsavel: 'Coordenador de Preparação',
            prioridade: (item.critica ? 'alta' : 'media') as
              | 'alta'
              | 'media'
              | 'baixa',
            status: status,
            dependencias: [],
            recursos: ['Equipe de Preparação'],
            fase: 'Preparação',
            categoria: item.categoria || 'Atividade de Preparação',
            nivel: item.nivel || 1,
            source: 'CSV-Preparacao',
            edt: '',
            area: item.categoria || 'Preparação',
            descricao: item.nomeOriginal || '',
            observacoes: '',
          });
        }
      );

      console.log(
        `✅ ${atividadesDaFase.length} atividades de preparação carregadas do CSV`
      );
      return atividadesDaFase;
    }

    // PRIORIDADE 1: Usar estrutura hierárquica do PFUS3 se disponível
    if (phasesPFUS3 && phasesPFUS3.length > 0) {
      console.log('🏭 Usando estrutura hierárquica PFUS3 para fase:', fase);

      // Encontrar a fase correspondente no PFUS3
      const phaseFound = phasesPFUS3.find((phase) => {
        // Mapear as fases do sistema para IDs do PFUS3
        const phaseMap: Record<PhaseType, string[]> = {
          preparacao: [
            'preparacao',
            'preparação',
            'mobilização',
            'mobilizacao',
          ],
          parada: ['parada', 'procedimento', 'desligamento'],
          manutencao: ['manutencao', 'manutenção', 'manutenacao'],
          partida: ['partida', 'startup', 'comissionamento'],
        };

        const keywords = phaseMap[fase] || [];
        return keywords.some(
          (keyword) =>
            phase.id.toLowerCase().includes(keyword) ||
            phase.name.toLowerCase().includes(keyword)
        );
      });

      if (
        phaseFound &&
        phaseFound.ativosIdentificados &&
        phaseFound.ativosIdentificados.length > 0
      ) {
        console.log(
          '✅ Encontrada fase PFUS3 com ativos identificados:',
          phaseFound.name
        );
        console.log(
          '🏭 Ativos identificados:',
          phaseFound.ativosIdentificados.length
        );

        // Converter ativos identificados para o formato esperado pelo componente
        phaseFound.ativosIdentificados.forEach((ativo, index) => {
          console.log(
            `🏭 Processando ativo: ${ativo.nome} (${ativo.subatividades?.length || 0} subatividades)`
          );

          // Determinar status do ativo baseado nas subatividades
          let statusAtivo = 'pendente';
          const subatividades = ativo.subatividades || [];
          const concluidas = subatividades.filter(
            (sub: any) => (sub.percentualCompleto || 0) >= 100
          ).length;
          const emAndamento = subatividades.filter(
            (sub: any) =>
              (sub.percentualCompleto || 0) > 0 &&
              (sub.percentualCompleto || 0) < 100
          ).length;
          const atrasadas = subatividades.filter(
            (sub: any) => sub.status === 'atrasada'
          ).length;

          if (concluidas === subatividades.length) {
            statusAtivo = 'concluida';
          } else if (atrasadas > 0) {
            statusAtivo = 'atrasada';
          } else if (emAndamento > 0 || concluidas > 0) {
            statusAtivo = 'em-andamento';
          }

          // Determinar prioridade do ativo
          const prioridadesAltas = subatividades.filter(
            (sub: any) =>
              sub.status === 'atrasada' ||
              sub.name?.toLowerCase().includes('crítica')
          ).length;
          let prioridadeAtivo: 'alta' | 'media' | 'baixa' = 'media';
          if (prioridadesAltas > subatividades.length / 2) {
            prioridadeAtivo = 'alta';
          } else if (prioridadesAltas === 0) {
            prioridadeAtivo = 'baixa';
          }

          // Criar ativo principal para renderização
          const ativoMain = {
            id: ativo.id || `ativo-${index}`,
            nome: ativo.nome || `Ativo ${index + 1}`,
            frenteTrabalho: ativo.faseNome || phaseFound.name,
            percentualCompleto: ativo.progresso || 0,
            percentualFisico: Math.max(0, (ativo.progresso || 0) - 5),
            duracao: `${subatividades.length} atividades`,
            inicio: ativo.dataInicio || new Date().toISOString().split('T')[0],
            fim: ativo.dataFim || new Date().toISOString().split('T')[0],
            responsavel: `Coordenador ${ativo.tipo}`,
            prioridade: prioridadeAtivo,
            status: statusAtivo,
            dependencias: [],
            recursos: [`Ativo: ${ativo.tipo}`, `Equipe ${ativo.nome}`],
            fase: fase === 'preparacao' ? 'Preparação' : 'Operacional',
            categoria: `Ativo da Usina - ${ativo.tipo}`,
            nivel: ativo.nivel || 3,
            source: 'PFUS3-Hierarquico',
            edt: ativo.edt || '',
            area: ativo.area || ativo.tipo,

            // Propriedades específicas para ativos da usina
            isAtivo: true,
            tipo: ativo.tipo,
            totalSubatividades: subatividades.length,
            subatividadesConcluidas: concluidas,
            subatividadesEmAndamento: emAndamento,
            subatividadesAtrasadas: atrasadas,

            // Subatividades convertidas para o formato do componente
            subatividades: subatividades.map((sub: any, subIndex: number) => ({
              id: sub.id || `${ativo.id}-sub-${subIndex}`,
              nome: sub.name || `Subatividade ${subIndex + 1}`,
              frenteTrabalho: ativo.nome,
              percentualCompleto: sub.percentualCompleto || 0,
              percentualFisico: Math.max(0, (sub.percentualCompleto || 0) - 3),
              duracao: sub.duration || '1 day',
              inicio: sub.start || new Date().toISOString().split('T')[0],
              fim: sub.finish || new Date().toISOString().split('T')[0],
              responsavel: sub.responsible || 'Técnico',
              prioridade: sub.status === 'atrasada' ? 'alta' : ('media' as any),
              status: sub.status || ('pendente' as any),
              dependencias: [],
              recursos: [`Recurso ${subIndex + 1}`],
              fase: fase === 'preparacao' ? 'Preparação' : 'Operacional',
              categoria: `Subatividade - ${ativo.tipo}`,
              nivel: sub.nivel || 4,
              source: 'PFUS3-Subatividade',
              edt: sub.edt || '',
              area: sub.area || ativo.area,

              // Propriedades para subatividades
              isSubatividade: true,
              ativoParent: ativo.nome,
            })),
          };

          atividadesDaFase.push(ativoMain);
        });

        console.log(
          '🏭 Total de ativos PFUS3 hierárquicos processados:',
          atividadesDaFase.length
        );
        console.log('🎯 Ativos encontrados:');
        atividadesDaFase.forEach((ativo) => {
          console.log(
            `  - ${ativo.nome}: ${ativo.totalSubatividades} subatividades (${ativo.subatividadesConcluidas} concluídas)`
          );
        });

        if (atividadesDaFase.length > 0) {
          console.log(
            '✅ Retornando ativos PFUS3 hierárquicos para fase:',
            fase
          );
          return atividadesDaFase;
        }
      }

      // FALLBACK: Se não tem ativos identificados, usar o método anterior com processedActivities
      if (
        phaseFound &&
        phaseFound.processedActivities &&
        phaseFound.processedActivities.length > 0
      ) {
        console.log('⚠️ Fallback: usando processedActivities da fase PFUS3');

        // Usar o código anterior como fallback
        phaseFound.processedActivities.forEach((activity, index) => {
          // ... código anterior para processar atividades individuais
          const atividade = {
            id: activity.id || `pfus3-${fase}-${index}`,
            nome: activity.name || `Atividade ${index + 1}`,
            frenteTrabalho: activity.area || 'Outras Atividades',
            percentualCompleto: activity.percentualCompleto || 0,
            percentualFisico: Math.max(
              0,
              (activity.percentualCompleto || 0) - 5
            ),
            duracao: activity.duration || '1 day',
            inicio: activity.start || new Date().toISOString().split('T')[0],
            fim: activity.finish || new Date().toISOString().split('T')[0],
            responsavel: activity.responsible || 'Coordenador',
            prioridade: 'media' as any,
            status: activity.status || ('pendente' as any),
            dependencias: [],
            recursos: [`Recurso ${activity.area}`, `Equipamento ${index + 1}`],
            fase: fase === 'preparacao' ? 'Preparação' : 'Operacional',
            categoria: `PFUS3 - ${activity.area || 'Geral'}`,
            nivel: activity.nivel || 0,
            source: 'PFUS3-Fallback',
            edt: activity.edt || '',
            area: activity.area || '',
          };

          atividadesDaFase.push(atividade);
        });

        if (atividadesDaFase.length > 0) {
          console.log(
            '✅ Retornando atividades PFUS3 fallback para fase:',
            fase
          );
          return atividadesDaFase;
        }
      }
    }

    console.log('✅ getAtividadesPorFase finalizada');
    console.log('📊 Total de atividades encontradas:', atividadesDaFase.length);
    console.log('🎯 Primeiras 3 atividades:', atividadesDaFase.slice(0, 3));

    return atividadesDaFase;
  };

  // Função para aplicar filtros às atividades
  const aplicarFiltrosAtividades = (atividades: any[]) => {
    console.log('🔍 Aplicando filtros:', {
      filtroStatus,
      filtroPrioridade,
      filtroFrente,
      termoPesquisa,
    });
    console.log('📊 Atividades antes do filtro:', atividades.length);

    const resultado = atividades.filter((atividade) => {
      let passaFiltro = true;

      // Debug da atividade atual
      console.log('🔎 Verificando atividade:', {
        nome: atividade.nome,
        status: atividade.status,
        percentual: atividade.percentualCompleto,
        prioridade: atividade.prioridade,
        frente: atividade.frenteTrabalho,
      });

      // Filtro por Pesquisa
      if (termoPesquisa && termoPesquisa.trim()) {
        const termoBusca = termoPesquisa.toLowerCase().trim();
        const nome = (atividade.nome || '').toLowerCase();
        const frente = (atividade.frenteTrabalho || '').toLowerCase();
        const responsavel = (atividade.responsavel || '').toLowerCase();

        passaFiltro =
          nome.includes(termoBusca) ||
          frente.includes(termoBusca) ||
          responsavel.includes(termoBusca);

        if (!passaFiltro) {
          console.log('❌ Filtro de pesquisa rejeitou:', atividade.nome);
          return false;
        }
      }

      // Filtro por Status
      if (filtroStatus) {
        const status = atividade.status?.toLowerCase() || '';
        const percentual = atividade.percentualCompleto || 0;

        switch (filtroStatus) {
          case 'completa':
            passaFiltro = status.includes('completa') || percentual >= 100;
            break;
          case 'em_andamento':
            passaFiltro =
              status.includes('andamento') ||
              (percentual > 0 && percentual < 100);
            break;
          case 'pendente':
            passaFiltro = status.includes('pendente') || percentual === 0;
            break;
          case 'atrasada':
            // Verificar se está atrasada baseado na data
            const hoje = new Date();
            const fimPrevisto = new Date(atividade.fim);
            passaFiltro =
              status.includes('atrasada') ||
              (fimPrevisto < hoje && percentual < 100);
            break;
        }

        if (!passaFiltro) {
          console.log('❌ Filtro por status rejeitou:', atividade.nome);
          return false;
        }
      }

      // Filtro por Prioridade
      if (filtroPrioridade) {
        const prioridade = atividade.prioridade?.toLowerCase() || '';
        passaFiltro = prioridade.includes(filtroPrioridade);

        if (!passaFiltro) {
          console.log('❌ Filtro por prioridade rejeitou:', atividade.nome);
          return false;
        }
      }

      // Filtro por Frente de Trabalho
      if (filtroFrente) {
        const frente = atividade.frenteTrabalho?.toLowerCase() || '';
        switch (filtroFrente) {
          case 'manutencao':
            passaFiltro =
              frente.includes('manutenção') || frente.includes('manutencao');
            break;
          case 'logistica':
            passaFiltro =
              frente.includes('logística') || frente.includes('logistica');
            break;
          case 'refratario':
            passaFiltro =
              frente.includes('refratário') || frente.includes('refratario');
            break;
          case 'mobilizacao':
            passaFiltro =
              frente.includes('mobilização') || frente.includes('mobilizacao');
            break;
          case 'testes':
            passaFiltro =
              frente.includes('testes') || frente.includes('comissionamento');
            break;
          case 'inspecao':
            passaFiltro =
              frente.includes('inspeção') ||
              frente.includes('inspecao') ||
              frente.includes('controle');
            break;
          default:
            passaFiltro = true;
        }

        if (!passaFiltro) {
          console.log('❌ Filtro por frente rejeitou:', atividade.nome);
          return false;
        }
      }

      console.log('✅ Atividade passou por todos os filtros:', atividade.nome);
      return true;
    });

    console.log('📈 Atividades após filtro:', resultado.length);
    return resultado;
  };

  // Função para obter atividades filtradas
  const getAtividadesFiltradas = (fase: PhaseType) => {
    const atividades = getAtividadesPorFase(fase);
    return aplicarFiltrosAtividades(atividades);
  };

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setFiltroStatus('');
    setFiltroPrioridade('');
    setFiltroFrente('');
    setTermoPesquisa('');
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
          updateParadaData(novasParadaData);
          setModoCronograma(true);

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

        // Carregar cronograma operacional, preparação E arquivo PFUS3
        console.log('📥 Iniciando fetch dos arquivos CSV...');
        const [operacionalResponse, preparacaoResponse, pfus3Response] =
          await Promise.all([
            fetch('/cronograma-operacional.csv'),
            fetch('/290805 - Cronograma Preparação - PFUS3.csv'),
            fetch('/250820 - Report PFUS3.csv'),
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
          pfus3: {
            ok: pfus3Response.ok,
            status: pfus3Response.status,
          },
        });

        if (operacionalResponse.ok && preparacaoResponse.ok) {
          console.log('✅ CSVs encontrados! Processando dados reais...');

          const [operacionalContent, preparacaoContent] = await Promise.all([
            operacionalResponse.text(),
            preparacaoResponse.text(),
          ]);

          // Processar arquivo PFUS3 se disponível
          let pfus3Content = '';
          if (pfus3Response.ok) {
            pfus3Content = await pfus3Response.text();
            console.log('📄 Arquivo PFUS3 carregado com sucesso!');
          } else {
            console.log(
              '⚠️ Arquivo PFUS3 não encontrado, continuando sem ele...'
            );
          }

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

          // Processar arquivo PFUS3 se disponível
          let dadosPFUS3: Phase[] = [];
          if (pfus3Content) {
            try {
              console.log('🚀 Processando arquivo PFUS3...');
              const processedPFUS3 =
                await processarCronogramaOperacionalPFUS3(pfus3Content);

              // Converter para array de fases
              if (
                processedPFUS3.phases &&
                Array.isArray(processedPFUS3.phases)
              ) {
                dadosPFUS3 = processedPFUS3.phases;
                console.log(
                  '✅ Arquivo PFUS3 processado:',
                  dadosPFUS3.length,
                  'fases'
                );

                // Atualizar estado PFUS3
                setPhasesPFUS3(dadosPFUS3);

                // Notificar sucesso
                notifications.success(
                  'PFUS3 Integrado',
                  `${dadosPFUS3.length} fases carregadas automaticamente do arquivo PFUS3`
                );
              } else {
                console.warn('⚠️ Estrutura PFUS3 inválida:', processedPFUS3);
                notifications.warning(
                  'PFUS3 Estrutura',
                  'Arquivo PFUS3 processado mas estrutura de fases não encontrada'
                );
              }
            } catch (pfus3Error) {
              console.warn('⚠️ Erro ao processar PFUS3:', pfus3Error);
              notifications.warning(
                'PFUS3 Parcial',
                'Arquivo PFUS3 encontrado mas houve erro no processamento'
              );
            }
          }

          console.log('📊 Dados processados com sucesso!');

          // Verificar se já existem dados de preparação salvos antes de sobrescrever
          const existingSavedData = localStorage.getItem('preparacao_data');
          if (existingSavedData) {
            console.log(
              '⚠️ Dados de preparação já existem no localStorage - não sobrescrevendo'
            );
            console.log(
              '🔄 Usando dados de preparação salvos em vez dos processados do CSV'
            );

            // Usar dados salvos em vez dos processados
            try {
              const dadosPreparacaoSalvos = JSON.parse(existingSavedData);
              setDadosPreparacaoProcessados(dadosPreparacaoSalvos);
              console.log(
                '✅ Dados de preparação salvos carregados com progresso:',
                dadosPreparacaoSalvos.fase?.progress ||
                  dadosPreparacaoSalvos.metadata?.progressoGeral ||
                  0
              );
            } catch (error) {
              console.warn(
                '⚠️ Erro ao carregar dados salvos, usando dados processados:',
                error
              );
              setDadosPreparacaoProcessados(dadosPreparacao);
            }
          } else {
            // Armazenar dados de preparação processados para uso no modal apenas se não existem dados salvos
            setDadosPreparacaoProcessados(dadosPreparacao);
            console.log(
              '🔍 Dados de preparação armazenados (carregamento principal):',
              {
                estrutura: dadosPreparacao,
                atividades: dadosPreparacao.atividades?.length || 0,
                primeiraAtividade: dadosPreparacao.atividades?.[0],
              }
            );
          }

          // IMPORTANTE: Criar categoriasCronograma a partir dos dados reais processados
          console.log(
            '🔄 Criando categorias do cronograma a partir dos dados reais...'
          );
          const categoriasCronogramaReais: CategoriaCronograma[] = [];

          // Adicionar atividades de preparação
          if (
            dadosPreparacao.atividades &&
            dadosPreparacao.atividades.length > 0
          ) {
            // Verificar se existem dados salvos para usar o progresso correto
            let progressoReal = 100; // Default para 100%
            try {
              const savedData = localStorage.getItem('preparacao_data');
              if (savedData) {
                const dadosSalvos = JSON.parse(savedData);
                progressoReal =
                  dadosSalvos.fase?.progress ||
                  dadosSalvos.metadata?.progressoGeral ||
                  100;
                console.log(
                  '🔄 Usando progresso real da preparação:',
                  progressoReal + '%'
                );
              }
            } catch (error) {
              console.warn('⚠️ Erro ao carregar progresso salvo:', error);
            }

            const categoriaPreparacao: CategoriaCronograma = {
              nome: 'Preparação PFUS3',
              cor: '#10B981', // Verde
              icone: '🔧',
              progresso: progressoReal, // Usar progresso real em vez de calcular média
              tarefas: dadosPreparacao.atividades.map(
                (atividade) =>
                  ({
                    id: atividade.id || Math.random().toString(),
                    nome: atividade.nome,
                    percentualCompleto: atividade.percentual,
                    percentualFisico: atividade.percentual,
                    percentualReplanejamento: 0,
                    percentualFisicoPrev: atividade.percentual,
                    percentualFisicoReplan: atividade.percentual,
                    percentualFisicoCalc: atividade.percentual,
                    duracao: `${atividade.duracao || 1} days`,
                    inicio:
                      atividade.dataInicio ||
                      new Date().toISOString().split('T')[0],
                    fim:
                      atividade.dataFim ||
                      new Date().toISOString().split('T')[0],
                    inicioBaseline:
                      atividade.dataInicio ||
                      new Date().toISOString().split('T')[0],
                    fimBaseline:
                      atividade.dataFim ||
                      new Date().toISOString().split('T')[0],
                    nivel: atividade.nivel || 0,
                    categoria: 'Preparação',
                    // Campos personalizados (não na interface padrão, mas funcionais)
                    responsavel:
                      (atividade as any).responsavel || 'Equipe Preparação',
                    prioridade: atividade.critica ? 'alta' : 'media',
                    status:
                      atividade.percentual >= 100
                        ? 'concluida'
                        : atividade.percentual > 0
                          ? 'em-andamento'
                          : 'pendente',
                    dependencias: (atividade as any).dependencias || [],
                    recursos: (atividade as any).recursos || [],
                    fase: 'Preparação',
                  }) as TarefaCronograma & {
                    responsavel: string;
                    prioridade: string;
                    status: string;
                    dependencias: string[];
                    recursos: string[];
                    fase: string;
                  }
              ),
            };
            categoriasCronogramaReais.push(categoriaPreparacao);
          }

          // Adicionar atividades operacionais separadas por fases específicas
          if (
            dadosOperacional.atividades &&
            dadosOperacional.atividades.length > 0
          ) {
            // Separar atividades por fases
            const atividadesParada = dadosOperacional.atividades.filter(
              (a) =>
                a.nome?.includes('Corte') ||
                a.nome?.includes('Blackout') ||
                a.nome?.includes('Procedimentos de Parada')
            );

            const atividadesManutencao = dadosOperacional.atividades.filter(
              (a) =>
                a.nome?.includes('Manutenção') && !a.nome?.includes('Início')
            );

            const atividadesPartida = dadosOperacional.atividades.filter(
              (a) =>
                a.nome?.includes('Procedimentos de Partida') ||
                a.nome?.includes('Sincronização') ||
                a.nome?.includes('Partida')
            );

            // Outras atividades operacionais não categorizadas
            const outrasAtividades = dadosOperacional.atividades.filter(
              (a) =>
                !atividadesParada.includes(a) &&
                !atividadesManutencao.includes(a) &&
                !atividadesPartida.includes(a)
            );

            // Função auxiliar para criar categoria de fase
            const criarCategoriaFase = (
              nome: string,
              atividades: any[],
              cor: string,
              icone: string,
              categoria: string
            ) => {
              if (atividades.length === 0) return null;

              return {
                nome,
                cor,
                icone,
                progresso: Math.round(
                  (atividades.filter((a) => a.status === 'completed').length *
                    100) /
                    atividades.length
                ),
                tarefas: atividades.map(
                  (atividade) =>
                    ({
                      id: atividade.id || Math.random().toString(),
                      nome: atividade.nome,
                      percentualCompleto:
                        atividade.status === 'completed'
                          ? 100
                          : atividade.status === 'in-progress'
                            ? 50
                            : 0,
                      percentualFisico:
                        atividade.status === 'completed'
                          ? 100
                          : atividade.status === 'in-progress'
                            ? 50
                            : 0,
                      percentualReplanejamento: 0,
                      percentualFisicoPrev:
                        atividade.status === 'completed' ? 100 : 50,
                      percentualFisicoReplan:
                        atividade.status === 'completed' ? 100 : 50,
                      percentualFisicoCalc:
                        atividade.status === 'completed' ? 100 : 50,
                      duracao: `${atividade.duracao || 1} days`,
                      inicio:
                        atividade.dataInicio ||
                        new Date().toISOString().split('T')[0],
                      fim:
                        atividade.dataFim ||
                        new Date().toISOString().split('T')[0],
                      inicioBaseline:
                        atividade.dataInicio ||
                        new Date().toISOString().split('T')[0],
                      fimBaseline:
                        atividade.dataFim ||
                        new Date().toISOString().split('T')[0],
                      nivel: atividade.nivel || 0,
                      categoria,
                      // Campos personalizados
                      responsavel:
                        atividade.responsavel || `Equipe ${categoria}`,
                      prioridade: (atividade as any).critica ? 'alta' : 'media',
                      status:
                        atividade.status === 'completed'
                          ? 'concluida'
                          : atividade.status === 'in-progress'
                            ? 'em-andamento'
                            : 'pendente',
                      dependencias: (atividade as any).dependencias || [],
                      recursos: (atividade as any).recursos || [],
                      fase: categoria,
                    }) as TarefaCronograma & {
                      responsavel: string;
                      prioridade: string;
                      status: string;
                      dependencias: string[];
                      recursos: string[];
                      fase: string;
                    }
                ),
              };
            };

            // Criar categorias separadas para cada fase
            const categoriaParada = criarCategoriaFase(
              'Parada',
              atividadesParada,
              '#DC2626', // Vermelho
              '⏸️',
              'Parada'
            );

            const categoriaManutencao = criarCategoriaFase(
              'Manutenção',
              atividadesManutencao,
              '#F59E0B', // Laranja
              '🔧',
              'Manutenção'
            );

            const categoriaPartida = criarCategoriaFase(
              'Partida',
              atividadesPartida,
              '#10B981', // Verde
              '▶️',
              'Partida'
            );

            const categoriaOperacional = criarCategoriaFase(
              'Outras Operacionais',
              outrasAtividades,
              '#3B82F6', // Azul
              '⚙️',
              'Operacional'
            );

            // Adicionar categorias válidas
            [
              categoriaParada,
              categoriaManutencao,
              categoriaPartida,
              categoriaOperacional,
            ]
              .filter(Boolean)
              .forEach((categoria) => {
                categoriasCronogramaReais.push(
                  categoria as CategoriaCronograma
                );
              });

            console.log('🔧 Fases operacionais criadas:', {
              parada: atividadesParada.length,
              manutencao: atividadesManutencao.length,
              partida: atividadesPartida.length,
              outras: outrasAtividades.length,
            });
          }

          // Adicionar dados do arquivo PFUS3 se disponível para análise completa
          if (dadosPFUS3 && dadosPFUS3.length > 0) {
            console.log('📄 Processando dados PFUS3 para KPIs...');

            // Agrupar fases PFUS3 por tipo para análise completa
            dadosPFUS3.forEach((fase) => {
              // Verificar se já existe uma categoria similar
              const categoriaExistente = categoriasCronogramaReais.find((cat) =>
                cat.nome
                  .toLowerCase()
                  .includes(fase.name.toLowerCase().split(' ')[0])
              );

              if (
                !categoriaExistente &&
                fase.processedActivities &&
                fase.processedActivities.length > 0
              ) {
                // Criar nova categoria baseada na fase PFUS3
                const categoriaPFUS3: CategoriaCronograma = {
                  nome: `${fase.name} (PFUS3)`,
                  cor:
                    fase.color === 'text-green-600'
                      ? '#10B981'
                      : fase.color === 'text-red-600'
                        ? '#DC2626'
                        : fase.color === 'text-orange-600'
                          ? '#F59E0B'
                          : fase.color === 'text-blue-600'
                            ? '#3B82F6'
                            : '#6B7280',
                  icone:
                    fase.icon === 'Power'
                      ? '⏸️'
                      : fase.icon === 'Wrench'
                        ? '🔧'
                        : fase.icon === 'Play'
                          ? '▶️'
                          : fase.icon === 'Settings'
                            ? '🔧'
                            : '📋',
                  progresso: fase.progress || 0,
                  tarefas: fase.processedActivities.map(
                    (atividade: any, index: number) => ({
                      id:
                        parseInt(`${Date.now()}${index}`) ||
                        Math.floor(Math.random() * 1000000),
                      nome:
                        atividade.name ||
                        atividade.nome ||
                        `Atividade ${index + 1}`,
                      percentualCompleto:
                        atividade.progress || atividade.percentual || 0,
                      percentualFisico:
                        atividade.progress || atividade.percentual || 0,
                      percentualReplanejamento: 0,
                      percentualFisicoPrev:
                        atividade.progress || atividade.percentual || 0,
                      percentualFisicoReplan:
                        atividade.progress || atividade.percentual || 0,
                      percentualFisicoCalc:
                        atividade.progress || atividade.percentual || 0,
                      duracao: `${atividade.duration || atividade.duracao || 1} days`,
                      inicio:
                        atividade.startDate ||
                        atividade.dataInicio ||
                        new Date().toISOString().split('T')[0],
                      fim:
                        atividade.endDate ||
                        atividade.dataFim ||
                        new Date().toISOString().split('T')[0],
                      inicioBaseline:
                        atividade.startDate ||
                        atividade.dataInicio ||
                        new Date().toISOString().split('T')[0],
                      fimBaseline:
                        atividade.endDate ||
                        atividade.dataFim ||
                        new Date().toISOString().split('T')[0],
                      nivel: 1,
                      categoria: fase.name,
                      responsavel:
                        atividade.responsible ||
                        atividade.responsavel ||
                        `Equipe ${fase.name}`,
                      prioridade:
                        atividade.critical || atividade.critica
                          ? 'alta'
                          : 'media',
                      status:
                        (atividade.progress || atividade.percentual) >= 100
                          ? 'concluida'
                          : (atividade.progress || atividade.percentual) > 0
                            ? 'em-andamento'
                            : 'pendente',
                      dependencias: atividade.dependencias || [],
                      recursos: atividade.recursos || [],
                      fase: fase.name,
                    })
                  ),
                };

                categoriasCronogramaReais.push(categoriaPFUS3);
                console.log(
                  `✅ Categoria PFUS3 adicionada: ${fase.name} com ${fase.processedActivities.length} atividades`
                );
              } else if (!categoriaExistente && fase.activities > 0) {
                // Criar categoria apenas com informações básicas se não há atividades processadas
                const categoriaPFUS3Basica: CategoriaCronograma = {
                  nome: `${fase.name} (PFUS3)`,
                  cor:
                    fase.color === 'text-green-600'
                      ? '#10B981'
                      : fase.color === 'text-red-600'
                        ? '#DC2626'
                        : fase.color === 'text-orange-600'
                          ? '#F59E0B'
                          : fase.color === 'text-blue-600'
                            ? '#3B82F6'
                            : '#6B7280',
                  icone:
                    fase.icon === 'Power'
                      ? '⏸️'
                      : fase.icon === 'Wrench'
                        ? '🔧'
                        : fase.icon === 'Play'
                          ? '▶️'
                          : fase.icon === 'Settings'
                            ? '🔧'
                            : '📋',
                  progresso: fase.progress || 0,
                  tarefas: [], // Vazio se não há atividades processadas disponíveis
                };

                categoriasCronogramaReais.push(categoriaPFUS3Basica);
                console.log(
                  `✅ Categoria PFUS3 básica adicionada: ${fase.name} (${fase.activities} atividades)`
                );
              }
            });

            console.log(
              '📊 Total de categorias após PFUS3:',
              categoriasCronogramaReais.length
            );
          }

          console.log(
            '✅ Categorias do cronograma criadas:',
            categoriasCronogramaReais
          );
          console.log(
            '📊 Total de categorias:',
            categoriasCronogramaReais.length
          );
          console.log(
            '📋 Total de tarefas:',
            categoriasCronogramaReais.reduce(
              (acc, cat) => acc + cat.tarefas.length,
              0
            )
          );

          // Definir as categorias do cronograma
          setCategoriasCronograma(categoriasCronogramaReais);

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
              dadosPreparacao.metadata.progressoGeral || 100
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

          // Função para lidar com dados das fases carregados
          const handlePhasesDataUpdated = (phasesData: Record<string, any>) => {
            console.log('Dados das fases atualizados:', phasesData);
            // ...existing code...
            // Atualizar dados das fases no paradaData
            const updatedPhases = paradaData.phases.map((phase) => {
              const phaseData = phasesData[phase.id];
              if (phaseData) {
                return {
                  ...phase,
                  completedActivities:
                    phaseData.activities?.filter(
                      (a: any) => a.status === 'concluida'
                    ).length || phase.completedActivities,
                  delayedActivities:
                    phaseData.activities?.filter(
                      (a: any) => a.status === 'atrasada'
                    ).length || phase.delayedActivities,
                  criticalActivities:
                    phaseData.activities?.filter(
                      (a: any) => a.criticidade === 'alta'
                    ).length || phase.criticalActivities,
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

            updateParadaData({
              ...paradaData,
              phases: updatedPhases,
            });

            notifications.success(
              'Dados Atualizados',
              'Dados das fases foram atualizados com base nos arquivos carregados'
            );
          };
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

            // Verificar se já existem dados de preparação salvos antes de sobrescrever
            const existingSavedData = localStorage.getItem('preparacao_data');
            if (existingSavedData) {
              console.log(
                '⚠️ Dados de preparação já existem no localStorage - não sobrescrevendo (bloco processamento)'
              );
              try {
                const dadosPreparacaoSalvos = JSON.parse(existingSavedData);
                setDadosPreparacaoProcessados(dadosPreparacaoSalvos);
                console.log(
                  '✅ Dados de preparação salvos mantidos com progresso:',
                  dadosPreparacaoSalvos.fase?.progress ||
                    dadosPreparacaoSalvos.metadata?.progressoGeral ||
                    0
                );
              } catch (error) {
                console.warn(
                  '⚠️ Erro ao carregar dados salvos (bloco processamento), usando dados processados:',
                  error
                );
                setDadosPreparacaoProcessados(dadosPreparacao);
              }
            } else {
              // Armazenar dados de preparação processados para uso no modal apenas se não existem dados salvos
              setDadosPreparacaoProcessados(dadosPreparacao);
              console.log('🔍 Dados de preparação armazenados:', {
                estrutura: dadosPreparacao,
                atividades: dadosPreparacao.atividades?.length || 0,
                primeiraAtividade: dadosPreparacao.atividades?.[0],
              });
            }

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
                dadosPreparacao.metadata.progressoGeral || 100
              ), // Usar progresso real da preparação
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
            updateParadaData({
              ...paradaData,
              phases: todasFases,
            });

            setResumoCronograma(resumoCombinado);
            setModoCronograma(true);
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

  // Função para carregamento automático de CSV quando não há dados disponíveis
  const autoLoadCSVData = useCallback(async () => {
    console.log('🚀 Iniciando carregamento automático de CSV...');
    try {
      // Primeiro, tentar carregar preparação
      try {
        const responsePrep = await fetch(
          '/290805 - Cronograma Preparação - PFUS3.csv'
        );
        if (responsePrep.ok) {
          const csvTextPrep = await responsePrep.text();
          console.log('✅ CSV Preparação carregado automaticamente!');
          const dadosPreparacao =
            await processarCronogramaPreparacao(csvTextPrep);

          console.log(
            '🔍 Dados de preparação processados (carregamento automático):',
            {
              estrutura: dadosPreparacao,
              atividades: dadosPreparacao.atividades?.length || 0,
              primeiraAtividade: dadosPreparacao.atividades?.[0],
            }
          );

          // Armazenar dados de preparação processados
          setDadosPreparacaoProcessados(dadosPreparacao);

          // Converter para o formato de categorias
          const categoriaPreparacao: CategoriaCronograma = {
            nome: 'Preparação PFUS3',
            cor: '#10B981', // Verde
            icone: '🔧',
            progresso: Math.round(
              dadosPreparacao.atividades.reduce(
                (acc, a) => acc + a.percentual,
                0
              ) / dadosPreparacao.atividades.length
            ),
            tarefas: dadosPreparacao.atividades.map(
              (atividade) =>
                ({
                  id: atividade.id || Math.random().toString(),
                  nome: atividade.nome,
                  percentualCompleto: atividade.percentual,
                  percentualFisico: atividade.percentual,
                  percentualReplanejamento: 0,
                  percentualFisicoPrev: atividade.percentual,
                  percentualFisicoReplan: atividade.percentual,
                  percentualFisicoCalc: atividade.percentual,
                  duracao: `${atividade.duracao || 1} days`,
                  inicio:
                    atividade.dataInicio ||
                    new Date().toISOString().split('T')[0],
                  fim:
                    atividade.dataFim || new Date().toISOString().split('T')[0],
                  inicioBaseline:
                    atividade.dataInicio ||
                    new Date().toISOString().split('T')[0],
                  fimBaseline:
                    atividade.dataFim || new Date().toISOString().split('T')[0],
                  nivel: atividade.nivel || 0,
                  categoria: 'Preparação',
                  responsavel:
                    (atividade as any).responsavel || 'Equipe Preparação',
                  prioridade: atividade.critica ? 'alta' : 'media',
                  status:
                    atividade.percentual >= 100
                      ? 'concluida'
                      : atividade.percentual > 0
                        ? 'em-andamento'
                        : 'pendente',
                  dependencias: (atividade as any).dependencias || [],
                  recursos: (atividade as any).recursos || [],
                  fase: 'Preparação',
                }) as TarefaCronograma & {
                  responsavel: string;
                  prioridade: string;
                  status: string;
                  dependencias: any[];
                  recursos: any[];
                  fase: string;
                }
            ),
          };

          setCategoriasCronograma([categoriaPreparacao]);

          const concluidas = dadosPreparacao.atividades.filter(
            (a) => a.percentual >= 100
          ).length;
          const emAndamento = dadosPreparacao.atividades.filter(
            (a) => a.percentual > 0 && a.percentual < 100
          ).length;
          const pendentes = dadosPreparacao.atividades.filter(
            (a) => a.percentual === 0
          ).length;

          setResumoCronograma({
            progressoGeral: Math.round(
              (concluidas / dadosPreparacao.atividades.length) * 100
            ),
            totalTarefas: dadosPreparacao.atividades.length,
            tarefasConcluidas: concluidas,
            tarefasEmAndamento: emAndamento,
            tarefasPendentes: pendentes,
            diasRestantes: 30, // Valor padrão
            dataPrevistaConclusao: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split('T')[0],
            statusGeral: {
              totalAtividades: dadosPreparacao.atividades.length,
              atividadesEmDia: emAndamento + concluidas,
              atividadesAtrasadas: 0,
              atividadesAdiantadas: 0,
              atividadesCriticas: dadosPreparacao.atividades.filter(
                (a) => a.critica
              ).length,
              progressoMedio: Math.round(
                (concluidas / dadosPreparacao.atividades.length) * 100
              ),
            },
          });
          return; // Se conseguiu carregar preparação, não precisa tentar operacional
        }
      } catch (errorPrep) {
        console.warn(
          '⚠️ Erro ao carregar preparação automaticamente:',
          errorPrep
        );
      }

      // Se não conseguiu preparação, tentar operacional
      try {
        const responseOper = await fetch('/cronograma-operacional.csv');
        if (responseOper.ok) {
          const csvTextOper = await responseOper.text();
          console.log('✅ CSV Operacional carregado automaticamente!');
          const dadosOperacional =
            await processarCronogramaOperacional(csvTextOper);

          // Usar a função existente para converter os dados
          console.log('📊 Dados operacionais carregados automaticamente');
          // Aqui você pode adaptar os dados operacionais conforme necessário
        }
      } catch (errorOper) {
        console.warn(
          '⚠️ Erro ao carregar operacional automaticamente:',
          errorOper
        );
      }
    } catch (error) {
      console.error('❌ Erro geral no carregamento automático:', error);
    }
  }, []);

  // Função para processar dados de preparação carregados via CSV Manager
  const handlePreparacaoUpdate = useCallback(
    (dadosPreparacao: any) => {
      try {
        console.log(
          '🔄 Processando dados de preparação carregados via CSV Manager:',
          dadosPreparacao
        );

        // Armazenar os dados processados
        setDadosPreparacaoProcessados(dadosPreparacao);

        // Salvar dados de preparação no localStorage para persistência
        localStorage.setItem(
          'preparacao_data',
          JSON.stringify(dadosPreparacao)
        );
        console.log('💾 Dados de preparação salvos no localStorage');

        // Atualizar dinamicamente os dados de preparação
        updatePreparacaoData(dadosPreparacao);

        // Converter atividades de preparação para EventAreas se necessário
        if (
          dadosPreparacao.atividades &&
          dadosPreparacao.atividades.length > 0
        ) {
          const areasPreparacao: EventArea[] = dadosPreparacao.atividades.map(
            (atividade: any) => ({
              id: `prep-${atividade.id}`,
              name: atividade.nome,
              description: `${atividade.categoria} - ${atividade.duracao}`,
              status:
                atividade.status === 'completed'
                  ? 'concluida'
                  : atividade.status === 'in-progress'
                    ? 'em-andamento'
                    : atividade.status === 'delayed'
                      ? 'atrasada'
                      : 'pendente',
              progress: atividade.percentual,
              estimatedDuration: parseInt(atividade.duracao) || 1,
              actualDuration:
                atividade.percentual === 100
                  ? parseInt(atividade.duracao) || 1
                  : 0,
              startDate: atividade.dataInicio,
              endDate: atividade.dataFim,
              area: atividade.categoria,
              priority: atividade.critica ? 'alta' : 'normal',
              responsible: 'Equipe Preparação',
              activities: [],
              fase: 'Preparação',
              categoria: atividade.categoria,
              nivel: atividade.nivel || 0,
              atrasada: atividade.atrasada || false,
            })
          );

          // Adicionar áreas de preparação às áreas existentes (removendo antigas se existirem)
          setAreas((prevAreas) => {
            const areasLimpas = prevAreas.filter(
              (area) => !String(area.id).startsWith('prep-')
            );
            return [...areasLimpas, ...areasPreparacao];
          });

          console.log(
            `✅ ${areasPreparacao.length} atividades de preparação adicionadas às áreas`
          );
        }

        // Atualizar último update
        setLastUpdate(new Date());

        // Notification de sucesso
        notifications.success(
          'Preparação Carregada',
          `${dadosPreparacao.atividades?.length || 0} atividades de preparação carregadas com sucesso. Progresso: ${dadosPreparacao.fase?.progress || 0}%`
        );
      } catch (error) {
        console.error('❌ Erro ao processar dados de preparação:', error);
        notifications.error(
          'Erro na Preparação',
          'Erro ao processar dados de preparação carregados'
        );
      }
    },
    [paradaData, notifications]
  );

  // Carregar dados iniciais - APENAS UMA VEZ
  useEffect(() => {
    // ORDEM CRÍTICA: Carregar dados salvos PRIMEIRO, depois carregamento geral
    loadSavedPreparacaoData(); // Carregar dados de preparação salvos PRIMEIRO
    loadPFUS3Data(); // Carregar dados PFUS3 salvos (com reprocessamento automático)
    loadBackendData(); // Carregar dados persistidos do backend
    loadData(); // Carregar dados gerais por último
  }, []); // Array vazio para executar apenas uma vez na montagem

  // Função para carregar dados de preparação salvos do localStorage
  const loadSavedPreparacaoData = useCallback(() => {
    try {
      const savedPreparacao = localStorage.getItem('preparacao_data');
      if (savedPreparacao) {
        const dadosPreparacao = JSON.parse(savedPreparacao);
        console.log(
          '📋 Carregando dados de preparação salvos:',
          dadosPreparacao
        );
        console.log(
          '📊 Progresso da preparação nos dados salvos:',
          dadosPreparacao.fase?.progress ||
            dadosPreparacao.metadata?.progressoGeral
        );

        setDadosPreparacaoProcessados(dadosPreparacao);

        // Atualizar dinamicamente os dados de preparação
        updatePreparacaoData(dadosPreparacao);
      } else {
        console.log('📭 Nenhum dado de preparação encontrado no localStorage');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados de preparação salvos:', error);
    }
  }, [updatePreparacaoData]);

  // Ativar automaticamente o modo atividades quando há dados de cronograma
  useEffect(() => {
    if (
      modoCronograma &&
      resumoCronograma &&
      resumoCronograma.totalTarefas > 0 &&
      !navegacaoAtiva // Só ativar se o usuário não estiver navegando
    ) {
      // Modo atividades é padrão (modoAnalytics = false)
      console.log('🔄 Dados de cronograma carregados - modo atividades ativo');
    }
  }, [modoCronograma, resumoCronograma, navegacaoAtiva]);

  // Carregar imagens do carrossel da API como fallback
  useEffect(() => {
    const loadImages = async () => {
      try {
        console.log('🖼️ Carregando imagens do carrossel...');
        const response = await fetch('/api/images');
        if (response.ok) {
          const images = await response.json();
          if (images && images.length > 0) {
            console.log('✅ Imagens carregadas da API:', images);
            setImageList(images);
          }
        } else {
          console.log('⚠️ API de imagens indisponível, usando imagens padrão');
        }
      } catch (error) {
        console.log(
          '⚠️ Erro ao carregar imagens da API, usando imagens padrão:',
          error
        );
      }
    };

    loadImages();
  }, []);

  // Função para filtrar categorias por fase
  const filtrarCategoriasPorFase = useCallback(
    (categorias: CategoriaCronograma[], faseSelecionada: string) => {
      if (faseSelecionada === 'todas') {
        return categorias;
      }

      return categorias.filter((categoria) => {
        const nomeCategoria = categoria.nome.toLowerCase();

        switch (faseSelecionada) {
          case 'preparacao':
            return (
              nomeCategoria.includes('preparação') ||
              nomeCategoria.includes('preparacao')
            );
          case 'parada':
            return nomeCategoria.includes('parada');
          case 'manutencao':
            return (
              nomeCategoria.includes('manutenção') ||
              nomeCategoria.includes('manutencao')
            );
          case 'partida':
            return nomeCategoria.includes('partida');
          default:
            return true;
        }
      });
    },
    []
  );

  // Categorias filtradas baseadas na fase selecionada
  const categoriasFiltradas = useMemo(() => {
    return filtrarCategoriasPorFase(
      categoriasCronograma,
      faseAnalyticsSelecionada
    );
  }, [
    categoriasCronograma,
    faseAnalyticsSelecionada,
    filtrarCategoriasPorFase,
  ]);

  // Debug: Estados de navegação em tempo real
  useEffect(() => {
    console.log('🔄 ESTADOS DE NAVEGAÇÃO MUDARAM:', {
      modoCronograma,
      modoAnalytics,
      navegacaoAtiva,
      timestamp: new Date().toLocaleTimeString(),
    });
  }, [modoAnalytics, modoCronograma, navegacaoAtiva]);

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

  // Atualização automática desabilitada para evitar refreshs desnecessários
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     loadData();
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, []);

  // Carregar dados CSV automaticamente quando não há dados disponíveis
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        modoCronograma &&
        !resumoCronograma &&
        categoriasCronograma.length === 0
      ) {
        console.log('📋 Nenhum dado disponível, carregando automaticamente...');
        autoLoadCSVData();
      }
    }, 2000); // Aguardar 2 segundos para permitir que outros carregamentos terminem

    return () => clearTimeout(timer);
  }, [modoCronograma, resumoCronograma, categoriasCronograma, autoLoadCSVData]);

  // Função para alternar entre dashboard e cronograma
  const toggleMode = () => {
    setModoCronograma(!modoCronograma);
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
          completedActivities:
            phaseData.activities?.filter((a: any) => a.status === 'concluida')
              .length || phase.completedActivities,
          delayedActivities:
            phaseData.activities?.filter((a: any) => a.status === 'atrasada')
              .length || phase.delayedActivities,
          criticalActivities:
            phaseData.activities?.filter((a: any) => a.criticidade === 'alta')
              .length || phase.criticalActivities,
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

    updateParadaData({
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

    updateParadaData({
      ...paradaData,
      phases: updatedPhases,
      subtitle: cronograma.metadata.titulo,
      startDate: new Date(cronograma.metadata.dataInicio),
      estimatedEndDate: new Date(cronograma.metadata.dataFim),
    });

    // Atualizar estado do modo cronograma
    setModoCronograma(true);

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

    updateParadaData({
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
        onPFUS3PhasesUpdate={handlePFUS3PhasesUpdate}
        onPreparacaoUpdate={handlePreparacaoUpdate}
      />

      {/* Top Navigation */}
      <TopNavigation
        isAuthenticated={isAuthenticated}
        user={user}
        isAdmin={isAdmin}
        modoCronograma={modoCronograma}
        modoAnalytics={modoAnalytics}
        existeCronogramaLocal={existeCronogramaLocal()}
        resumoCronograma={resumoCronograma}
        onAtividadesClick={() => {
          console.log('📋 Atividades clicado');
          setNavegacaoAtiva(true);
          setModoCronograma(true);
          setModoAnalytics(false);
          setTimeout(() => {
            console.log('� ATIVIDADES - Estado confirmado');
            setNavegacaoAtiva(false);
          }, 100);
        }}
        onAnalyticsClick={() => {
          console.log('📊 Analytics clicado');
          setNavegacaoAtiva(true);
          setModoCronograma(true);
          setModoAnalytics(true);
          setTimeout(() => {
            console.log('📊 ANALYTICS - Estado confirmado');
            setNavegacaoAtiva(false);
          }, 100);
        }}
        onDashboardClick={toggleMode}
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
        {/* Carrossel de Imagens da Planta */}
        <div className="mb-4 sm:mb-6">
          <ImageCarousel
            images={imageList}
            height="220px"
            autoPlay={true}
            interval={4000}
          />
        </div>
        {/* Cabeçalho da Parada */}
        <div className="mb-4 sm:mb-6">
          <ParadaHeader paradaData={paradaData} />
        </div>

        {/* Navegação das Fases */}
        <div className="mb-4 sm:mb-6">
          {/* Indicador de integração PFUS3 */}
          {phasesPFUS3.length > 0 && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">
                  Sistema Integrado PFUS3 Ativo
                </span>
                <span className="text-xs text-green-600">
                  {phasesPFUS3.length} fases carregadas automaticamente
                </span>
              </div>
            </div>
          )}

          <PhasesNavigation
            phases={getActivePhases()}
            currentPhase={selectedPhase}
            onPhaseSelect={(phaseId: PhaseType) => {
              setSelectedPhase(phaseId);
              setModoAnalytics(false); // Garantir que está no modo Atividades
              console.log(
                `🎯 Fase selecionada: ${phaseId} - Redirecionando para atividades`
              );

              // Scroll suave para as atividades após um pequeno delay
              setTimeout(() => {
                const element = document.querySelector(
                  '[data-testid="activities-section"]'
                );
                if (element) {
                  element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                  });
                  console.log(
                    '📍 Scroll automático para as atividades executado'
                  );
                } else {
                  console.warn(
                    '⚠️ Seção de atividades não encontrada para scroll'
                  );
                }
              }, 300); // Delay para garantir que o componente foi renderizado
            }}
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
            {/* Renderização Principal Simplificada para 2 Modos */}
            {modoAnalytics ? (
              /* Modo Analytics */
              <div>
                <h2 className="text-2xl font-bold mb-6">Análises Avançadas</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-blue-700 dark:text-blue-300">
                      Área de Analytics com IA e análises avançadas
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      Em desenvolvimento
                    </p>
                  </div>
                </div>
              </div>
            ) : resumoCronograma ? (
              /* Modo Atividades */
              <div data-testid="activities-section">
                <PhaseActivitiesManager
                  activities={getAtividadesFiltradas(selectedPhase)}
                  phaseName={
                    getActivePhases().find((p) => p.id === selectedPhase)
                      ?.name || selectedPhase
                  }
                  filtroStatus={filtroStatus}
                  setFiltroStatus={setFiltroStatus}
                  filtroPrioridade={filtroPrioridade}
                  setFiltroPrioridade={setFiltroPrioridade}
                  filtroFrente={filtroFrente}
                  setFiltroFrente={setFiltroFrente}
                  termoPesquisa={termoPesquisa}
                  setTermoPesquisa={setTermoPesquisa}
                  limparFiltros={limparFiltros}
                  onAccessDirectly={() => {
                    console.log('🎯 Acesso direto ao PhaseActivitiesManager');
                    setModoAnalytics(false);
                    setModoCronograma(true);
                  }}
                />
              </div>
            ) : null}
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
                </div>

                {/* Seletor de Fases */}
                <div className="mb-4">
                  <label
                    className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                  >
                    🔍 Filtrar por Fase:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'todas', nome: 'Todas as Fases', icone: '📊' },
                      { id: 'preparacao', nome: 'Preparação', icone: '🔧' },
                      { id: 'parada', nome: 'Parada', icone: '⏸️' },
                      { id: 'manutencao', nome: 'Manutenção', icone: '🔧' },
                      { id: 'partida', nome: 'Partida', icone: '▶️' },
                    ].map((fase) => (
                      <button
                        key={fase.id}
                        onClick={() => {
                          console.log('🎯 Fase selecionada:', fase.id);
                          setFaseAnalyticsSelecionada(fase.id);
                        }}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          faseAnalyticsSelecionada === fase.id
                            ? `${themeClasses.bgPrimary} ${themeClasses.textPrimary} shadow-sm`
                            : `${themeClasses.bgSecondary} ${themeClasses.textSecondary} hover:${themeClasses.textPrimary}`
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{fase.icone}</span>
                          <span>{fase.nome}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* Indicador de dados filtrados */}
                  <div className="mt-2 text-xs text-gray-500">
                    📊 Mostrando{' '}
                    <span className="font-semibold text-blue-600">
                      {categoriasFiltradas.length}
                    </span>{' '}
                    de {categoriasCronograma.length} categorias
                    {faseAnalyticsSelecionada !== 'todas' && (
                      <span className="ml-1">
                        (filtrado por:{' '}
                        <span className="font-semibold text-green-600">
                          {faseAnalyticsSelecionada === 'preparacao'
                            ? 'Preparação'
                            : faseAnalyticsSelecionada === 'parada'
                              ? 'Parada'
                              : faseAnalyticsSelecionada === 'manutencao'
                                ? 'Manutenção'
                                : faseAnalyticsSelecionada === 'partida'
                                  ? 'Partida'
                                  : ''}
                        </span>
                        )
                      </span>
                    )}
                    {categoriasFiltradas.length === 0 &&
                      faseAnalyticsSelecionada !== 'todas' && (
                        <div className="mt-1 text-yellow-600 text-sm">
                          ⚠️ Nenhuma categoria encontrada para esta fase.
                          Carregue os dados do CSV Manager primeiro.
                        </div>
                      )}
                  </div>
                </div>

                {/* Botões de Analytics */}
                <div className="flex items-center justify-between mb-4">
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

                      // Função para carregar e processar AMBOS os CSVs reais
                      const carregarCSVReal = async () => {
                        try {
                          // Carregar ambos os cronogramas
                          const [responsePreparacao, responseOperacional] =
                            await Promise.all([
                              fetch(
                                '/290805 - Cronograma Preparação - PFUS3.csv'
                              ),
                              fetch('/cronograma-operacional.csv'),
                            ]);

                          const [csvPreparacao, csvOperacional] =
                            await Promise.all([
                              responsePreparacao.text(),
                              responseOperacional.text(),
                            ]);

                          console.log(
                            '📊 Carregando dados de PREPARAÇÃO + OPERACIONAL para IA...'
                          );

                          const categorias = new Map();

                          // Processar cronograma de PREPARAÇÃO
                          const linhasPreparacao = csvPreparacao
                            .split('\n')
                            .slice(1);
                          linhasPreparacao.forEach(
                            (linha: string, index: number) => {
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
                              let categoria = 'Preparação - Outras';
                              if (nome.includes('Logística'))
                                categoria = 'Preparação - Logística';
                              else if (nome.includes('Refratário'))
                                categoria = 'Preparação - Refratário';
                              else if (
                                nome.includes('Mobilização') ||
                                nome.includes('Canteiro')
                              )
                                categoria = 'Preparação - Mobilização';
                              else if (espacos === 4)
                                categoria = 'Preparação - Principal';
                              else if (espacos === 8)
                                categoria = 'Preparação - Detalhadas';

                              if (!categorias.has(categoria)) {
                                categorias.set(categoria, {
                                  id: categoria
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]/g, '-'),
                                  nome: categoria,
                                  descricao: `${categoria} - PFUS3 2025`,
                                  cor: categoria.includes('Logística')
                                    ? '#3B82F6'
                                    : categoria.includes('Refratário')
                                      ? '#EF4444'
                                      : categoria.includes('Mobilização')
                                        ? '#10B981'
                                        : categoria.includes('Principal')
                                          ? '#F59E0B'
                                          : '#8B5CF6',
                                  tarefas: [],
                                });
                              }

                              const tarefa = {
                                id: `prep-${parseInt(id) || index}`,
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
                                fase: 'Preparação',
                              };

                              categorias.get(categoria).tarefas.push(tarefa);
                            }
                          );

                          // Processar cronograma OPERACIONAL
                          const linhasOperacional = csvOperacional
                            .split('\n')
                            .slice(1);
                          linhasOperacional.forEach(
                            (linha: string, index: number) => {
                              if (!linha.trim()) return;

                              const campos = linha.split(',');
                              if (campos.length < 8) return;

                              const id = campos[0];
                              const nomeCompleto = campos[1];
                              const inicio = campos[2];
                              const fim = campos[3];
                              const duracao = campos[4] || '1 day';
                              const predecessores = campos[5] || '';

                              const nome = nomeCompleto.trim();

                              // Categorizar atividades operacionais
                              let categoria = 'Operacional - Outras';
                              if (
                                nome.includes('Parada') ||
                                nome.includes('Shutdown')
                              )
                                categoria = 'Operacional - Parada';
                              else if (
                                nome.includes('Manutenção') ||
                                nome.includes('Maintenance')
                              )
                                categoria = 'Operacional - Manutenção';
                              else if (
                                nome.includes('Partida') ||
                                nome.includes('Startup')
                              )
                                categoria = 'Operacional - Partida';
                              else if (
                                nome.includes('Teste') ||
                                nome.includes('Test')
                              )
                                categoria = 'Operacional - Testes';
                              else if (
                                nome.includes('Inspeção') ||
                                nome.includes('Inspection')
                              )
                                categoria = 'Operacional - Inspeção';

                              if (!categorias.has(categoria)) {
                                categorias.set(categoria, {
                                  id: categoria
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]/g, '-'),
                                  nome: categoria,
                                  descricao: `${categoria} - PFUS3 2025`,
                                  cor: categoria.includes('Parada')
                                    ? '#DC2626'
                                    : categoria.includes('Manutenção')
                                      ? '#F59E0B'
                                      : categoria.includes('Partida')
                                        ? '#059669'
                                        : categoria.includes('Testes')
                                          ? '#7C3AED'
                                          : categoria.includes('Inspeção')
                                            ? '#2563EB'
                                            : '#6B7280',
                                  tarefas: [],
                                });
                              }

                              const tarefa = {
                                id: `oper-${parseInt(id) || index}`,
                                nome: nome,
                                percentualCompleto: 0, // Operacional ainda não iniciado
                                percentualFisico: 0,
                                percentualReplanejamento: 0,
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
                                percentualFisicoPrev: 0,
                                percentualFisicoReplan: 0,
                                percentualFisicoCalc: 0,
                                nivel: 0,
                                categoria: categoria,
                                fase: 'Operacional',
                                predecessores: predecessores,
                              };

                              categorias.get(categoria).tarefas.push(tarefa);
                            }
                          );

                          const categoriasArray = Array.from(
                            categorias.values()
                          );

                          const totalTarefasPreparacao = categoriasArray
                            .filter((cat) => cat.nome.includes('Preparação'))
                            .reduce((acc, cat) => acc + cat.tarefas.length, 0);

                          const totalTarefasOperacional = categoriasArray
                            .filter((cat) => cat.nome.includes('Operacional'))
                            .reduce((acc, cat) => acc + cat.tarefas.length, 0);

                          console.log(
                            '📊 Dados COMBINADOS carregados para IA:',
                            `${categoriasArray.length} categorias total`,
                            `| Preparação: ${totalTarefasPreparacao} tarefas`,
                            `| Operacional: ${totalTarefasOperacional} tarefas`,
                            `| Total: ${totalTarefasPreparacao + totalTarefasOperacional} tarefas`
                          );

                          setCategoriasCronograma(categoriasArray as any);
                        } catch (error) {
                          console.error('❌ Erro ao carregar CSV real:', error);
                          // Fallback para dados simulados em caso de erro
                          console.log(
                            '🔄 Usando dados simulados COMBINADOS como fallback...'
                          );
                          const totalTarefas = resumoCronograma.totalTarefas;
                          const categoriasFallback = [
                            {
                              id: 'fallback-prep',
                              nome: 'Preparação (Simulado)',
                              descricao: 'Dados de preparação simulados',
                              cor: '#3B82F6',
                              tarefas: Array.from(
                                { length: Math.floor(totalTarefas * 0.4) },
                                (_, i) => ({
                                  id: `prep-fallback-${i}`,
                                  titulo: `Preparação Simulada ${i + 1}`,
                                  descricao: `Atividade de preparação ${i + 1}`,
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
                                  responsavel: 'Equipe Preparação',
                                  prioridade: 'media' as any,
                                  dependencias: [],
                                  recursos: [],
                                  fase: 'Preparação',
                                })
                              ),
                            },
                            {
                              id: 'fallback-oper',
                              nome: 'Operacional (Simulado)',
                              descricao: 'Dados operacionais simulados',
                              cor: '#EF4444',
                              tarefas: Array.from(
                                { length: Math.floor(totalTarefas * 0.6) },
                                (_, i) => ({
                                  id: `oper-fallback-${i}`,
                                  titulo: `Operacional Simulado ${i + 1}`,
                                  descricao: `Atividade operacional ${i + 1}`,
                                  inicio: new Date()
                                    .toISOString()
                                    .split('T')[0],
                                  fim: new Date().toISOString().split('T')[0],
                                  percentualCompleto: 0,
                                  percentualFisico: 0,
                                  duracao: `${Math.floor(Math.random() * 5) + 1} days`,
                                  responsavel: 'Equipe Operacional',
                                  prioridade: 'alta' as any,
                                  dependencias: [],
                                  recursos: [],
                                  fase: 'Operacional',
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
                  <KPIDashboard categorias={categoriasFiltradas} />
                </div>
              )}

              {abaAnalytics === 'gantt' && (
                <div>
                  {/* Gantt Chart - Aba Gantt ativa */}
                  <GanttChart
                    categorias={categoriasFiltradas}
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
                    categorias={categoriasFiltradas}
                    onTarefaClick={(tarefa) => {
                      setTarefaSelecionada(tarefa);
                      setModalTarefaDetalhes(true);
                    }}
                  />
                </div>
              )}

              {abaAnalytics === 'tendencias' && resumoCronograma && (
                <div className="space-y-6">
                  <AIAnalysisComponent categorias={categoriasFiltradas} />
                  <KPIDashboard categorias={categoriasFiltradas} />
                  <CPMAnalysis
                    categorias={categoriasFiltradas}
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
                    {getActivePhases().find((p) => p.id === selectedPhase)
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
                  <span>Preparação PFUS3 ({getPreparacaoProgress()}%)</span>
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

      {/* Admin Panel */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        onDataUpdate={loadData}
      />

      {/* System Status e Performance Monitor removidos */}

      {/* Dev Tools removidos */}
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
