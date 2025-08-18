import React from 'react';
import { TarefaCronograma } from '../types/cronograma';
import { useThemeClasses } from '../contexts/ThemeContext';
import { formatDuracao, formatDate } from '../utils/formatters';
import {
  X,
  Calendar,
  Clock,
  Target,
  Activity,
  CheckCircle,
  AlertTriangle,
  Timer,
  Users,
  TrendingUp,
  Flag,
} from 'lucide-react';

interface TarefaDetailModalProps {
  tarefa: TarefaCronograma;
  isOpen: boolean;
  onClose: () => void;
}

const TarefaDetailModal: React.FC<TarefaDetailModalProps> = ({
  tarefa,
  isOpen,
  onClose,
}) => {
  const themeClasses = useThemeClasses();

  if (!isOpen) return null;

  const getStatusPrazo = () => {
    if (tarefa.percentualCompleto === 100) {
      return { status: 'concluida', label: 'Concluída', color: 'green' };
    }

    const hoje = new Date();
    const fimPrevisto = new Date(tarefa.fim);
    const fimBaseline = new Date(tarefa.fimBaseline);
    const diasParaFim = Math.ceil(
      (fimPrevisto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diasParaFim <= 3 && diasParaFim >= 0) {
      return { status: 'critica', label: 'Crítica', color: 'orange' };
    } else if (diasParaFim < 0 || fimPrevisto > fimBaseline) {
      return { status: 'atrasada', label: 'Atrasada', color: 'red' };
    } else if (fimPrevisto < fimBaseline) {
      return { status: 'adiantada', label: 'Adiantada', color: 'blue' };
    } else {
      return { status: 'emDia', label: 'Em dia', color: 'green' };
    }
  };

  const statusPrazo = getStatusPrazo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`relative max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto ${themeClasses.card} rounded-2xl shadow-2xl`}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
          <div>
            <h2 className={`text-2xl font-bold ${themeClasses.textPrimary}`}>
              Detalhes da Tarefa
            </h2>
            <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
              ID: {tarefa.id} • Nível: {tarefa.nivel}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:${themeClasses.bgSecondary} transition-colors`}
          >
            <X className={`w-6 h-6 ${themeClasses.textSecondary}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Título e Status */}
          <div>
            <h3
              className={`text-xl font-semibold mb-3 ${themeClasses.textPrimary}`}
            >
              {tarefa.nome}
            </h3>
            <div className="flex items-center space-x-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusPrazo.color === 'green'
                    ? 'bg-green-100 text-green-800'
                    : statusPrazo.color === 'orange'
                      ? 'bg-orange-100 text-orange-800'
                      : statusPrazo.color === 'red'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                }`}
              >
                {statusPrazo.label}
              </span>
              <span className={`text-sm ${themeClasses.textSecondary}`}>
                {tarefa.categoria}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className={`${themeClasses.bgSecondary} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${themeClasses.textPrimary}`}>
                Progresso Geral
              </span>
              <span className={`text-lg font-bold ${themeClasses.textPrimary}`}>
                {tarefa.percentualCompleto}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${tarefa.percentualCompleto}%` }}
              />
            </div>
          </div>

          {/* Datas Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Início */}
            <div className={`${themeClasses.bgSecondary} rounded-xl p-4`}>
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="w-5 h-5 text-green-500" />
                <span className={`font-medium ${themeClasses.textPrimary}`}>
                  Data de Início
                </span>
              </div>
              <div className="space-y-1">
                <p className={`text-lg font-bold ${themeClasses.textPrimary}`}>
                  {formatDate(tarefa.inicio)}
                </p>
                {tarefa.inicioReal && (
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    Real: {formatDate(tarefa.inicioReal)}
                  </p>
                )}
              </div>
            </div>

            {/* Fim */}
            <div className={`${themeClasses.bgSecondary} rounded-xl p-4`}>
              <div className="flex items-center space-x-3 mb-2">
                <Flag className="w-5 h-5 text-red-500" />
                <span className={`font-medium ${themeClasses.textPrimary}`}>
                  Data de Fim
                </span>
              </div>
              <div className="space-y-1">
                <p className={`text-lg font-bold ${themeClasses.textPrimary}`}>
                  {formatDate(tarefa.fim)}
                </p>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Planejado: {formatDate(tarefa.fimBaseline)}
                </p>
                {tarefa.fimReal && (
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    Real: {formatDate(tarefa.fimReal)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid md:grid-cols-3 gap-4">
            <div
              className={`${themeClasses.bgSecondary} rounded-xl p-4 text-center`}
            >
              <Timer className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className={`text-sm ${themeClasses.textSecondary}`}>Duração</p>
              <p className={`text-lg font-bold ${themeClasses.textPrimary}`}>
                {formatDuracao(tarefa.duracao)}
              </p>
            </div>

            <div
              className={`${themeClasses.bgSecondary} rounded-xl p-4 text-center`}
            >
              <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                % Físico
              </p>
              <p className={`text-lg font-bold ${themeClasses.textPrimary}`}>
                {tarefa.percentualFisico}%
              </p>
            </div>

            <div
              className={`${themeClasses.bgSecondary} rounded-xl p-4 text-center`}
            >
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                % Previsto
              </p>
              <p className={`text-lg font-bold ${themeClasses.textPrimary}`}>
                {tarefa.percentualReplanejamento}%
              </p>
            </div>
          </div>

          {/* Subatividades */}
          {tarefa.subatividades && tarefa.subatividades.length > 0 && (
            <div>
              <h4
                className={`text-lg font-semibold mb-3 ${themeClasses.textPrimary}`}
              >
                Subatividades ({tarefa.subatividades.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tarefa.subatividades.map((sub) => (
                  <div
                    key={sub.id}
                    className={`${themeClasses.bgSecondary} rounded-lg p-3 border-l-4 ${
                      sub.percentualCompleto === 100
                        ? 'border-green-500'
                        : sub.percentualCompleto > 50
                          ? 'border-yellow-500'
                          : 'border-red-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium ${themeClasses.textPrimary}`}
                      >
                        {sub.nome}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          sub.percentualCompleto === 100
                            ? 'text-green-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {sub.percentualCompleto}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full ${
                          sub.percentualCompleto === 100
                            ? 'bg-green-500'
                            : sub.percentualCompleto > 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${sub.percentualCompleto}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predecessores */}
          {tarefa.predecessores && (
            <div>
              <h4
                className={`text-lg font-semibold mb-3 ${themeClasses.textPrimary}`}
              >
                Dependências
              </h4>
              <div className={`${themeClasses.bgSecondary} rounded-xl p-4`}>
                <p className={`${themeClasses.textSecondary}`}>
                  <strong>Predecessores:</strong> {tarefa.predecessores}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TarefaDetailModal;
