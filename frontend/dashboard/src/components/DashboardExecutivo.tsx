import React from 'react';
import { CategoriaCronograma, ResumoCronograma } from '../types/cronograma';
import { useTheme, useThemeClasses } from '../contexts/ThemeContext';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  ArrowRight,
  Target,
  Timer,
  Award,
  Zap,
  Activity,
  BarChart3,
  Users,
  Settings,
  Building2,
  Hammer,
  Truck,
  Cpu,
  Wrench,
  Factory,
} from 'lucide-react';

interface DashboardExecutivoProps {
  categorias: CategoriaCronograma[];
  resumo: ResumoCronograma;
  onVerDetalhes: () => void;
  onAtrasadasClick?: () => void;
  onCriticasClick?: () => void;
  onConcluidasClick?: () => void;
  onEmAndamentoClick?: () => void;
  onPendentesClick?: () => void;
}

const DashboardExecutivo: React.FC<DashboardExecutivoProps> = ({
  categorias,
  resumo,
  onVerDetalhes,
  onAtrasadasClick,
  onCriticasClick,
  onConcluidasClick,
  onEmAndamentoClick,
  onPendentesClick,
}) => {
  const { isDark } = useTheme();
  const themeClasses = useThemeClasses();

  // Debug: Log dos dados recebidos
  console.log('🔍 DashboardExecutivo - Dados recebidos:', {
    categorias: categorias?.length || 0,
    resumo: resumo ? 'presente' : 'ausente',
    categoriasDetalhadas: categorias,
    resumoDetalhado: resumo,
  });

  // Função para obter ícone específico por categoria
  const getCategoriaIcon = (nomeCategoria: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Logística: <Truck className="w-6 h-6" />,
      Refratário: <Factory className="w-6 h-6" />,
      Elétrica: <Zap className="w-6 h-6" />,
      Preparação: <Settings className="w-6 h-6" />,
      'Mecânica do Forno': <Hammer className="w-6 h-6" />,
      Barramentos: <Building2 className="w-6 h-6" />,
    };
    return iconMap[nomeCategoria] || <Activity className="w-6 h-6" />;
  };

  // Calcular métricas executivas usando dados do resumo
  const statusDados = resumo?.statusGeral;

  const atividadesAtrasadas = statusDados?.atividadesAtrasadas || 0;
  const atividadesCriticas = statusDados?.atividadesCriticas || 0;
  const atividadesEmDia = statusDados?.atividadesEmDia || 0;
  const atividadesAdiantadas = statusDados?.atividadesAdiantadas || 0;

  const atividadesConcluidas = resumo?.tarefasConcluidas || 0;
  const progressoMedio = statusDados?.progressoMedio || 0;

  // Status geral do projeto
  const getStatusGeral = () => {
    if (atividadesAtrasadas > 0) {
      return {
        status: 'ATENÇÃO',
        cor: 'text-red-600',
        bg: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
        icon: <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />,
        badge: 'bg-red-500',
      };
    }
    if (atividadesCriticas > 0) {
      return {
        status: 'CRÍTICO',
        cor: 'text-orange-600',
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
        icon: <Clock className="w-8 h-8 text-orange-600 animate-bounce" />,
        badge: 'bg-orange-500',
      };
    }
    return {
      status: 'NO PRAZO',
      cor: 'text-green-600',
      bg: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
      icon: <Award className="w-8 h-8 text-green-600" />,
      badge: 'bg-green-500',
    };
  };

  const statusGeral = getStatusGeral();

  return (
    <div className="space-y-8">
      {/* Cabeçalho Executivo com gradiente */}
      <div
        className={`
        ${
          isDark
            ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-gray-700'
            : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 border-blue-100'
        } 
        rounded-2xl ${themeClasses.shadowLg} p-8 border relative overflow-hidden
      `}
      >
        {/* Elementos decorativos de fundo */}
        <div
          className={`
          absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 -translate-y-20 translate-x-20
          ${
            isDark
              ? 'bg-gradient-to-br from-blue-800 to-purple-800'
              : 'bg-gradient-to-br from-blue-100 to-purple-100'
          }
        `}
        ></div>
        <div
          className={`
          absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-20 translate-y-16 -translate-x-16
          ${
            isDark
              ? 'bg-gradient-to-tr from-green-800 to-blue-800'
              : 'bg-gradient-to-tr from-green-100 to-blue-100'
          }
        `}
        ></div>

        <div className="text-center mb-8 relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Preparação PFUS3 2025
          </h1>
          <p className={`${themeClasses.textSecondary} text-lg`}>
            Visão Executiva do Cronograma
          </p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>

        {/* Status Principal com animação */}
        <div
          className={`${statusGeral.bg} border-2 rounded-2xl p-8 mb-8 shadow-lg relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
          <div className="flex items-center justify-center space-x-6 relative z-10">
            <div className="relative">
              {statusGeral.icon}
              <div
                className={`absolute -top-1 -right-1 w-4 h-4 ${statusGeral.badge} rounded-full animate-ping`}
              ></div>
            </div>
            <div className="text-center">
              <h2 className={`text-3xl font-bold ${statusGeral.cor} mb-1`}>
                {statusGeral.status}
              </h2>
              <p className="text-gray-600 text-sm">Status do Projeto</p>
              <div className="flex items-center justify-center mt-2">
                <div
                  className={`h-1 w-20 ${statusGeral.badge} rounded-full`}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Principais com gradientes e animações */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Progresso Geral */}
          <div
            className={`
            text-center rounded-xl p-6 border shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
            ${
              isDark
                ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700'
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
            }
          `}
          >
            <div className="relative">
              <Target className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
              {progressoMedio}%
            </div>
            <div
              className={`text-sm font-medium ${themeClasses.textSecondary}`}
            >
              Progresso Geral
            </div>
            <div
              className={`w-full rounded-full h-2 mt-3 ${isDark ? 'bg-blue-800' : 'bg-blue-200'}`}
            >
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressoMedio}%` }}
              ></div>
            </div>
          </div>

          {/* Atividades Concluídas */}
          <div
            onClick={atividadesConcluidas > 0 ? onConcluidasClick : undefined}
            className={`
            text-center rounded-xl p-6 border shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
            ${atividadesConcluidas > 0 && onConcluidasClick ? 'cursor-pointer hover:scale-105' : ''}
            ${
              isDark
                ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700'
                : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
            }
          `}
          >
            <div className="relative">
              <Award className="w-10 h-10 text-green-600 dark:text-green-400 mx-auto mb-3" />
              {atividadesConcluidas > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
              {atividadesConcluidas}
            </div>
            <div
              className={`text-sm font-medium ${themeClasses.textSecondary}`}
            >
              Concluídas
            </div>
            <div className="flex justify-center mt-2">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
          </div>

          {/* Atividades Críticas */}
          <div
            onClick={atividadesCriticas > 0 ? onCriticasClick : undefined}
            className={`
            text-center rounded-xl p-6 border shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
            ${atividadesCriticas > 0 && onCriticasClick ? 'cursor-pointer hover:scale-105' : ''}
            ${
              isDark
                ? 'bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700'
                : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
            }
          `}
          >
            <div className="relative">
              <Clock className="w-10 h-10 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
              {atividadesCriticas > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
              )}
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2">
              {atividadesCriticas}
            </div>
            <div
              className={`text-sm font-medium ${themeClasses.textSecondary}`}
            >
              Críticas
            </div>
            <div className="flex justify-center mt-2">
              <Timer className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            </div>
          </div>

          {/* Atividades Atrasadas */}
          <div
            onClick={atividadesAtrasadas > 0 ? onAtrasadasClick : undefined}
            className={`
            text-center rounded-xl p-6 border shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
            ${atividadesAtrasadas > 0 && onAtrasadasClick ? 'cursor-pointer hover:scale-105' : ''}
            ${
              isDark
                ? 'bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-700'
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
            }
          `}
          >
            <div className="relative">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400 mx-auto mb-3" />
              {atividadesAtrasadas > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2">
              {atividadesAtrasadas}
            </div>
            <div
              className={`text-sm font-medium ${themeClasses.textSecondary}`}
            >
              Atrasadas
            </div>
            <div className="flex justify-center mt-2">
              <Zap className="w-5 h-5 text-red-500 dark:text-red-400" />
            </div>
          </div>

          {/* Atividades Em Dia */}
          <div
            className={`
            text-center rounded-xl p-6 border shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
            ${
              isDark
                ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700'
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
            }
          `}
          >
            <div className="relative">
              <CheckCircle className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              {atividadesEmDia > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
              {atividadesEmDia}
            </div>
            <div
              className={`text-sm font-medium ${themeClasses.textSecondary}`}
            >
              Em Dia
            </div>
            <div className="flex justify-center mt-2">
              <Target className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
          </div>

          {/* Atividades Adiantadas */}
          <div
            className={`
            text-center rounded-xl p-6 border shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
            ${
              isDark
                ? 'bg-gradient-to-br from-cyan-900/50 to-cyan-800/50 border-cyan-700'
                : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200'
            }
          `}
          >
            <div className="relative">
              <TrendingUp className="w-10 h-10 text-cyan-600 dark:text-cyan-400 mx-auto mb-3" />
              {atividadesAdiantadas > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent mb-2">
              {atividadesAdiantadas}
            </div>
            <div
              className={`text-sm font-medium ${themeClasses.textSecondary}`}
            >
              Adiantadas
            </div>
            <div className="flex justify-center mt-2">
              <Activity className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Resumo das Atividades Principais com visual aprimorado */}
      <div
        className={`
        rounded-2xl ${themeClasses.shadowLg} p-8 border
        ${
          isDark
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-100'
        }
      `}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3
              className={`text-2xl font-semibold ${themeClasses.textPrimary}`}
            >
              Atividades Principais
            </h3>
          </div>
          <button
            onClick={onVerDetalhes}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span className="font-medium">Ver Detalhes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid gap-6">
          {categorias.map((categoria, index) => {
            const statusAtividade = categoria.statusPrazo;
            const temProblemas =
              statusAtividade &&
              (statusAtividade.atrasadas > 0 || statusAtividade.criticas > 0);

            return (
              <div
                key={categoria.nome}
                className={`
                  group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl
                  ${
                    temProblemas
                      ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:border-red-300'
                      : categoria.progresso === 100
                        ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300'
                        : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300'
                  }
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Elementos decorativos de fundo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>

                <div className="relative z-10 p-6">
                  {/* Nome e Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
                            temProblemas
                              ? 'bg-gradient-to-br from-red-500 to-red-600'
                              : categoria.progresso === 100
                                ? 'bg-gradient-to-br from-green-500 to-green-600'
                                : 'bg-gradient-to-br from-blue-500 to-blue-600'
                          }`}
                        >
                          {getCategoriaIcon(categoria.nome)}
                        </div>
                        {temProblemas && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                        {categoria.progresso === 100 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">
                          {categoria.nome}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm">
                          {statusAtividade && statusAtividade.atrasadas > 0 && (
                            <span className="flex items-center space-x-1 bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{statusAtividade.atrasadas} atrasadas</span>
                            </span>
                          )}
                          {statusAtividade && statusAtividade.criticas > 0 && (
                            <span className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                              <Clock className="w-3 h-3" />
                              <span>{statusAtividade.criticas} críticas</span>
                            </span>
                          )}
                          {categoria.progresso === 100 && (
                            <span className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              <Award className="w-3 h-3" />
                              <span>Concluída</span>
                            </span>
                          )}
                          {!temProblemas && categoria.progresso < 100 && (
                            <span className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                              <Activity className="w-3 h-3" />
                              <span>Em andamento</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progresso Circular */}
                    <div className="relative w-16 h-16">
                      <svg
                        className="w-16 h-16 transform -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-gray-200"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${Math.round(categoria.progresso)}, 100`}
                          className={`transition-all duration-1000 ${
                            categoria.progresso === 100
                              ? 'text-green-500'
                              : temProblemas
                                ? 'text-red-500'
                                : 'text-blue-500'
                          }`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`text-sm font-bold ${
                            categoria.progresso === 100
                              ? 'text-green-600'
                              : temProblemas
                                ? 'text-red-600'
                                : 'text-blue-600'
                          }`}
                        >
                          {Math.round(categoria.progresso)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progresso linear */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ease-out relative ${
                        categoria.progresso === 100
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : temProblemas
                            ? 'bg-gradient-to-r from-red-400 to-red-600'
                            : 'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}
                      style={{ width: `${Math.round(categoria.progresso)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Cronograma */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
              Cronograma
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white/50 rounded-lg p-3">
              <span className="text-gray-600 font-medium">
                Conclusão Prevista:
              </span>
              <span className="font-bold text-purple-700">
                {resumo.dataPrevistaConclusao}
              </span>
            </div>
            <div className="flex justify-between items-center bg-white/50 rounded-lg p-3">
              <span className="text-gray-600 font-medium">Dias Restantes:</span>
              <span className="font-bold text-purple-700">
                {resumo.diasRestantes} dias
              </span>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-indigo-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-700 to-indigo-600 bg-clip-text text-transparent">
              Estatísticas
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white/50 rounded-lg p-3">
              <span className="text-gray-600 font-medium">
                Total de Tarefas:
              </span>
              <span className="font-bold text-indigo-700">
                {resumo.totalTarefas}
              </span>
            </div>
            <div
              onClick={
                resumo.tarefasEmAndamento > 0 ? onEmAndamentoClick : undefined
              }
              className={`flex justify-between items-center bg-white/50 rounded-lg p-3 transition-all duration-300 ${
                resumo.tarefasEmAndamento > 0 && onEmAndamentoClick
                  ? 'cursor-pointer hover:bg-white/70 hover:scale-105'
                  : ''
              }`}
            >
              <span className="text-gray-600 font-medium">Em Andamento:</span>
              <span className="font-bold text-indigo-700">
                {resumo.tarefasEmAndamento}
              </span>
            </div>
            <div
              onClick={
                resumo.tarefasPendentes > 0 ? onPendentesClick : undefined
              }
              className={`flex justify-between items-center bg-white/50 rounded-lg p-3 transition-all duration-300 ${
                resumo.tarefasPendentes > 0 && onPendentesClick
                  ? 'cursor-pointer hover:bg-white/70 hover:scale-105'
                  : ''
              }`}
            >
              <span className="text-gray-600 font-medium">Pendentes:</span>
              <span className="font-bold text-indigo-700">
                {resumo.tarefasPendentes}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardExecutivo;
