import React from 'react';

interface CronogramaViewProps {
  resumoCronograma: any;
}

export default function CronogramaView({
  resumoCronograma,
}: CronogramaViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          📅 Cronograma Operacional
        </h1>
        {resumoCronograma ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400 text-lg">
                ✅
              </span>
              <p className="text-green-800 dark:text-green-200 font-medium">
                Cronograma carregado com sucesso!
              </p>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              Dados disponíveis para análise e visualização.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8">
              <span className="text-gray-400 dark:text-gray-500 text-4xl mb-4 block">
                📋
              </span>
              <p className="text-gray-500 dark:text-gray-400 mb-4 font-medium">
                Nenhum cronograma carregado
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Faça o upload de um arquivo de cronograma na seção de Upload
                para começar.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
