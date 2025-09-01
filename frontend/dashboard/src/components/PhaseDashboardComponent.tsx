import React from 'react';
import { PhaseType } from '../types/phases';
import PhaseCardComponent from './PhaseCardComponent';

interface PhaseDashboardProps {
  paradaData: any;
  onPhaseClick: (phaseType: PhaseType) => void;
}

export default function PhaseDashboard({
  paradaData,
  onPhaseClick,
}: PhaseDashboardProps) {
  const phases = [
    {
      type: 'preparacao' as PhaseType,
      title: 'Preparação',
      icon: '📋',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-800 dark:text-blue-200',
      progressColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      type: 'parada' as PhaseType,
      title: 'Parada',
      icon: '🛑',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-800 dark:text-red-200',
      progressColor: 'text-red-600 dark:text-red-400',
    },
    {
      type: 'manutencao' as PhaseType,
      title: 'Manutenção',
      icon: '🔧',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-800 dark:text-orange-200',
      progressColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      type: 'partida' as PhaseType,
      title: 'Partida',
      icon: '🚀',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-800 dark:text-green-200',
      progressColor: 'text-green-600 dark:text-green-400',
    },
  ];

  const getPhaseProgress = (phaseType: string): number => {
    return (
      paradaData?.phases?.find((p: any) => p.type === phaseType)?.progress || 0
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
        Dashboard PFUS3
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Parada Fria - Visão Geral do Projeto
      </p>

      {/* Cards de Resumo - Todas as 4 Fases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {phases.map((phase) => (
          <PhaseCardComponent
            key={phase.type}
            type={phase.type}
            title={phase.title}
            icon={phase.icon}
            progress={getPhaseProgress(phase.type)}
            bgColor={phase.bgColor}
            textColor={phase.textColor}
            progressColor={phase.progressColor}
            onClick={() => onPhaseClick(phase.type)}
          />
        ))}
      </div>
    </div>
  );
}
