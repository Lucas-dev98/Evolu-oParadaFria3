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

// Dados mock das fases
export const getPhasesMockData = (): ParadaData => ({
  title: 'EPU - Parada de Usina',
  subtitle: 'Parada Fria Usina 3 2025',
  year: 2025,
  currentPhase: 'preparacao',
  overallProgress: 73,
  startDate: new Date('2025-05-31'),
  estimatedEndDate: new Date('2025-10-14'),
  phases: [
    {
      id: 'preparacao',
      name: 'Preparação',
      description:
        'Planejamento e preparação para a parada - Cronograma PFUS3 2025',
      icon: '📋',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      status: 'in-progress',
      progress: 73,
      startDate: new Date('2025-05-31'),
      estimatedDuration: 111, // 31/05 até 18/09 = ~111 dias
      activities: 352,
      completedActivities: 257, // 73% de 352
      delayedActivities: 38,
      criticalActivities: 48,
      onTimeActivities: 57,
      advancedActivities: 0,
      estimatedEnd: '18/09/2025',
      daysRemaining: 32, // dias até 18/09/2025
      totalTasks: 352,
      inProgressTasks: 57,
      pendingTasks: 38,
      categories: [
        { name: 'Mobilização', delayed: 0, critical: 5, progress: 100 },
        { name: 'Canteiros', delayed: 0, critical: 2, progress: 100 },
        { name: 'Logística', delayed: 8, critical: 10, progress: 32 },
        { name: 'Refratário', delayed: 6, critical: 8, progress: 33 },
        { name: 'Elétrica', delayed: 4, critical: 12, progress: 50 },
        { name: 'Mecânica do Forno', delayed: 15, critical: 18, progress: 27 },
        { name: 'Ventiladores', delayed: 2, critical: 5, progress: 0 },
        { name: 'Bogiflex', delayed: 3, critical: 8, progress: 45 },
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
      estimatedDuration: 54, // 15/08 até 07/10 = ~54 dias
      activities: 1, // Manutenção principal
      completedActivities: 0,
      delayedActivities: 0,
      criticalActivities: 1, // Manutenção é crítica
      onTimeActivities: 0,
      advancedActivities: 0,
      estimatedEnd: '07/10/2025',
      daysRemaining: 51, // dias até 07/10/2025
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
      estimatedDuration: 36, // 08/09 até 14/10 = ~36 dias (856 hrs ÷ 24)
      activities: 1, // Procedimentos de Partida
      completedActivities: 0,
      delayedActivities: 0,
      criticalActivities: 1, // Partida é crítica
      onTimeActivities: 0,
      advancedActivities: 0,
      estimatedEnd: '14/10/2025',
      daysRemaining: 58, // dias até 14/10/2025
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
  ],
});
