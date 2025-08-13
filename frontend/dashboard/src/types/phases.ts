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
  overallProgress: 15,
  startDate: new Date('2025-01-15'),
  estimatedEndDate: new Date('2025-04-30'),
  phases: [
    {
      id: 'preparacao',
      name: 'Preparação',
      description: 'Planejamento e preparação para a parada',
      icon: '📋',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      status: 'active',
      progress: 52.77,
      startDate: new Date('2025-01-15'),
      estimatedDuration: 45,
      activities: 124,
      completedActivities: 37,
      delayedActivities: 23,
      criticalActivities: 10,
      onTimeActivities: 0,
      advancedActivities: 0,
      estimatedEnd: '17/09/2025',
      daysRemaining: 37,
      totalTasks: 190,
      inProgressTasks: 21,
      pendingTasks: 132,
      categories: [
        { name: 'Logística', delayed: 2, critical: 0, progress: 16 },
        { name: 'Refratário', delayed: 2, critical: 1, progress: 60 },
        { name: 'Elétrica', delayed: 2, critical: 0, progress: 50 },
        { name: 'Preparação', delayed: 14, critical: 9, progress: 25 },
        { name: 'Mecânica do Forno', delayed: 3, critical: 0, progress: 66 },
        { name: 'Barramentos', delayed: 0, critical: 0, progress: 100 },
      ],
    },
    {
      id: 'parada',
      name: 'Parada',
      description: 'Desligamento e isolamento da usina',
      icon: '⏹️',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      status: 'not-started',
      progress: 0,
      estimatedDuration: 7,
      activities: 45,
      completedActivities: 0,
      delayedActivities: 0,
      criticalActivities: 0,
      onTimeActivities: 45,
      advancedActivities: 0,
      estimatedEnd: '24/09/2025',
      daysRemaining: 44,
      totalTasks: 89,
      inProgressTasks: 0,
      pendingTasks: 89,
      categories: [
        { name: 'Elétrica', delayed: 0, critical: 0, progress: 0 },
        { name: 'Operacional', delayed: 0, critical: 0, progress: 0 },
        { name: 'Segurança', delayed: 0, critical: 0, progress: 0 },
      ],
    },
    {
      id: 'manutencao',
      name: 'Manutenção',
      description: 'Execução das manutenções programadas',
      icon: '🔧',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      status: 'not-started',
      progress: 0,
      estimatedDuration: 60,
      activities: 287,
      completedActivities: 0,
      delayedActivities: 0,
      criticalActivities: 0,
      onTimeActivities: 287,
      advancedActivities: 0,
      estimatedEnd: '23/11/2025',
      daysRemaining: 104,
      totalTasks: 456,
      inProgressTasks: 0,
      pendingTasks: 456,
      categories: [
        { name: 'Refratário', delayed: 0, critical: 0, progress: 0 },
        { name: 'Mecânica', delayed: 0, critical: 0, progress: 0 },
        { name: 'Instrumentação', delayed: 0, critical: 0, progress: 0 },
        { name: 'Civil', delayed: 0, critical: 0, progress: 0 },
      ],
    },
    {
      id: 'partida',
      name: 'Partida',
      description: 'Retorno da usina à operação',
      icon: '▶️',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      status: 'not-started',
      progress: 0,
      estimatedDuration: 14,
      activities: 67,
      completedActivities: 0,
      delayedActivities: 0,
      criticalActivities: 0,
      onTimeActivities: 67,
      advancedActivities: 0,
      estimatedEnd: '07/12/2025',
      daysRemaining: 118,
      totalTasks: 123,
      inProgressTasks: 0,
      pendingTasks: 123,
      categories: [
        { name: 'Testes', delayed: 0, critical: 0, progress: 0 },
        { name: 'Comissionamento', delayed: 0, critical: 0, progress: 0 },
        { name: 'Operacional', delayed: 0, critical: 0, progress: 0 },
      ],
    },
  ],
});
