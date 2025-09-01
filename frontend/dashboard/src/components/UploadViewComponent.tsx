import React from 'react';
import PhaseActivitiesManager from './PhaseActivitiesManager';

interface UploadViewProps {
  onDataUpdate?: () => void;
}

export default function UploadView({ onDataUpdate }: UploadViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          📁 Upload de Dados
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Carregue arquivos de preparação e relatórios operacionais do projeto
          PFUS3.
        </p>
      </div>
      <PhaseActivitiesManager activities={[]} phaseName="Upload de Arquivos" />
    </div>
  );
}
