import React, { useState, useEffect, useCallback } from 'react';
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
import { ParadaData, PhaseType, getPhasesMockData } from './types/phases';
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
    'kpi' | 'gantt' | 'cpm' | 'tendencias' | 'teste'
  >('kpi');
  const [modalTarefaDetalhes, setModalTarefaDetalhes] = useState(false);
  const [dadosPreparacaoProcessados, setDadosPreparacaoProcessados] =
    useState<any>(null);
  const [modoAnalytics, setModoAnalytics] = useState(false); // false = modo Atividades, true = modo Analytics
  const [navegacaoAtiva, setNavegacaoAtiva] = useState(false);

  // Estados para controle das fases da parada
  const [paradaData, setParadaData] = useState<ParadaData>(getPhasesMockData());
  const [selectedPhase, setSelectedPhase] = useState<PhaseType>('preparacao');

  // Estados para filtros de atividades
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('');
  const [filtroFrente, setFiltroFrente] = useState<string>('');
  const [termoPesquisa, setTermoPesquisa] = useState<string>('');

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

  // Função para converter dados do cronograma em atividades organizadas por frente de trabalho
  const getAtividadesPorFase = (fase: PhaseType) => {
    console.log('🔍 getAtividadesPorFase chamada para fase:', fase);
    console.log('📊 categoriasCronograma:', categoriasCronograma);
    console.log(
      '📈 categoriasCronograma.length:',
      categoriasCronograma?.length || 0
    );

    if (!categoriasCronograma || categoriasCronograma.length === 0) {
      console.log('⚠️ Nenhuma categoria encontrada - retornando array vazio');
      return [];
    }

    const atividadesDaFase: any[] = [];
    console.log('🔄 Processando categorias...');

    categoriasCronograma.forEach((categoria) => {
      // Verificação de segurança para categoria
      if (
        !categoria ||
        !categoria.tarefas ||
        !Array.isArray(categoria.tarefas)
      ) {
        console.warn('⚠️ Categoria inválida encontrada:', categoria);
        return;
      }

      categoria.tarefas.forEach((tarefa) => {
        // Verificação de segurança para tarefa
        if (!tarefa || typeof tarefa !== 'object') {
          console.warn('⚠️ Tarefa inválida encontrada:', tarefa);
          return;
        }

        // Garantir que os campos necessários existem e são strings
        const categoriaNome = categoria.nome || '';
        const tarefaNome = tarefa.nome || '';

        // Determinar frente de trabalho baseada na categoria e nome da tarefa
        let frenteTrabalho = 'Outras Atividades';

        if (fase === 'preparacao') {
          if (
            categoriaNome.includes('Logística') ||
            tarefaNome.includes('Logística')
          ) {
            frenteTrabalho = 'Logística e Suprimentos';
          } else if (
            categoriaNome.includes('Refratário') ||
            tarefaNome.includes('Refratário')
          ) {
            frenteTrabalho = 'Refratário';
          } else if (
            categoriaNome.includes('Mobilização') ||
            tarefaNome.includes('Mobilização') ||
            tarefaNome.includes('Canteiro')
          ) {
            frenteTrabalho = 'Mobilização e Canteiro';
          } else if (categoriaNome.includes('Preparação')) {
            frenteTrabalho = 'Preparação Geral';
          }
        } else if (
          fase === 'parada' ||
          fase === 'manutencao' ||
          fase === 'partida'
        ) {
          if (
            categoriaNome.includes('Parada') ||
            tarefaNome.includes('Parada') ||
            tarefaNome.includes('Shutdown')
          ) {
            frenteTrabalho = 'Parada de Unidades';
          } else if (
            categoriaNome.includes('Manutenção') ||
            tarefaNome.includes('Manutenção')
          ) {
            frenteTrabalho = 'Manutenção';
          } else if (
            categoriaNome.includes('Partida') ||
            tarefaNome.includes('Partida') ||
            tarefaNome.includes('Startup')
          ) {
            frenteTrabalho = 'Partida de Unidades';
          } else if (
            categoriaNome.includes('Teste') ||
            tarefaNome.includes('Teste')
          ) {
            frenteTrabalho = 'Testes e Comissionamento';
          } else if (
            categoriaNome.includes('Inspeção') ||
            tarefaNome.includes('Inspeção')
          ) {
            frenteTrabalho = 'Inspeção e Controle';
          }
        }

        // Determinar status baseado no percentual
        let status = 'pendente';
        if (tarefa.percentualCompleto >= 100) {
          status = 'concluida';
        } else if (tarefa.percentualCompleto > 0) {
          status = 'em-andamento';
        }

        // Verificar se está atrasada (simplificado)
        const fimTarefa = new Date(tarefa.fim || tarefa.fimBaseline);
        const hoje = new Date();
        if (fimTarefa < hoje && tarefa.percentualCompleto < 100) {
          status = 'atrasada';
        }

        // Determinar prioridade baseada no nível e criticidade
        let prioridade: 'alta' | 'media' | 'baixa' = 'media';
        if (tarefa.nivel === 0 || (tarefa as any).critica) {
          prioridade = 'alta';
        } else if (tarefa.nivel > 2) {
          prioridade = 'baixa';
        }

        // Gerar dependências e recursos baseados no tipo de atividade
        const gerarDependenciasRecursos = (
          nome: string,
          frenteTrabalho: string
        ) => {
          const dependencias: string[] = [];
          const recursos: string[] = [];

          // Dependências baseadas na atividade
          if (nome.includes('Mobilização')) {
            dependencias.push('Contratação de pessoal', 'Licenças ambientais');
            recursos.push('Equipamentos pesados', 'Caminhões', 'Guindaste');
          } else if (nome.includes('Canteiro')) {
            dependencias.push('Mobilização', 'Terraplanagem');
            recursos.push('Containers', 'Energia elétrica', 'Agua potável');
          } else if (nome.includes('Logística')) {
            dependencias.push('Canteiro', 'Acessos liberados');
            recursos.push('Empilhadeira', 'Pallets', 'Armazenagem');
          } else if (nome.includes('Refratário')) {
            dependencias.push('Desmontagem', 'Limpeza de equipamentos');
            recursos.push('Refratários', 'Argamassa', 'Ferramentas especiais');
          } else if (nome.includes('Parada')) {
            dependencias.push('Preparação concluída', 'Permissões de trabalho');
            recursos.push('Equipe operacional', 'Procedimentos de parada');
          } else if (nome.includes('Manutenção')) {
            dependencias.push(
              'Parada de equipamentos',
              'Isolamento de energia'
            );
            recursos.push(
              'Peças de reposição',
              'Ferramentas',
              'Mão de obra especializada'
            );
          } else if (nome.includes('Partida')) {
            dependencias.push('Manutenção concluída', 'Testes aprovados');
            recursos.push('Equipe de partida', 'Instrumentação', 'Utilidades');
          }

          return { dependencias, recursos };
        };

        const { dependencias, recursos } = gerarDependenciasRecursos(
          tarefaNome,
          frenteTrabalho
        );

        const atividade = {
          id: tarefa.id?.toString() || `${categoriaNome}-${Math.random()}`,
          nome: tarefaNome,
          frenteTrabalho,
          percentualCompleto: tarefa.percentualCompleto || 0,
          percentualFisico:
            tarefa.percentualFisico || tarefa.percentualCompleto || 0,
          duracao: tarefa.duracao || '1 day',
          inicio:
            tarefa.inicio ||
            tarefa.inicioBaseline ||
            new Date().toISOString().split('T')[0],
          fim:
            tarefa.fim ||
            tarefa.fimBaseline ||
            new Date().toISOString().split('T')[0],
          responsavel:
            (tarefa as any).responsavel || `Coordenador ${frenteTrabalho}`,
          prioridade,
          status,
          dependencias: (tarefa as any).dependencias || dependencias,
          recursos: (tarefa as any).recursos || recursos,
          fase:
            (tarefa as any).fase ||
            (fase === 'preparacao' ? 'Preparação' : 'Operacional'),
          categoria: categoriaNome,
          nivel: tarefa.nivel || 0,
        };

        // Filtrar por fase se a tarefa tem informação de fase
        if ((tarefa as any).fase) {
          const tarefaFase = ((tarefa as any).fase || '').toLowerCase();
          if (
            (fase === 'preparacao' && tarefaFase.includes('preparação')) ||
            ((fase === 'parada' ||
              fase === 'manutencao' ||
              fase === 'partida') &&
              tarefaFase.includes('operacional'))
          ) {
            atividadesDaFase.push(atividade);
          }
        } else {
          // Se não tem informação de fase, incluir baseado na categoria
          if (
            (fase === 'preparacao' &&
              (categoriaNome.includes('Preparação') ||
                !categoriaNome.includes('Operacional'))) ||
            ((fase === 'parada' ||
              fase === 'manutencao' ||
              fase === 'partida') &&
              categoriaNome.includes('Operacional'))
          ) {
            atividadesDaFase.push(atividade);
          }
        }
      });
    });

    console.log('✅ getAtividadesPorFase finalizada');
    console.log('📊 Total de atividades encontradas:', atividadesDaFase.length);
    console.log('🎯 Primeiras 3 atividades:', atividadesDaFase.slice(0, 3));
    console.log('📋 Todas as atividades:', atividadesDaFase);

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
          setParadaData(novasParadaData);
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

          // Adicionar atividades operacionais
          if (
            dadosOperacional.atividades &&
            dadosOperacional.atividades.length > 0
          ) {
            const categoriaOperacional: CategoriaCronograma = {
              nome: 'Operacional PFUS3',
              cor: '#3B82F6', // Azul
              icone: '⚙️',
              progresso: Math.round(
                (dadosOperacional.atividades.filter(
                  (a) => a.status === 'completed'
                ).length *
                  100) /
                  dadosOperacional.atividades.length
              ),
              tarefas: dadosOperacional.atividades.map(
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
                    categoria: 'Operacional',
                    // Campos personalizados
                    responsavel: atividade.responsavel || 'Equipe Operacional',
                    prioridade: (atividade as any).critica ? 'alta' : 'media',
                    status:
                      atividade.status === 'completed'
                        ? 'concluida'
                        : atividade.status === 'in-progress'
                          ? 'em-andamento'
                          : 'pendente',
                    dependencias: (atividade as any).dependencias || [],
                    recursos: (atividade as any).recursos || [],
                    fase: 'Operacional',
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
            categoriasCronogramaReais.push(categoriaOperacional);
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

            setParadaData({
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
        const responsePrep = await fetch('/cronograma-preparacao-real.csv');
        if (responsePrep.ok) {
          const csvTextPrep = await responsePrep.text();
          console.log('✅ CSV Preparação carregado automaticamente!');
          const dadosPreparacao =
            await processarCronogramaPreparacao(csvTextPrep);

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

  // Carregar dados iniciais - APENAS UMA VEZ
  useEffect(() => {
    loadData();
  }, []); // Array de dependências vazio para executar apenas uma vez

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
          <div className="fixed top-20 right-4 z-50 space-y-2">
            <button
              onClick={forcarDadosDemo}
              className="block w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg"
              title="Forçar carregamento de dados de demonstração"
            >
              🔧 Debug: Carregar Dados Demo
            </button>
            <button
              onClick={async () => {
                console.log('� Carregando dados reais dos arquivos CSV...');
                try {
                  // Carregar cronograma operacional
                  const responseCronograma = await fetch(
                    '/cronograma-operacional.csv'
                  );
                  const csvCronograma = await responseCronograma.text();
                  console.log(
                    '📄 Cronograma operacional carregado:',
                    csvCronograma.slice(0, 200)
                  );

                  // Carregar cronograma de preparação
                  const responsePreparacao = await fetch(
                    '/cronograma-preparacao.csv'
                  );
                  const csvPreparacao = await responsePreparacao.text();
                  console.log(
                    '📄 Cronograma preparação carregado:',
                    csvPreparacao.slice(0, 200)
                  );

                  // Processar dados usando as funções existentes
                  const dadosOperacionais =
                    await processarCronogramaOperacional(csvCronograma);
                  const dadosPreparacao =
                    await processarCronogramaPreparacao(csvPreparacao);

                  console.log('✅ Dados processados:');
                  console.log('🔧 Operacionais:', dadosOperacionais);
                  console.log('🔨 Preparação:', dadosPreparacao);

                  // Definir dados (usar a estrutura correta dos tipos)
                  if (
                    dadosOperacionais &&
                    (dadosOperacionais as any).categorias
                  ) {
                    setCategoriasCronograma(
                      (dadosOperacionais as any).categorias
                    );
                    if ((dadosOperacionais as any).resumo) {
                      setResumoCronograma((dadosOperacionais as any).resumo);
                    }
                    console.log('✅ Dados operacionais definidos!');
                  } else if (
                    dadosPreparacao &&
                    (dadosPreparacao as any).categorias
                  ) {
                    setCategoriasCronograma(
                      (dadosPreparacao as any).categorias
                    );
                    if ((dadosPreparacao as any).resumo) {
                      setResumoCronograma((dadosPreparacao as any).resumo);
                    }
                    console.log('✅ Dados de preparação definidos!');
                  }

                  notifications.success(
                    'Dados Carregados',
                    'Arquivos CSV carregados com sucesso!'
                  );
                } catch (error) {
                  console.error('❌ Erro ao carregar dados:', error);
                  notifications.error('Erro', 'Erro ao carregar dados CSV');
                }
              }}
              className="block w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
              title="Carregar dados reais dos arquivos CSV"
            >
              📊 Carregar CSV Reais
            </button>
          </div>
        )}

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
          <PhasesNavigation
            phases={paradaData.phases}
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
                    paradaData.phases.find((p) => p.id === selectedPhase)
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
                              fetch('/cronograma-preparacao-real.csv'),
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

              {abaAnalytics === 'tendencias' && resumoCronograma && (
                <div className="space-y-6">
                  <AIAnalysisComponent categorias={categoriasCronograma} />
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
