import React from 'react';

interface OperationalDataSectionProps {
  operacionalData: any;
}

export default function OperationalDataSection({
  operacionalData,
}: OperationalDataSectionProps) {
  if (!operacionalData) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        📊 Dados Operacionais
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(operacionalData).map(([fase, dados]: [string, any]) => (
          <div
            key={fase}
            className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
          >
            <h3 className="font-semibold capitalize text-gray-800 dark:text-white mb-2">
              {fase}
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Atividades:</span>{' '}
                {Array.isArray(dados) ? dados.length : 0}
              </p>
              {Array.isArray(dados) && dados.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p>Última atualização: {new Date().toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
