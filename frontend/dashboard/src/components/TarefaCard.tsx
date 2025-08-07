import React, { useState } from 'react';
import { TarefaCronograma } from '../types/cronograma';
import { useThemeClasses } from '../contexts/ThemeContext';
import { formatDuracao } from '../utils/formatters';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Timer,
  Target,
  Activity,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface TarefaCardProps {
  tarefa: TarefaCronograma;
  onClick?: (tarefa: TarefaCronograma) => void;
  level?: number; // Nível de indentação para hierarquia
}

const TarefaCard: React.FC<TarefaCardProps> = ({
  tarefa,
  onClick,
  level = 0,
}) => {
  const themeClasses = useThemeClasses();
  const [expanded, setExpanded] = useState(false);
  const hasSubatividades =
    tarefa.subatividades && tarefa.subatividades.length > 0;
  const getStatusColor = (percentual: number) => {
    if (percentual === 100) return 'from-green-400 to-green-600';
    if (percentual > 50) return 'from-yellow-400 to-orange-500';
    if (percentual > 0) return 'from-blue-400 to-blue-600';
    return 'from-gray-400 to-gray-500';
  };

  const getStatusIcon = (percentual: number) => {
    if (percentual === 100)
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (percentual > 0) return <Activity className="w-5 h-5 text-blue-600" />;
    return <Timer className="w-5 h-5 text-gray-600" />;
  };

  const getBorderColor = (percentual: number) => {
    if (percentual === 100) return 'border-l-green-500';
    if (percentual > 50) return 'border-l-yellow-500';
    if (percentual > 0) return 'border-l-blue-500';
    return 'border-l-gray-400';
  };

  const getNivelIndentation = (nivel: number) => {
    return `ml-${Math.min((nivel + level) * 4, 20)}`;
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const isAtrasada = () => {
    const hoje = new Date();
    const fimPrevisto = new Date(tarefa.fim);
    return hoje > fimPrevisto && tarefa.percentualCompleto < 100;
  };

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

    // Crítica: menos de 3 dias para o fim
    if (diasParaFim <= 3 && diasParaFim >= 0) {
      return { status: 'critica', label: 'Crítica', color: 'orange' };
    }
    // Atrasada: data fim já passou ou fim previsto > baseline
    else if (diasParaFim < 0 || fimPrevisto > fimBaseline) {
      return { status: 'atrasada', label: 'Atrasada', color: 'red' };
    }
    // Adiantada: fim previsto < baseline
    else if (fimPrevisto < fimBaseline) {
      return { status: 'adiantada', label: 'Adiantada', color: 'blue' };
    }
    // Em dia: dentro do prazo baseline
    else {
      return { status: 'emDia', label: 'Em dia', color: 'green' };
    }
  };

  const statusPrazo = getStatusPrazo();

  return (
    <div
      className={`
        group relative overflow-hidden ${themeClasses.card} rounded-xl shadow-lg border-l-4 p-6 cursor-pointer
        transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] transform-gpu
        ${getBorderColor(tarefa.percentualCompleto)}
        ${getNivelIndentation(tarefa.nivel)}
        ${themeClasses.cardHover}
        ${isAtrasada() ? `${themeClasses.error} border-l-red-500` : ''}
      `}
      onClick={() => onClick?.(tarefa)}
    >
      {/* Elemento decorativo de fundo */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700`}
      ></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Botão de expansão para subatividades */}
            {hasSubatividades && (
              <button
                onClick={toggleExpanded}
                className={`p-1 rounded ${themeClasses.bgTertiary} hover:${themeClasses.bgSecondary} transition-colors`}
                aria-label={
                  expanded ? 'Recolher subatividades' : 'Expandir subatividades'
                }
              >
                {expanded ? (
                  <ChevronDown
                    className={`w-4 h-4 ${themeClasses.textSecondary}`}
                  />
                ) : (
                  <ChevronRight
                    className={`w-4 h-4 ${themeClasses.textSecondary}`}
                  />
                )}
              </button>
            )}
            <div className="relative">
              {getStatusIcon(tarefa.percentualCompleto)}
              {tarefa.percentualCompleto === 100 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <h3
                className={`font-bold ${themeClasses.textPrimary} ${tarefa.nivel === 0 ? 'text-lg' : 'text-base'} group-hover:text-blue-700 transition-colors`}
              >
                {tarefa.nome}
                {hasSubatividades && (
                  <span
                    className={`ml-2 text-xs ${themeClasses.textTertiary} ${themeClasses.bgTertiary} px-2 py-1 rounded-full`}
                  >
                    {tarefa.subatividades!.length} subatividade
                    {tarefa.subatividades!.length > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              {tarefa.nivel > 0 && (
                <p
                  className={`text-xs ${themeClasses.textTertiary} font-medium`}
                >
                  Subtarefa • Nível {tarefa.nivel}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Badge de status de prazo aprimorado */}
            <span
              className={`
              relative px-3 py-1 rounded-full text-xs font-bold shadow-md border
              ${
                statusPrazo.color === 'green'
                  ? themeClasses.success
                  : statusPrazo.color === 'blue'
                    ? themeClasses.info
                    : statusPrazo.color === 'orange'
                      ? themeClasses.warning
                      : themeClasses.error
              }
            `}
            >
              {statusPrazo.label}
              {(statusPrazo.status === 'atrasada' ||
                statusPrazo.status === 'critica') && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
              )}
            </span>

            {/* Badge de progresso circular */}
            <div className="relative">
              <div className="w-12 h-12 relative">
                <svg
                  className="w-12 h-12 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className={themeClasses.textTertiary}
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${tarefa.percentualCompleto}, 100`}
                    className={`transition-all duration-1000 ${
                      tarefa.percentualCompleto === 100
                        ? 'text-green-500'
                        : tarefa.percentualCompleto > 50
                          ? 'text-yellow-500'
                          : tarefa.percentualCompleto > 0
                            ? 'text-blue-500'
                            : 'text-gray-400'
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-xs font-bold ${themeClasses.textPrimary}`}
                  >
                    {tarefa.percentualCompleto}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progresso linear aprimorada */}
        <div className="mb-4">
          <div
            className={`w-full ${themeClasses.bgTertiary} rounded-full h-3 overflow-hidden`}
          >
            <div
              className={`h-3 rounded-full bg-gradient-to-r ${getStatusColor(tarefa.percentualCompleto)} transition-all duration-1000 ease-out relative`}
              style={{ width: `${tarefa.percentualCompleto}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Informações de data e duração em cards */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div
            className={`${themeClasses.bgSecondary} backdrop-blur-sm rounded-lg p-3 border ${themeClasses.border}`}
          >
            <div
              className={`flex items-center space-x-2 ${themeClasses.textSecondary}`}
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              <div>
                <p
                  className={`text-xs font-semibold ${themeClasses.textTertiary} uppercase`}
                >
                  Início
                </p>
                <p className={`font-bold ${themeClasses.textPrimary}`}>
                  {new Date(tarefa.inicio).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Fim
                </p>
                <p className="font-bold text-gray-800">
                  {new Date(tarefa.fim).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 text-gray-600">
              <Timer className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Duração
                </p>
                <p className="font-bold text-gray-800">
                  {formatDuracao(tarefa.duracao)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 text-gray-400">
              <Target className="w-4 h-4" />
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">
                  Baseline
                </p>
                <p className="font-bold text-gray-500">
                  {new Date(tarefa.fimBaseline).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas baseados no status com visual aprimorado */}
        {statusPrazo.status === 'atrasada' && (
          <div className="bg-gradient-to-r from-red-100 to-red-50 border border-red-300 rounded-xl p-4 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-red-800 text-sm font-bold block">
                  Tarefa Atrasada
                </span>
                <span className="text-red-600 text-xs">
                  Requer atenção imediata
                </span>
              </div>
            </div>
          </div>
        )}

        {statusPrazo.status === 'critica' && (
          <div className="bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-300 rounded-xl p-4 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-orange-800 text-sm font-bold block">
                  Tarefa Crítica
                </span>
                <span className="text-orange-600 text-xs">
                  Prazo próximo ao vencimento
                </span>
              </div>
            </div>
          </div>
        )}

        {statusPrazo.status === 'adiantada' && (
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-300 rounded-xl p-4 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-blue-800 text-sm font-bold block">
                  Tarefa Adiantada
                </span>
                <span className="text-blue-600 text-xs">
                  Adiantada em relação ao baseline
                </span>
              </div>
            </div>
          </div>
        )}

        {tarefa.percentualCompleto === 100 && (
          <div className="bg-gradient-to-r from-green-100 to-green-50 border border-green-300 rounded-xl p-4 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-green-800 text-sm font-bold block">
                  Tarefa Concluída
                </span>
                <span className="text-green-600 text-xs">
                  Parabéns! Tarefa finalizada com sucesso
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Renderização das subatividades com tema */}
      {hasSubatividades && expanded && (
        <div className={`mt-4 pl-6 border-l-2 ${themeClasses.border}`}>
          <div className="space-y-3">
            <h4
              className={`text-sm font-semibold ${themeClasses.textPrimary} mb-3 flex items-center`}
            >
              <Activity
                className={`w-4 h-4 mr-2 ${themeClasses.textSecondary}`}
              />
              Subatividades ({tarefa.subatividades!.length})
            </h4>
            <div className="space-y-2">
              {tarefa.subatividades!.map((subatividade, index) => (
                <div
                  key={subatividade.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TarefaCard
                    tarefa={subatividade}
                    onClick={onClick}
                    level={level + 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarefaCard;
