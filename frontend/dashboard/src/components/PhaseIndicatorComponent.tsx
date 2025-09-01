import React from 'react';
import { PhaseType } from '../types/phases';

interface PhaseIndicatorProps {
  selectedPhase: PhaseType;
  onBackToDashboard?: () => void;
}

export default function PhaseIndicator({
  selectedPhase,
  onBackToDashboard,
}: PhaseIndicatorProps) {
  const getPhaseClasses = (phase: PhaseType) => {
    const phaseMap = {
      preparacao: {
        icon: '📋',
        name: 'Preparação',
        containerClass:
          'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500',
        iconClass: 'text-blue-600 dark:text-blue-400',
        titleClass: 'text-blue-800 dark:text-blue-200',
        textClass: 'text-blue-600 dark:text-blue-400',
        buttonClass: 'bg-blue-500 hover:bg-blue-600',
      },
      parada: {
        icon: '🛑',
        name: 'Parada',
        containerClass:
          'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500',
        iconClass: 'text-red-600 dark:text-red-400',
        titleClass: 'text-red-800 dark:text-red-200',
        textClass: 'text-red-600 dark:text-red-400',
        buttonClass: 'bg-red-500 hover:bg-red-600',
      },
      manutencao: {
        icon: '🔧',
        name: 'Manutenção',
        containerClass:
          'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500',
        iconClass: 'text-orange-600 dark:text-orange-400',
        titleClass: 'text-orange-800 dark:text-orange-200',
        textClass: 'text-orange-600 dark:text-orange-400',
        buttonClass: 'bg-orange-500 hover:bg-orange-600',
      },
      partida: {
        icon: '🚀',
        name: 'Partida',
        containerClass:
          'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500',
        iconClass: 'text-green-600 dark:text-green-400',
        titleClass: 'text-green-800 dark:text-green-200',
        textClass: 'text-green-600 dark:text-green-400',
        buttonClass: 'bg-green-500 hover:bg-green-600',
      },
    };
    return (
      phaseMap[phase] || {
        icon: '❓',
        name: 'Desconhecida',
        containerClass:
          'bg-gray-50 dark:bg-gray-900/20 border-l-4 border-gray-500',
        iconClass: 'text-gray-600 dark:text-gray-400',
        titleClass: 'text-gray-800 dark:text-gray-200',
        textClass: 'text-gray-600 dark:text-gray-400',
        buttonClass: 'bg-gray-500 hover:bg-gray-600',
      }
    );
  };

  const phaseInfo = getPhaseClasses(selectedPhase);

  return (
    <div className={`${phaseInfo.containerClass} p-4 rounded-lg mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`${phaseInfo.iconClass} text-lg`}>
            {phaseInfo.icon}
          </span>
          <div>
            <h3 className={`font-semibold ${phaseInfo.titleClass}`}>
              Fase Selecionada: {phaseInfo.name}
            </h3>
            <p className={`text-sm ${phaseInfo.textClass}`}>
              Mostrando apenas atividades desta fase. Use os filtros abaixo para
              refinar ainda mais.
            </p>
          </div>
        </div>
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className={`px-3 py-1 ${phaseInfo.buttonClass} text-white rounded-md text-sm transition-colors`}
          >
            ← Voltar ao Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
