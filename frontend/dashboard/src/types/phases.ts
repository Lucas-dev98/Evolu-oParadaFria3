// Tipos para as fases da parada de usina
export type PhaseType = 'preparacao' | 'parada' | 'manutencao' | 'partida';

export interface Phase {
  id: PhaseType;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'active';
  progress: number;
  startDate?: Date;
  endDate?: Date;
  estimatedDuration: number; // em dias
  activities: number;
  completedActivities: number;
  // Novos campos para dados detalhados da fase
  delayedActivities: number;
  criticalActivities: number;
  onTimeActivities: number;
  advancedActivities: number;
  estimatedEnd: string;
  daysRemaining: number;
  totalTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  categories: {
    name: string;
    delayed: number;
    critical: number;
    progress: number;
    color?: string;
  }[];
  // Nova propriedade para armazenar atividades processadas do PFUS3
  processedActivities?: any[];
  // Nova propriedade para armazenar ativos da usina identificados
  ativosIdentificados?: any[];
}

export interface ParadaData {
  title: string;
  subtitle: string;
  year: number;
  currentPhase: PhaseType;
  phases: Phase[];
  overallProgress: number;
  startDate: Date;
  estimatedEndDate: Date;
}

/**
 * Calcula o progresso geral baseado no progresso de cada fase,
 * ponderado pela duração estimada de cada fase
 */
export const calculateOverallProgress = (phases: Phase[]): number => {
  const totalDuration = phases.reduce(
    (sum, phase) => sum + phase.estimatedDuration,
    0
  );

  if (totalDuration === 0) return 0;

  const weightedProgress = phases.reduce((sum, phase) => {
    const weight = phase.estimatedDuration / totalDuration;
    return sum + phase.progress * weight;
  }, 0);

  return Math.round(weightedProgress);
};

/**
 * Atualiza os dados da parada com o progresso geral calculado dinamicamente
 */
export const updateParadaDataWithCalculatedProgress = (
  paradaData: ParadaData
): ParadaData => {
  const calculatedProgress = calculateOverallProgress(paradaData.phases);

  return {
    ...paradaData,
    overallProgress: calculatedProgress,
  };
};

// Dados mock das fases
export const getPhasesMockData = (dadosPreparacao?: any): ParadaData => {
  // Calcular progresso real da preparação se dados estão disponíveis
  let progressoPreparacao = 100; // valor padrão alterado para 100 (dados atualizados)

  // Priorizar dados salvos no localStorage se disponíveis
  try {
    const savedData = localStorage.getItem('preparacao_data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      progressoPreparacao =
        parsedData.fase?.progress || parsedData.metadata?.progressoGeral || 100;
      console.log(
        '🔄 getPhasesMockData: Usando dados salvos com progresso:',
        progressoPreparacao + '%'
      );
    }
  } catch (error) {
    console.warn(
      '⚠️ Erro ao acessar localStorage em getPhasesMockData:',
      error
    );
  }

  // Se dados de preparação foram passados como parâmetro, usar eles
  if (dadosPreparacao && dadosPreparacao.fase) {
    progressoPreparacao =
      dadosPreparacao.fase.progress ||
      dadosPreparacao.metadata?.progressoGeral ||
      progressoPreparacao; // Manter o valor obtido do localStorage se parâmetro não tem dados
    console.log(
      '🔄 getPhasesMockData: Usando dados do parâmetro com progresso:',
      progressoPreparacao + '%'
    );
  }

  const phases: Phase[] = [
    {
      id: 'preparacao',
      name: 'Preparação',
      description:
        'Planejamento e preparação para a parada - Cronograma PFUS3 2025',
      icon: '📋',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      status:
        progressoPreparacao === 100
          ? 'completed'
          : progressoPreparacao > 0
            ? 'in-progress'
            : 'not-started',
      progress: progressoPreparacao,
      startDate: new Date('2025-05-31'),
      estimatedDuration: 107, // 31/05 até 14/08 = ~75 dias (ajustado considerando período completo de preparação)
      activities: dadosPreparacao?.fase?.activities || 352,
      completedActivities:
        dadosPreparacao?.fase?.completedActivities ||
        Math.round((progressoPreparacao * 352) / 100),
      delayedActivities: dadosPreparacao?.fase?.delayedActivities || 38,
      criticalActivities: dadosPreparacao?.fase?.criticalActivities || 48,
      onTimeActivities: dadosPreparacao?.fase?.onTimeActivities || 57,
      advancedActivities: dadosPreparacao?.fase?.advancedActivities || 0,
      estimatedEnd: dadosPreparacao?.fase?.estimatedEnd || '14/08/2025', // Fim da preparação / início da parada
      daysRemaining: dadosPreparacao?.fase?.daysRemaining || 32, // dias até 14/08/2025
      totalTasks: dadosPreparacao?.fase?.totalTasks || 352,
      inProgressTasks: dadosPreparacao?.fase?.inProgressTasks || 57,
      pendingTasks: dadosPreparacao?.fase?.pendingTasks || 38,
      categories: dadosPreparacao?.fase?.categories || [
        { name: 'Mobilização', delayed: 0, critical: 5, progress: 100 },
        { name: 'Canteiros', delayed: 0, critical: 2, progress: 100 },
        { name: 'Logística', delayed: 0, critical: 10, progress: 100 },
        { name: 'Refratário', delayed: 0, critical: 8, progress: 100 },
        { name: 'Elétrica', delayed: 0, critical: 12, progress: 100 },
        { name: 'Mecânica do Forno', delayed: 0, critical: 18, progress: 100 },
        { name: 'Ventiladores', delayed: 0, critical: 5, progress: 100 },
        { name: 'Bogiflex', delayed: 0, critical: 8, progress: 100 },
      ],
    },
    {
      id: 'parada',
      name: 'Parada',
      description:
        'Desligamento e isolamento da usina - Procedimentos de Parada',
      icon: '⏹️',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      status: 'not-started',
      progress: 0,
      estimatedDuration: 12, // 14/08 até 26/08 = 12 dias
      activities: 4, // Corte + Blackouts + Procedimentos
      completedActivities: 0,
      delayedActivities: 0,
      criticalActivities: 3, // Blackouts são críticos
      onTimeActivities: 1,
      advancedActivities: 0,
      estimatedEnd: '26/08/2025',
      daysRemaining: 9, // dias até 26/08/2025
      totalTasks: 4,
      inProgressTasks: 0,
      pendingTasks: 4,
      categories: [
        { name: 'Corte de Produção', delayed: 0, critical: 1, progress: 0 },
        { name: 'Blackout - SEP', delayed: 0, critical: 1, progress: 0 },
        { name: 'Blackout - SEM', delayed: 0, critical: 1, progress: 0 },
        { name: 'Procedimentos', delayed: 0, critical: 0, progress: 0 },
      ],
    },
    {
      id: 'manutencao',
      name: 'Manutenção',
      description:
        'Execução das manutenções programadas - Cronograma Operacional',
      icon: '🔧',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      status: 'not-started',
      progress: 0,
      estimatedDuration: 51, // 26/08 até 16/10 = ~51 dias (ajustado para incluir período completo)
      activities: 1, // Manutenção principal
      completedActivities: 0,
      delayedActivities: 0,
      criticalActivities: 1, // Manutenção é crítica
      onTimeActivities: 0,
      advancedActivities: 0,
      estimatedEnd: '08/10/2025', // Fim da manutenção / início da partida
      daysRemaining: 51, // dias até 08/10/2025
      totalTasks: 1,
      inProgressTasks: 0,
      pendingTasks: 1,
      categories: [
        { name: 'Manutenção Preventiva', delayed: 0, critical: 1, progress: 0 },
        { name: 'Manutenção Corretiva', delayed: 0, critical: 0, progress: 0 },
        { name: 'Inspeções', delayed: 0, critical: 0, progress: 0 },
        { name: 'Testes', delayed: 0, critical: 0, progress: 0 },
      ],
    },
    {
      id: 'partida',
      name: 'Partida',
      description: 'Retorno da usina à operação - Procedimentos de Partida',
      icon: '▶️',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      status: 'not-started',
      progress: 0,
      estimatedDuration: 8, // 08/10 até 16/10 = ~8 dias
      activities: 1, // Procedimentos de Partida
      completedActivities: 0,
      delayedActivities: 0,
      criticalActivities: 1, // Partida é crítica
      onTimeActivities: 0,
      advancedActivities: 0,
      estimatedEnd: '16/10/2025', // Data final do projeto PFUS3
      daysRemaining: 58, // dias até 16/10/2025
      totalTasks: 1,
      inProgressTasks: 0,
      pendingTasks: 1,
      categories: [
        { name: 'Testes Operacionais', delayed: 0, critical: 1, progress: 0 },
        { name: 'Comissionamento', delayed: 0, critical: 0, progress: 0 },
        { name: 'Sincronização', delayed: 0, critical: 0, progress: 0 },
        { name: 'Procedimentos', delayed: 0, critical: 0, progress: 0 },
      ],
    },
  ];

  // Calcular progresso geral baseado nas fases
  const overallProgress = calculateOverallProgress(phases);

  return {
    title: 'EPU - Parada de Usina',
    subtitle: 'Parada Fria Usina 3 2025',
    year: 2025,
    currentPhase: 'preparacao',
    overallProgress, // Agora calculado dinamicamente
    startDate: new Date('2025-05-31'), // Primeiro dia de preparação (Mobilização da Equipe de Apoio de Elétrica)
    estimatedEndDate: new Date('2025-10-16'), // Último dia de partida (Parada Fria da Usina 3 Concluída)
    phases,
  };
};
