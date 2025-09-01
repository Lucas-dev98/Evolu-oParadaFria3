import React from 'react';
import CPMAnalysis from './CPMAnalysisReal';
import { CategoriaCronograma } from '../types/cronograma';

interface CPMViewProps {
  categoriasCronograma: CategoriaCronograma[];
}

export default function CPMView({ categoriasCronograma }: CPMViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          🔗 Análise CPM
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Análise do Caminho Crítico para otimização de cronograma.
        </p>
        <CPMAnalysis categorias={categoriasCronograma} />
      </div>
    </div>
  );
}
