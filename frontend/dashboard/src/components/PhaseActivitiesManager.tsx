import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { useThemeClasses } from '../contexts/ThemeContext';

interface Atividade {
  id: string;
  nome: string;
  frenteTrabalho: string;
  percentualCompleto: number;
  percentualFisico: number;
  duracao: string;
  inicio: string;
  fim: string;
  responsavel?: string;
  prioridade: 'alta' | 'media' | 'baixa';
  status: 'pendente' | 'em-andamento' | 'concluida' | 'atrasada';
  dependencias?: string[];
  recursos?: string[];
  categoria: string;
  nivel: string | number;
  subatividades?: Atividade[];
  // Novas propriedades para estrutura hierárquica
  isAtivo?: boolean; // Se é um ativo principal da usina
  isSubatividade?: boolean; // Se é uma subatividade
  ativoParent?: string; // Nome do ativo pai (para subatividades)
  totalSubatividades?: number; // Total de subatividades (para ativos)
  subatividadesConcluidas?: number; // Subatividades concluídas
  subatividadesEmAndamento?: number; // Subatividades em andamento
  subatividadesAtrasadas?: number; // Subatividades atrasadas
}

interface PhaseActivitiesManagerProps {
  activities: Atividade[];
  phaseName: string;
  onAtividadeClick?: (atividade: Atividade) => void;
  onAccessDirectly?: () => void; // Nova prop para acesso direto
  filtroStatus?: string;
  setFiltroStatus?: (value: string) => void;
  filtroPrioridade?: string;
  setFiltroPrioridade?: (value: string) => void;
  filtroFrente?: string;
  setFiltroFrente?: (value: string) => void;
  termoPesquisa?: string;
  setTermoPesquisa?: (value: string) => void;
  limparFiltros?: () => void;
}

const PhaseActivitiesManager: React.FC<PhaseActivitiesManagerProps> = ({
  activities = [],
  phaseName,
  onAtividadeClick,
  onAccessDirectly,
  filtroStatus,
  setFiltroStatus,
  filtroPrioridade,
  setFiltroPrioridade,
  filtroFrente,
  setFiltroFrente,
  termoPesquisa,
  setTermoPesquisa,
  limparFiltros,
}) => {
  const themeClasses = useThemeClasses();

  // DADOS FAKE PARA TESTE - GARANTIR QUE SEMPRE TEMOS ATIVIDADES
  const fakeActivities: Atividade[] = [
    {
      id: 'fake-1',
      nome: 'Teste: Mobilização de Equipe',
      frenteTrabalho: 'Manutenção',
      percentualCompleto: 75,
      percentualFisico: 80,
      duracao: '3 dias',
      inicio: '2024-01-15',
      fim: '2024-01-18',
      responsavel: 'João Silva',
      prioridade: 'alta',
      status: 'em-andamento',
      categoria: 'Preparação',
      nivel: '1',
      dependencias: ['Contratação', 'Mobilização'],
      recursos: ['Equipe técnica', 'Equipamentos'],
    },
    {
      id: 'fake-2',
      nome: 'Teste: Setup de Canteiro',
      frenteTrabalho: 'Logística',
      percentualCompleto: 30,
      percentualFisico: 40,
      duracao: '5 dias',
      inicio: '2024-01-16',
      fim: '2024-01-20',
      responsavel: 'Maria Santos',
      prioridade: 'media',
      status: 'pendente',
      categoria: 'Infraestrutura',
      nivel: '2',
      dependencias: ['Liberação de área'],
      recursos: ['Containers', 'Energia elétrica'],
    },
    {
      id: 'fake-3',
      nome: 'Teste: Inspeção de Equipamentos',
      frenteTrabalho: 'Manutenção',
      percentualCompleto: 100,
      percentualFisico: 100,
      duracao: '2 dias',
      inicio: '2024-01-10',
      fim: '2024-01-12',
      responsavel: 'Carlos Pereira',
      prioridade: 'alta',
      status: 'concluida',
      categoria: 'Inspeção',
      nivel: '1',
      dependencias: [],
      recursos: ['Instrumentos de medição'],
    },
  ];

  // IMPORTANTE: Priorizar dados reais, usar fake apenas como fallback
  const activitiesData = activities.length > 0 ? activities : fakeActivities;

  console.log('🎯 PhaseActivitiesManager:', {
    phase: phaseName,
    realDataCount: activities.length,
    usingRealData: activities.length > 0,
    totalActivities: activitiesData.length,
  });

  // Inicializar todas as frentes como colapsadas (fechadas)
  const [expandedFrentes, setExpandedFrentes] = useState<string[]>([]);
  const [expandedAtividades, setExpandedAtividades] = useState<string[]>([]);
  const [expandedAtivos, setExpandedAtivos] = useState<string[]>([]); // Novo estado para controlar expansão dos ativos

  // Remover o useEffect que expandia automaticamente todas as frentes

  // Função para calcular porcentagem de evolução de uma frente
  const calcularEvolucaoFrente = (atividades: Atividade[]) => {
    if (atividades.length === 0) return 0;

    const totalProgresso = atividades.reduce((acc, atividade) => {
      return acc + (atividade.percentualCompleto || 0);
    }, 0);

    return Math.round(totalProgresso / atividades.length);
  };

  // Função para analisar status crítico de uma atividade
  const analisarStatusAtividade = (atividade: Atividade) => {
    const hoje = new Date();
    const dataFim = new Date(atividade.fim);
    const dataInicio = new Date(atividade.inicio);
    const percentualCompleto = atividade.percentualCompleto || 0;

    // Calcular dias para o prazo
    const diasParaPrazo = Math.ceil(
      (dataFim.getTime() - hoje.getTime()) / (1000 * 3600 * 24)
    );

    // Verificar se está atrasada
    if (hoje > dataFim && percentualCompleto < 100) {
      return {
        tipo: 'ATRASADA',
        cor: 'bg-red-500',
        corTexto: 'text-red-700',
        corFundo: 'bg-red-50',
        icone: '🚨',
        mensagem: `Atrasada há ${Math.abs(diasParaPrazo)} dias`,
        prioridade: 1,
      };
    }

    // Verificar se está próxima do prazo com baixo progresso
    if (diasParaPrazo <= 3 && diasParaPrazo > 0 && percentualCompleto < 70) {
      return {
        tipo: 'CRÍTICA',
        cor: 'bg-red-400',
        corTexto: 'text-red-600',
        corFundo: 'bg-red-50',
        icone: '⚠️',
        mensagem: `Crítica: ${diasParaPrazo} dia(s) restantes`,
        prioridade: 2,
      };
    }

    // Verificar ponto de atenção (prazo próximo)
    if (diasParaPrazo <= 7 && diasParaPrazo > 0 && percentualCompleto < 90) {
      return {
        tipo: 'ATENÇÃO',
        cor: 'bg-yellow-400',
        corTexto: 'text-yellow-700',
        corFundo: 'bg-yellow-50',
        icone: '⚡',
        mensagem: `Atenção: ${diasParaPrazo} dia(s) restantes`,
        prioridade: 3,
      };
    }

    // Verificar se está concluída
    if (percentualCompleto >= 100) {
      return {
        tipo: 'CONCLUÍDA',
        cor: 'bg-green-500',
        corTexto: 'text-green-700',
        corFundo: 'bg-green-50',
        icone: '✅',
        mensagem: 'Concluída',
        prioridade: 5,
      };
    }

    // Status normal
    return {
      tipo: 'NORMAL',
      cor: 'bg-blue-400',
      corTexto: 'text-blue-700',
      corFundo: 'bg-blue-50',
      icone: '🔵',
      mensagem: `${diasParaPrazo} dia(s) restantes`,
      prioridade: 4,
    };
  };

  // Função para calcular estatísticas críticas de uma frente
  const calcularEstatisticasCriticasFrente = (atividades: Atividade[]) => {
    const analises = atividades.map(analisarStatusAtividade);

    return {
      atrasadas: analises.filter((a) => a.tipo === 'ATRASADA').length,
      criticas: analises.filter((a) => a.tipo === 'CRÍTICA').length,
      atencao: analises.filter((a) => a.tipo === 'ATENÇÃO').length,
      concluidas: analises.filter((a) => a.tipo === 'CONCLUÍDA').length,
      normais: analises.filter((a) => a.tipo === 'NORMAL').length,
      statusMaisCritico: analises.sort(
        (a, b) => a.prioridade - b.prioridade
      )[0],
    };
  };

  // Função para alternar expansão de atividades
  const toggleAtividade = (atividadeId: string) => {
    setExpandedAtividades((prev) => {
      const newExpanded = prev.includes(atividadeId)
        ? prev.filter((id) => id !== atividadeId)
        : [...prev, atividadeId];
      console.log('🔍 Atividades expandidas:', newExpanded);
      return newExpanded;
    });
  };

  // Função para alternar expansão de ativos da usina
  const toggleAtivo = (ativoId: string) => {
    setExpandedAtivos((prev) => {
      const newExpanded = prev.includes(ativoId)
        ? prev.filter((id) => id !== ativoId)
        : [...prev, ativoId];
      console.log('🏭 Ativos expandidos:', newExpanded);
      return newExpanded;
    });
  };

  // Função para alternar expansão de frentes
  const toggleFrente = (frenteNome: string) => {
    setExpandedFrentes((prev) =>
      prev.includes(frenteNome)
        ? prev.filter((f) => f !== frenteNome)
        : [...prev, frenteNome]
    );
  };

  // Calcular estatísticas das atividades
  const stats = useMemo(() => {
    return {
      total: activitiesData.length,
      concluidas: activitiesData.filter((a) => a.status === 'concluida').length,
      emAndamento: activitiesData.filter((a) => a.status === 'em-andamento')
        .length,
      pendentes: activitiesData.filter((a) => a.status === 'pendente').length,
      atrasadas: activitiesData.filter((a) => a.status === 'atrasada').length,
    };
  }, [activitiesData]);

  // Filtrar e agrupar atividades
  const filteredAndGroupedActivities = useMemo(() => {
    const grouped = activitiesData.reduce(
      (acc, atividade) => {
        const frente = atividade.frenteTrabalho;
        if (!acc[frente]) {
          acc[frente] = [];
        }
        acc[frente].push(atividade);
        return acc;
      },
      {} as Record<string, Atividade[]>
    );

    return grouped;
  }, [activitiesData]);

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'em-andamento':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'atrasada':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle size={16} />;
      case 'em-andamento':
        return <Clock size={16} />;
      case 'pendente':
        return <AlertTriangle size={16} />;
      case 'atrasada':
        return <AlertTriangle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  console.log('🔍 RENDER PhaseActivitiesManager');
  console.log('📊 expandedAtividades atual:', expandedAtividades);
  console.log('📦 activitiesData:', activitiesData);
  console.log('📈 Número de activitiesData:', activitiesData.length);

  // Função para renderizar um ativo da usina com suas subatividades
  const renderAtivo = (ativo: Atividade) => {
    const isExpanded = expandedAtivos.includes(ativo.id);
    const statusData = analisarStatusAtividade(ativo);

    return (
      <div key={ativo.id} className="mb-4">
        {/* Cabeçalho do Ativo */}
        <div
          className={`${themeClasses.card} rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
            ativo.status === 'concluida'
              ? 'border-green-500'
              : ativo.status === 'atrasada'
                ? 'border-red-500'
                : ativo.status === 'em-andamento'
                  ? 'border-blue-500'
                  : 'border-gray-300'
          }`}
          onClick={() => toggleAtivo(ativo.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Ícone de expansão */}
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}

              {/* Ícone do ativo */}
              <div className="text-2xl">🏭</div>

              {/* Nome e informações do ativo */}
              <div>
                <h4 className={`font-semibold ${themeClasses.textPrimary}`}>
                  {ativo.nome}
                </h4>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  {ativo.totalSubatividades} subatividades •{' '}
                  {ativo.subatividadesConcluidas} concluídas
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Status do ativo */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${statusData.corFundo} ${statusData.corTexto}`}
              >
                {statusData.icone} {statusData.tipo}
              </div>

              {/* Percentual de conclusão */}
              <div className="text-right">
                <div
                  className={`text-lg font-bold ${themeClasses.textPrimary}`}
                >
                  {Math.round(ativo.percentualCompleto)}%
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      ativo.percentualCompleto >= 100
                        ? 'bg-green-500'
                        : ativo.percentualCompleto >= 70
                          ? 'bg-blue-500'
                          : ativo.percentualCompleto >= 30
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(ativo.percentualCompleto, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas do ativo */}
          <div className="mt-3 flex space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className={themeClasses.textSecondary}>
                {ativo.subatividadesConcluidas} Concluídas
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className={themeClasses.textSecondary}>
                {ativo.subatividadesEmAndamento} Em Andamento
              </span>
            </div>
            {ativo.subatividadesAtrasadas &&
              ativo.subatividadesAtrasadas > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className={themeClasses.textSecondary}>
                    {ativo.subatividadesAtrasadas} Atrasadas
                  </span>
                </div>
              )}
          </div>
        </div>

        {/* Subatividades (quando expandido) */}
        {isExpanded && ativo.subatividades && (
          <div className="ml-8 mt-3 space-y-2">
            {ativo.subatividades.map((subatividade) => (
              <div
                key={subatividade.id}
                className={`${themeClasses.card} rounded-lg p-3 border-l-2 ${
                  subatividade.status === 'concluida'
                    ? 'border-green-400'
                    : subatividade.status === 'atrasada'
                      ? 'border-red-400'
                      : subatividade.status === 'em-andamento'
                        ? 'border-blue-400'
                        : 'border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">⚙️</div>
                    <div>
                      <h5 className={`font-medium ${themeClasses.textPrimary}`}>
                        {subatividade.nome}
                      </h5>
                      <p className={`text-xs ${themeClasses.textSecondary}`}>
                        {subatividade.responsavel} • {subatividade.duracao}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status da subatividade */}
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        subatividade.status === 'concluida'
                          ? 'bg-green-100 text-green-800'
                          : subatividade.status === 'atrasada'
                            ? 'bg-red-100 text-red-800'
                            : subatividade.status === 'em-andamento'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {subatividade.status}
                    </div>

                    {/* Percentual da subatividade */}
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${themeClasses.textPrimary}`}
                      >
                        {Math.round(subatividade.percentualCompleto)}%
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${
                            subatividade.percentualCompleto >= 100
                              ? 'bg-green-500'
                              : subatividade.percentualCompleto >= 70
                                ? 'bg-blue-500'
                                : subatividade.percentualCompleto >= 30
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(subatividade.percentualCompleto, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`phase-activities-mobile space-y-6 ${themeClasses.bgSecondary} p-6 rounded-lg`}
      data-testid="phase-activities-manager"
    >
      {/* BOTÃO DE ACESSO DIRETO */}
      {onAccessDirectly && (
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg shadow-lg">
          <div>
            <h3 className="text-lg font-bold mb-1">
              🎯 Gerenciador de Atividades por Frente
            </h3>
            <p className="text-sm opacity-90">
              Visualize e gerencie atividades organizadas por frentes de
              trabalho
            </p>
          </div>
        </div>
      )}

      {/* Filtros e Pesquisa - Posicionados após a seção do Gerenciador */}
      {setFiltroStatus &&
        setFiltroPrioridade &&
        setFiltroFrente &&
        limparFiltros && (
          <div className="mb-6 p-4 rounded-lg border-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300">
            {/* Primeira linha: Pesquisa */}
            {setTermoPesquisa && (
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    🔍 Pesquisar:
                  </span>
                  <input
                    type="text"
                    value={termoPesquisa || ''}
                    onChange={(e) => setTermoPesquisa(e.target.value)}
                    placeholder="Digite o nome da atividade ou frente de trabalho..."
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Segunda linha: Filtros */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filtros:
              </span>

              {/* Filtro por Status */}
              <select
                value={filtroStatus || ''}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              >
                <option value="">Todos os Status</option>
                <option value="completa">✅ Completas</option>
                <option value="em_andamento">🔄 Em Andamento</option>
                <option value="pendente">⏳ Pendentes</option>
                <option value="atrasada">⚠️ Atrasadas</option>
              </select>

              {/* Filtro por Prioridade */}
              <select
                value={filtroPrioridade || ''}
                onChange={(e) => setFiltroPrioridade(e.target.value)}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              >
                <option value="">Todas as Prioridades</option>
                <option value="critica">🔴 Críticas</option>
                <option value="alta">🟡 Alta</option>
                <option value="media">🟢 Média</option>
                <option value="baixa">🔵 Baixa</option>
              </select>

              {/* Filtro por Frente */}
              <select
                value={filtroFrente || ''}
                onChange={(e) => setFiltroFrente(e.target.value)}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              >
                <option value="">Todas as Frentes</option>
                <option value="manutencao">🔧 Manutenção</option>
                <option value="logistica">📦 Logística</option>
                <option value="refratario">🧱 Refratário</option>
                <option value="mobilizacao">🏗️ Mobilização</option>
                <option value="testes">🔬 Testes</option>
                <option value="inspecao">🔍 Inspeção</option>
              </select>

              {/* Botão de limpar filtros */}
              <button
                onClick={limparFiltros}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
              >
                ✖️ Limpar
              </button>
            </div>
          </div>
        )}

      {/* Header com estatísticas */}
      <div className="phase-header-mobile flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2
            className={`phase-title-mobile text-2xl font-bold ${themeClasses.textPrimary}`}
          >
            Atividades - {phaseName}
          </h2>
          <p
            className={`phase-subtitle-mobile text-sm ${themeClasses.textSecondary} mt-1`}
          >
            Gerencie e monitore as atividades desta fase
          </p>
        </div>

        {/* Estatísticas rápidas */}
        <div className="phase-stats-mobile flex space-x-4">
          <div className="phase-stat-item-mobile text-center">
            <div
              className={`phase-stat-number-mobile text-2xl font-bold ${themeClasses.textPrimary}`}
            >
              {stats.total}
            </div>
            <div
              className={`phase-stat-label-mobile text-xs ${themeClasses.textSecondary}`}
            >
              Total
            </div>
          </div>
          <div className="phase-stat-item-mobile text-center">
            <div className="phase-stat-number-mobile text-2xl font-bold text-green-600">
              {stats.concluidas}
            </div>
            <div
              className={`phase-stat-label-mobile text-xs ${themeClasses.textSecondary}`}
            >
              Concluídas
            </div>
          </div>
          <div className="phase-stat-item-mobile text-center">
            <div className="phase-stat-number-mobile text-2xl font-bold text-blue-600">
              {stats.emAndamento}
            </div>
            <div
              className={`phase-stat-label-mobile text-xs ${themeClasses.textSecondary}`}
            >
              Em Andamento
            </div>
          </div>
          <div className="phase-stat-item-mobile text-center">
            <div className="phase-stat-number-mobile text-2xl font-bold text-yellow-600">
              {stats.pendentes}
            </div>
            <div
              className={`phase-stat-label-mobile text-xs ${themeClasses.textSecondary}`}
            >
              Pendentes
            </div>
          </div>
        </div>
      </div>

      {/* Lista de atividades agrupadas por frente */}
      <div className="space-y-4">
        {Object.entries(filteredAndGroupedActivities).map(
          ([frente, atividades]) => {
            const evolucaoPercentual = calcularEvolucaoFrente(atividades);
            const estatisticasCriticas =
              calcularEstatisticasCriticasFrente(atividades);

            // Verificar se as atividades são ativos da usina
            const temAtivos = atividades.some(
              (atividade: Atividade) => atividade.isAtivo
            );
            const ativos = atividades.filter(
              (atividade: Atividade) => atividade.isAtivo
            );
            const atividadesNormais = atividades.filter(
              (atividade: Atividade) => !atividade.isAtivo
            );

            return (
              <div
                key={frente}
                className={`border rounded-lg ${themeClasses.border} ${themeClasses.bgPrimary}`}
              >
                {/* Header da frente */}
                <div
                  className={`phase-group-header-mobile flex items-center justify-between p-4 cursor-pointer hover:${themeClasses.bgSecondary} transition-colors`}
                  onClick={() => toggleFrente(frente)}
                >
                  <div className="phase-group-info-mobile flex items-center space-x-3">
                    {expandedFrentes.includes(frente) ? (
                      <ChevronDown
                        size={20}
                        className={themeClasses.textSecondary}
                      />
                    ) : (
                      <ChevronRight
                        size={20}
                        className={themeClasses.textSecondary}
                      />
                    )}
                    <h3
                      className={`phase-group-title-mobile text-lg font-semibold ${themeClasses.textPrimary}`}
                    >
                      {frente}
                    </h3>
                    <span className="phase-group-badge-mobile px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {atividades.length} atividades
                    </span>

                    {/* Indicadores de Status Crítico */}
                    <div className="phase-group-badges-mobile flex items-center space-x-1">
                      {estatisticasCriticas.atrasadas > 0 && (
                        <span className="phase-group-badge-mobile px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                          🚨 {estatisticasCriticas.atrasadas} atrasadas
                        </span>
                      )}
                      {estatisticasCriticas.criticas > 0 && (
                        <span className="phase-group-badge-mobile px-2 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          ⚠️ {estatisticasCriticas.criticas} críticas
                        </span>
                      )}
                      {estatisticasCriticas.atencao > 0 && (
                        <span className="phase-group-badge-mobile px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                          ⚡ {estatisticasCriticas.atencao} atenção
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="phase-group-status-mobile flex items-center space-x-3">
                    {/* Status mais crítico da frente */}
                    {(estatisticasCriticas.atrasadas > 0 ||
                      estatisticasCriticas.criticas > 0 ||
                      estatisticasCriticas.atencao > 0) && (
                      <div
                        className={`phase-group-status-badge-mobile px-3 py-1 rounded-lg ${estatisticasCriticas.statusMaisCritico.corFundo} border`}
                      >
                        <span
                          className={`text-sm font-bold ${estatisticasCriticas.statusMaisCritico.corTexto}`}
                        >
                          {estatisticasCriticas.statusMaisCritico.icone}{' '}
                          {estatisticasCriticas.statusMaisCritico.tipo}
                        </span>
                      </div>
                    )}

                    {/* Barra de progresso */}
                    <div className="phase-group-progress-mobile flex items-center space-x-2">
                      <div className="phase-group-progress-bar-mobile w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            estatisticasCriticas.atrasadas > 0
                              ? 'bg-red-500'
                              : estatisticasCriticas.criticas > 0
                                ? 'bg-red-400'
                                : estatisticasCriticas.atencao > 0
                                  ? 'bg-yellow-400'
                                  : 'bg-green-500'
                          }`}
                          style={{ width: `${evolucaoPercentual}%` }}
                        ></div>
                      </div>
                      <span
                        className={`phase-group-progress-text-mobile text-sm font-medium ${themeClasses.textSecondary}`}
                      >
                        {evolucaoPercentual}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lista de atividades da frente */}
                {expandedFrentes.includes(frente) && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3">
                      {/* Se há ativos da usina, renderizar ativos */}
                      {temAtivos ? (
                        <>
                          {/* Renderizar ativos da usina */}
                          {ativos.map((ativo) => renderAtivo(ativo))}

                          {/* Se também há atividades normais, renderizar em seção separada */}
                          {atividadesNormais.length > 0 && (
                            <div className="mt-6">
                              <h4
                                className={`text-lg font-semibold ${themeClasses.textPrimary} mb-3`}
                              >
                                📋 Outras Atividades
                              </h4>
                              {atividadesNormais.map((atividade) => (
                                <div
                                  key={atividade.id}
                                  className={`border rounded-lg p-4 ${themeClasses.border} hover:${themeClasses.bgSecondary} transition-colors mb-3`}
                                >
                                  {/* Renderização de atividade normal aqui */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="text-lg">📝</div>
                                      <div>
                                        <h5
                                          className={`font-medium ${themeClasses.textPrimary}`}
                                        >
                                          {atividade.nome}
                                        </h5>
                                        <p
                                          className={`text-sm ${themeClasses.textSecondary}`}
                                        >
                                          {atividade.responsavel} •{' '}
                                          {atividade.duracao}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div
                                        className={`text-sm font-medium ${themeClasses.textPrimary}`}
                                      >
                                        {Math.round(
                                          atividade.percentualCompleto
                                        )}
                                        %
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        /* Se não há ativos, renderizar atividades normais como antes */
                        atividades.map((atividade) => (
                          <div
                            key={atividade.id}
                            className={`border rounded-lg p-4 ${themeClasses.border} hover:${themeClasses.bgSecondary} transition-colors`}
                          >
                            {/* Header da atividade */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <button
                                  onClick={() => {
                                    console.log(
                                      '🔘 Botão clicado para ID:',
                                      atividade.id
                                    );
                                    toggleAtividade(atividade.id);
                                  }}
                                  className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${themeClasses.textSecondary}`}
                                >
                                  {expandedAtividades.includes(atividade.id) ? (
                                    <ChevronDown
                                      size={16}
                                      className="text-blue-600"
                                    />
                                  ) : (
                                    <ChevronRight size={16} />
                                  )}
                                </button>

                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <h4
                                        className={`font-medium ${themeClasses.textPrimary}`}
                                      >
                                        {atividade.nome}
                                      </h4>

                                      {/* Indicador de Status Crítico Individual */}
                                      {(() => {
                                        const statusAnalise =
                                          analisarStatusAtividade(atividade);
                                        return (
                                          <span
                                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${statusAnalise.corFundo} ${statusAnalise.corTexto} border-opacity-30`}
                                          >
                                            <div className="flex items-center space-x-1">
                                              <span>{statusAnalise.icone}</span>
                                              <span>{statusAnalise.tipo}</span>
                                            </div>
                                          </span>
                                        );
                                      })()}
                                    </div>

                                    {/* Mensagem de Status */}
                                    {(() => {
                                      const statusAnalise =
                                        analisarStatusAtividade(atividade);
                                      return (
                                        <span
                                          className={`text-xs font-medium ${statusAnalise.corTexto}`}
                                        >
                                          {statusAnalise.mensagem}
                                        </span>
                                      );
                                    })()}
                                  </div>

                                  <div
                                    className={`text-sm ${themeClasses.textSecondary} mt-1`}
                                  >
                                    {/* ...removido duração do card principal... */}
                                  </div>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="flex items-center space-x-3">
                                <div className="text-right">
                                  <div
                                    className={`text-sm font-medium ${themeClasses.textPrimary}`}
                                  >
                                    {atividade.percentualCompleto}%
                                  </div>
                                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${atividade.percentualCompleto}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Área expandida - TESTE VISUAL SIMPLES */}
                            {expandedAtividades.includes(atividade.id) && (
                              <div className="mt-4 ml-8 border-l-2 border-blue-500 pl-4">
                                <div className="bg-green-500 text-white p-4 text-center font-bold rounded-lg mb-4">
                                  ID: {atividade.id} | {atividade.nome}
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                                  <div className="text-sm text-gray-700 dark:text-gray-200">
                                    <b>Categoria:</b> {atividade.categoria}
                                  </div>
                                  <div className="text-sm text-gray-700 dark:text-gray-200">
                                    <b>Nível:</b> {atividade.nivel}
                                  </div>
                                  <div className="text-sm text-gray-700 dark:text-gray-200">
                                    <b>Prioridade:</b> {atividade.prioridade}
                                  </div>
                                  <div className="text-sm text-gray-700 dark:text-gray-200">
                                    <b>Equipe:</b>{' '}
                                    {atividade.responsavel || 'Não informado'}
                                  </div>
                                  <div className="text-sm text-gray-700 dark:text-gray-200">
                                    <b>Progresso físico:</b>{' '}
                                    {atividade.percentualFisico}%
                                  </div>
                                  <div className="text-sm text-gray-700 dark:text-gray-200">
                                    <b>Progresso total:</b>{' '}
                                    {atividade.percentualCompleto}%
                                  </div>
                                  <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                    <span className="font-bold">
                                      Planejado:
                                    </span>{' '}
                                    Início:{' '}
                                    {(atividade as any).inicioBaseline ||
                                      atividade.inicio}{' '}
                                    | Fim:{' '}
                                    {(atividade as any).fimBaseline ||
                                      atividade.fim}
                                  </div>
                                  {(atividade as any).inicioReal &&
                                    (atividade as any).fimReal && (
                                      <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <span className="font-bold">Real:</span>{' '}
                                        Início: {(atividade as any).inicioReal}{' '}
                                        | Fim: {(atividade as any).fimReal}
                                      </div>
                                    )}
                                  {/* Dias de atraso */}
                                  {(() => {
                                    const fimPlanejado =
                                      (atividade as any).fimBaseline ||
                                      atividade.fim;
                                    const fimReal = (atividade as any).fimReal;
                                    if (fimPlanejado && fimReal) {
                                      const dataFimPlanejado = new Date(
                                        fimPlanejado
                                      );
                                      const dataFimReal = new Date(fimReal);
                                      const diffMs =
                                        dataFimReal.getTime() -
                                        dataFimPlanejado.getTime();
                                      const diffDias = Math.ceil(
                                        diffMs / (1000 * 3600 * 24)
                                      );
                                      if (diffDias > 0) {
                                        return (
                                          <div className="text-sm font-bold text-red-600">
                                            Atraso: {diffDias} dia(s)
                                          </div>
                                        );
                                      } else if (diffDias < 0) {
                                        return (
                                          <div className="text-sm font-bold text-green-600">
                                            Adiantada: {Math.abs(diffDias)}{' '}
                                            dia(s)
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div className="text-sm font-bold text-gray-600">
                                            No prazo
                                          </div>
                                        );
                                      }
                                    }
                                    return null;
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      {/* Mensagem quando não há atividades */}
      {Object.keys(filteredAndGroupedActivities).length === 0 && (
        <div className={`text-center py-12 ${themeClasses.textSecondary}`}>
          <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">
            Nenhuma atividade encontrada
          </h3>
          <p className="text-sm">
            Não há atividades cadastradas para esta fase.
          </p>
        </div>
      )}
    </div>
  );
};

export default PhaseActivitiesManager;
