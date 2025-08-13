import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  PlayCircle,
  PauseCircle,
  Power,
  Wrench,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Users,
  Settings,
  Gauge,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useThemeClasses } from '../contexts/ThemeContext';

interface FaseProxima {
  id: string;
  nome: string;
  tipo: 'parada' | 'manutencao' | 'partida';
  dataInicio: Date;
  dataFim: Date;
  progresso: number;
  status: 'nao_iniciada' | 'planejamento' | 'execucao' | 'concluida';
  responsavel: string;
  equipes: string[];
  atividades: AtividadeFase[];
  recursos: RecursoFase[];
  riscos: RiscoFase[];
  descricao: string;
  icone: React.ReactNode;
  cor: string;
}

interface AtividadeFase {
  id: string;
  nome: string;
  descricao: string;
  dataInicio: Date;
  dataFim: Date;
  progresso: number;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
  responsavel: string;
  predecessores: string[];
  duracao: number; // em horas
  criticidade: 'baixa' | 'media' | 'alta' | 'critica';
}

interface RecursoFase {
  id: string;
  tipo: 'humano' | 'equipamento' | 'material' | 'terceiros';
  nome: string;
  quantidade: number;
  unidade: string;
  disponibilidade: number; // em %
  custo: number;
  status: 'disponivel' | 'alocado' | 'indisponivel';
}

interface RiscoFase {
  id: string;
  descricao: string;
  probabilidade: 'baixa' | 'media' | 'alta';
  impacto: 'baixo' | 'medio' | 'alto';
  categoria:
    | 'tecnico'
    | 'operacional'
    | 'ambiental'
    | 'seguranca'
    | 'cronograma';
  acaoMitigacao: string;
  responsavel: string;
  status: 'identificado' | 'mitigando' | 'mitigado' | 'materializado';
}

export default function FasesProximasManager() {
  const themeClasses = useThemeClasses();
  const [faseAtiva, setFaseAtiva] = useState<string>('parada');
  const [fases, setFases] = useState<FaseProxima[]>([]);
  const [visaoAtiva, setVisaoAtiva] = useState<
    'cronograma' | 'recursos' | 'riscos' | 'dashboard'
  >('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    inicializarFases();
  }, []);

  const inicializarFases = () => {
    setIsLoading(true);

    // Dados simulados das próximas fases
    const fasesSimuladas: FaseProxima[] = [
      {
        id: 'parada',
        nome: 'Parada Programada',
        tipo: 'parada',
        dataInicio: new Date('2025-08-15'),
        dataFim: new Date('2025-08-20'),
        progresso: 15,
        status: 'planejamento',
        responsavel: 'João Silva - Supervisor de Parada',
        equipes: ['Operação', 'Manutenção', 'Segurança', 'Elétrica'],
        atividades: [],
        recursos: [],
        riscos: [],
        descricao:
          'Parada programada para manutenção do forno e sistemas auxiliares',
        icone: <PauseCircle className="w-6 h-6" />,
        cor: 'bg-red-500',
      },
      {
        id: 'manutencao',
        nome: 'Manutenção Geral',
        tipo: 'manutencao',
        dataInicio: new Date('2025-08-20'),
        dataFim: new Date('2025-09-10'),
        progresso: 5,
        status: 'planejamento',
        responsavel: 'Maria Santos - Gerente de Manutenção',
        equipes: [
          'Manutenção Mecânica',
          'Manutenção Elétrica',
          'Refratário',
          'Terceiros',
        ],
        atividades: [],
        recursos: [],
        riscos: [],
        descricao: 'Manutenção completa dos equipamentos durante a parada',
        icone: <Wrench className="w-6 h-6" />,
        cor: 'bg-yellow-500',
      },
      {
        id: 'partida',
        nome: 'Partida do Sistema',
        tipo: 'partida',
        dataInicio: new Date('2025-09-10'),
        dataFim: new Date('2025-09-15'),
        progresso: 0,
        status: 'nao_iniciada',
        responsavel: 'Carlos Oliveira - Supervisor de Operação',
        equipes: ['Operação', 'Manutenção', 'Segurança', 'Controle'],
        atividades: [],
        recursos: [],
        riscos: [],
        descricao:
          'Processo de partida e estabilização do sistema após manutenção',
        icone: <PlayCircle className="w-6 h-6" />,
        cor: 'bg-green-500',
      },
    ];

    // Adicionar atividades detalhadas para cada fase
    fasesSimuladas.forEach((fase) => {
      fase.atividades = gerarAtividades(fase.tipo);
      fase.recursos = gerarRecursos(fase.tipo);
      fase.riscos = gerarRiscos(fase.tipo);
    });

    setFases(fasesSimuladas);
    setIsLoading(false);
  };

  const gerarAtividades = (tipoFase: string): AtividadeFase[] => {
    const atividadesPorFase = {
      parada: [
        {
          nome: 'Preparação para Parada',
          descricao: 'Preparar documentação e recursos necessários',
          duracao: 8,
          criticidade: 'alta' as const,
        },
        {
          nome: 'Redução de Carga',
          descricao: 'Reduzir gradualmente a carga do forno',
          duracao: 16,
          criticidade: 'critica' as const,
        },
        {
          nome: 'Parada Segura do Forno',
          descricao: 'Executar procedimento de parada segura',
          duracao: 12,
          criticidade: 'critica' as const,
        },
        {
          nome: 'Isolamento e Bloqueio',
          descricao: 'Isolar e bloquear sistemas de energia',
          duracao: 4,
          criticidade: 'alta' as const,
        },
      ],
      manutencao: [
        {
          nome: 'Inspeção Geral',
          descricao: 'Inspeção detalhada de todos os sistemas',
          duracao: 24,
          criticidade: 'alta' as const,
        },
        {
          nome: 'Manutenção Refratário',
          descricao: 'Reparo e substituição de refratários',
          duracao: 120,
          criticidade: 'critica' as const,
        },
        {
          nome: 'Manutenção Elétrica',
          descricao: 'Revisão sistemas elétricos e controle',
          duracao: 80,
          criticidade: 'alta' as const,
        },
        {
          nome: 'Manutenção Mecânica',
          descricao: 'Revisão equipamentos mecânicos',
          duracao: 100,
          criticidade: 'alta' as const,
        },
        {
          nome: 'Testes e Comissionamento',
          descricao: 'Testes funcionais dos sistemas',
          duracao: 40,
          criticidade: 'critica' as const,
        },
      ],
      partida: [
        {
          nome: 'Pré-aquecimento',
          descricao: 'Aquecimento gradual do forno',
          duracao: 48,
          criticidade: 'critica' as const,
        },
        {
          nome: 'Testes Operacionais',
          descricao: 'Testes de todos os sistemas operacionais',
          duracao: 16,
          criticidade: 'alta' as const,
        },
        {
          nome: 'Primeira Carga',
          descricao: 'Processamento da primeira carga de teste',
          duracao: 8,
          criticidade: 'alta' as const,
        },
        {
          nome: 'Estabilização',
          descricao: 'Estabilização dos parâmetros operacionais',
          duracao: 24,
          criticidade: 'media' as const,
        },
      ],
    };

    const atividades =
      atividadesPorFase[tipoFase as keyof typeof atividadesPorFase] || [];

    return atividades.map((ativ, index) => ({
      id: `${tipoFase}_ativ_${index}`,
      nome: ativ.nome,
      descricao: ativ.descricao,
      dataInicio: new Date(Date.now() + index * 24 * 60 * 60 * 1000),
      dataFim: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000),
      progresso: Math.floor(Math.random() * 30),
      status: index === 0 ? 'em_andamento' : 'pendente',
      responsavel: `Responsável ${index + 1}`,
      predecessores: index > 0 ? [`${tipoFase}_ativ_${index - 1}`] : [],
      duracao: ativ.duracao,
      criticidade: ativ.criticidade,
    }));
  };

  const gerarRecursos = (tipoFase: string): RecursoFase[] => {
    return [
      {
        id: `${tipoFase}_rec_1`,
        tipo: 'humano',
        nome: 'Técnicos Especializados',
        quantidade: 12,
        unidade: 'pessoas',
        disponibilidade: 85,
        custo: 150000,
        status: 'disponivel',
      },
      {
        id: `${tipoFase}_rec_2`,
        tipo: 'equipamento',
        nome: 'Guindastes e Equipamentos',
        quantidade: 3,
        unidade: 'unidades',
        disponibilidade: 90,
        custo: 80000,
        status: 'disponivel',
      },
      {
        id: `${tipoFase}_rec_3`,
        tipo: 'material',
        nome: 'Materiais e Insumos',
        quantidade: 1,
        unidade: 'lote',
        disponibilidade: 95,
        custo: 200000,
        status: 'disponivel',
      },
    ];
  };

  const gerarRiscos = (tipoFase: string): RiscoFase[] => {
    const riscosPorFase = {
      parada: [
        {
          descricao: 'Atraso na parada por problemas operacionais',
          categoria: 'operacional' as const,
          probabilidade: 'media' as const,
          impacto: 'alto' as const,
        },
        {
          descricao: 'Problemas de segurança durante a parada',
          categoria: 'seguranca' as const,
          probabilidade: 'baixa' as const,
          impacto: 'alto' as const,
        },
      ],
      manutencao: [
        {
          descricao: 'Descoberta de problemas não planejados',
          categoria: 'tecnico' as const,
          probabilidade: 'alta' as const,
          impacto: 'alto' as const,
        },
        {
          descricao: 'Atraso na entrega de materiais',
          categoria: 'cronograma' as const,
          probabilidade: 'media' as const,
          impacto: 'medio' as const,
        },
      ],
      partida: [
        {
          descricao: 'Falhas nos testes de partida',
          categoria: 'tecnico' as const,
          probabilidade: 'media' as const,
          impacto: 'alto' as const,
        },
        {
          descricao: 'Instabilidade operacional na partida',
          categoria: 'operacional' as const,
          probabilidade: 'baixa' as const,
          impacto: 'medio' as const,
        },
      ],
    };

    const riscos = riscosPorFase[tipoFase as keyof typeof riscosPorFase] || [];

    return riscos.map((risco, index) => ({
      id: `${tipoFase}_risk_${index}`,
      descricao: risco.descricao,
      probabilidade: risco.probabilidade,
      impacto: risco.impacto,
      categoria: risco.categoria,
      acaoMitigacao: `Ação de mitigação para: ${risco.descricao}`,
      responsavel: `Responsável Risco ${index + 1}`,
      status: 'identificado' as const,
    }));
  };

  const faseAtual = fases.find((f) => f.id === faseAtiva);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'nao_iniciada':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'planejamento':
        return <Settings className="w-4 h-4 text-blue-500" />;
      case 'execucao':
        return <Activity className="w-4 h-4 text-orange-500" />;
      case 'concluida':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nao_iniciada':
        return 'text-gray-600 bg-gray-100';
      case 'planejamento':
        return 'text-blue-600 bg-blue-100';
      case 'execucao':
        return 'text-orange-600 bg-orange-100';
      case 'concluida':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getCriticidadeColor = (criticidade: string) => {
    switch (criticidade) {
      case 'baixa':
        return 'bg-green-100 text-green-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'alta':
        return 'bg-orange-100 text-orange-800';
      case 'critica':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Carregando fases do projeto...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary}`}>
            Próximas Fases do Projeto
          </h2>
          <p className={`${themeClasses.textSecondary} mt-1`}>
            Parada • Manutenção • Partida
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span className={`text-sm ${themeClasses.textSecondary}`}>
            Ago 2025 - Set 2025
          </span>
        </div>
      </div>

      {/* Navegação das Fases */}
      <div className={`${themeClasses.card} rounded-lg p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
            Fases do Projeto
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fases.map((fase, index) => (
            <div key={fase.id} className="relative">
              <button
                onClick={() => setFaseAtiva(fase.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  faseAtiva === fase.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${fase.cor} text-white`}>
                      {fase.icone}
                    </div>
                    <div>
                      <h4 className={`font-medium ${themeClasses.textPrimary}`}>
                        {fase.nome}
                      </h4>
                    </div>
                  </div>
                  {getStatusIcon(fase.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(fase.status)}`}
                    >
                      {fase.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span
                      className={`text-sm font-medium ${themeClasses.textPrimary}`}
                    >
                      {fase.progresso}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${fase.cor}`}
                      style={{ width: `${fase.progresso}%` }}
                    ></div>
                  </div>

                  <div className={`text-xs ${themeClasses.textSecondary}`}>
                    {fase.dataInicio.toLocaleDateString('pt-BR')} -{' '}
                    {fase.dataFim.toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </button>

              {/* Conectores entre fases */}
              {index < fases.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navegação das Visões */}
      {faseAtual && (
        <div className={`${themeClasses.card} rounded-lg p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
              {faseAtual.nome} - Detalhes
            </h3>
            <div className={`flex ${themeClasses.bgSecondary} rounded-lg p-1`}>
              {[
                {
                  key: 'dashboard',
                  label: 'Dashboard',
                  icon: <BarChart3 className="w-4 h-4" />,
                },
                {
                  key: 'cronograma',
                  label: 'Cronograma',
                  icon: <Calendar className="w-4 h-4" />,
                },
                {
                  key: 'recursos',
                  label: 'Recursos',
                  icon: <Users className="w-4 h-4" />,
                },
                {
                  key: 'riscos',
                  label: 'Riscos',
                  icon: <AlertCircle className="w-4 h-4" />,
                },
              ].map((visao) => (
                <button
                  key={visao.key}
                  onClick={() => setVisaoAtiva(visao.key as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    visaoAtiva === visao.key
                      ? `${themeClasses.bgPrimary} ${themeClasses.textPrimary} shadow-sm`
                      : `${themeClasses.textSecondary} hover:${themeClasses.textPrimary}`
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    {visao.icon}
                    <span>{visao.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo da Visão Ativa */}
          {visaoAtiva === 'dashboard' && (
            <div className="space-y-6">
              {/* Resumo da Fase */}
              <div className={`${themeClasses.bgSecondary} rounded-lg p-4`}>
                <h4 className={`font-medium ${themeClasses.textPrimary} mb-2`}>
                  Resumo da Fase
                </h4>
                <p className={`${themeClasses.textSecondary} mb-4`}>
                  {faseAtual.descricao}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${themeClasses.textPrimary}`}
                    >
                      {faseAtual.atividades.length}
                    </div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>
                      Atividades
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${themeClasses.textPrimary}`}
                    >
                      {faseAtual.recursos.length}
                    </div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>
                      Recursos
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${themeClasses.textPrimary}`}
                    >
                      {faseAtual.riscos.length}
                    </div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>
                      Riscos
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${themeClasses.textPrimary}`}
                    >
                      {Math.ceil(
                        (faseAtual.dataFim.getTime() -
                          faseAtual.dataInicio.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>
                      Dias
                    </div>
                  </div>
                </div>
              </div>

              {/* Atividades Principais */}
              <div>
                <h4 className={`font-medium ${themeClasses.textPrimary} mb-3`}>
                  Principais Atividades
                </h4>
                <div className="space-y-3">
                  {faseAtual.atividades.slice(0, 3).map((atividade) => (
                    <div
                      key={atividade.id}
                      className={`${themeClasses.bgSecondary} rounded-lg p-3`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5
                          className={`font-medium ${themeClasses.textPrimary}`}
                        >
                          {atividade.nome}
                        </h5>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getCriticidadeColor(atividade.criticidade)}`}
                        >
                          {atividade.criticidade.toUpperCase()}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${themeClasses.textSecondary} mb-2`}
                      >
                        {atividade.descricao}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs ${themeClasses.textSecondary}`}
                        >
                          {atividade.duracao}h • {atividade.responsavel}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 bg-blue-600 rounded-full"
                              style={{ width: `${atividade.progresso}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-xs font-medium ${themeClasses.textPrimary}`}
                          >
                            {atividade.progresso}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {visaoAtiva === 'cronograma' && (
            <div className="space-y-4">
              <h4 className={`font-medium ${themeClasses.textPrimary}`}>
                Cronograma Detalhado - {faseAtual.nome}
              </h4>
              {faseAtual.atividades.map((atividade) => (
                <div
                  key={atividade.id}
                  className={`${themeClasses.bgSecondary} rounded-lg p-4`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className={`font-medium ${themeClasses.textPrimary}`}>
                      {atividade.nome}
                    </h5>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getCriticidadeColor(atividade.criticidade)}`}
                      >
                        {atividade.criticidade}
                      </span>
                      {getStatusIcon(atividade.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className={`text-xs ${themeClasses.textSecondary}`}>
                        Início
                      </span>
                      <div
                        className={`font-medium ${themeClasses.textPrimary}`}
                      >
                        {atividade.dataInicio.toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      <span className={`text-xs ${themeClasses.textSecondary}`}>
                        Fim
                      </span>
                      <div
                        className={`font-medium ${themeClasses.textPrimary}`}
                      >
                        {atividade.dataFim.toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      <span className={`text-xs ${themeClasses.textSecondary}`}>
                        Duração
                      </span>
                      <div
                        className={`font-medium ${themeClasses.textPrimary}`}
                      >
                        {atividade.duracao}h
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className={`text-xs ${themeClasses.textSecondary}`}>
                      Progresso
                    </span>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${atividade.progresso}%` }}
                        ></div>
                      </div>
                      <span
                        className={`text-sm font-medium ${themeClasses.textPrimary}`}
                      >
                        {atividade.progresso}%
                      </span>
                    </div>
                  </div>

                  <div className={`text-sm ${themeClasses.textSecondary}`}>
                    <strong>Responsável:</strong> {atividade.responsavel}
                  </div>
                  {atividade.predecessores.length > 0 && (
                    <div className={`text-sm ${themeClasses.textSecondary}`}>
                      <strong>Dependências:</strong>{' '}
                      {atividade.predecessores.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {visaoAtiva === 'recursos' && (
            <div className="space-y-4">
              <h4 className={`font-medium ${themeClasses.textPrimary}`}>
                Recursos - {faseAtual.nome}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {faseAtual.recursos.map((recurso) => (
                  <div
                    key={recurso.id}
                    className={`${themeClasses.bgSecondary} rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h5 className={`font-medium ${themeClasses.textPrimary}`}>
                        {recurso.nome}
                      </h5>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          recurso.status === 'disponivel'
                            ? 'bg-green-100 text-green-800'
                            : recurso.status === 'alocado'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {recurso.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span
                          className={`text-sm ${themeClasses.textSecondary}`}
                        >
                          Tipo:
                        </span>
                        <span className={`text-sm ${themeClasses.textPrimary}`}>
                          {recurso.tipo}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span
                          className={`text-sm ${themeClasses.textSecondary}`}
                        >
                          Quantidade:
                        </span>
                        <span className={`text-sm ${themeClasses.textPrimary}`}>
                          {recurso.quantidade} {recurso.unidade}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span
                          className={`text-sm ${themeClasses.textSecondary}`}
                        >
                          Disponibilidade:
                        </span>
                        <span className={`text-sm ${themeClasses.textPrimary}`}>
                          {recurso.disponibilidade}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span
                          className={`text-sm ${themeClasses.textSecondary}`}
                        >
                          Custo:
                        </span>
                        <span className={`text-sm ${themeClasses.textPrimary}`}>
                          R$ {recurso.custo.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div
                        className={`text-xs ${themeClasses.textSecondary} mb-1`}
                      >
                        Disponibilidade
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            recurso.disponibilidade >= 90
                              ? 'bg-green-500'
                              : recurso.disponibilidade >= 70
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${recurso.disponibilidade}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visaoAtiva === 'riscos' && (
            <div className="space-y-4">
              <h4 className={`font-medium ${themeClasses.textPrimary}`}>
                Análise de Riscos - {faseAtual.nome}
              </h4>
              <div className="space-y-3">
                {faseAtual.riscos.map((risco) => (
                  <div
                    key={risco.id}
                    className={`${themeClasses.bgSecondary} rounded-lg p-4`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5
                          className={`font-medium ${themeClasses.textPrimary} mb-1`}
                        >
                          {risco.descricao}
                        </h5>
                        <div className="flex items-center space-x-2 mb-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800`}
                          >
                            {risco.categoria}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              risco.probabilidade === 'alta'
                                ? 'bg-red-100 text-red-800'
                                : risco.probabilidade === 'media'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            Prob: {risco.probabilidade}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              risco.impacto === 'alto'
                                ? 'bg-red-100 text-red-800'
                                : risco.impacto === 'medio'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            Impacto: {risco.impacto}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          risco.status === 'mitigado'
                            ? 'bg-green-100 text-green-800'
                            : risco.status === 'mitigando'
                              ? 'bg-blue-100 text-blue-800'
                              : risco.status === 'materializado'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {risco.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span
                          className={`text-xs ${themeClasses.textSecondary} font-medium`}
                        >
                          Ação de Mitigação:
                        </span>
                        <p
                          className={`text-sm ${themeClasses.textPrimary} mt-1`}
                        >
                          {risco.acaoMitigacao}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-xs ${themeClasses.textSecondary}`}
                        >
                          <strong>Responsável:</strong> {risco.responsavel}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
