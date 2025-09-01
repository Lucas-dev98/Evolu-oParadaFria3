import React from 'react';
import AIAnalysisComponent from './AIAnalysisComponent';
import { CategoriaCronograma } from '../types/cronograma';

interface IAViewProps {
  categoriasCronograma: CategoriaCronograma[];
}

export default function IAView({ categoriasCronograma }: IAViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          🧠 Análise IA
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Análises inteligentes e insights gerados por IA para otimização do
          projeto.
        </p>
        <AIAnalysisComponent categorias={categoriasCronograma} />
      </div>
    </div>
  );
}
