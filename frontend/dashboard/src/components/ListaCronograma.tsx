import React, { useState } from 'react';
import { CategoriaCronograma, TarefaCronograma } from '../types/cronograma';
import TarefaCard from './TarefaCard';
import {
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  Zap,
  Circle,
  ClipboardList,
} from 'lucide-react';

interface ListaCronogramaProps {
  categorias: CategoriaCronograma[];
  onTarefaClick?: (tarefa: TarefaCronograma) => void;
  mostrarApenasAtrasadas?: boolean;
  mostrarApenasCriticas?: boolean;
  mostrarApenasConcluidas?: boolean;
  mostrarApenasEmAndamento?: boolean;
  mostrarApenasPendentes?: boolean;
  mostrarApenasEmDia?: boolean;
  onLimparFiltros?: () => void;
}

const ListaCronograma: React.FC<ListaCronogramaProps> = ({
  categorias,
  onTarefaClick,
  mostrarApenasAtrasadas = false,
  mostrarApenasCriticas = false,
  mostrarApenasConcluidas = false,
  mostrarApenasEmAndamento = false,
  mostrarApenasPendentes = false,
  mostrarApenasEmDia = false,
  onLimparFiltros,
}) => {
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Set<string>>(
    new Set()
  );
  const [filtroStatus, setFiltroStatus] = useState<
    'todos' | 'concluidas' | 'em-andamento' | 'pendentes'
  >('todos');
  const [termoBusca, setTermoBusca] = useState('');

  const toggleCategoria = (nomeCategoria: string) => {
    const novasExpandidas = new Set(categoriasExpandidas);
    if (novasExpandidas.has(nomeCategoria)) {
      novasExpandidas.delete(nomeCategoria);
    } else {
      novasExpandidas.add(nomeCategoria);
    }
    setCategoriasExpandidas(novasExpandidas);
  };

  const filtrarTarefas = (tarefas: TarefaCronograma[]) => {
    return tarefas.filter((tarefa) => {
      // Filtro por termo de busca
      const matchBusca =
        termoBusca === '' ||
        tarefa.nome.toLowerCase().includes(termoBusca.toLowerCase());

      // Filtro por status
      const matchStatus =
        filtroStatus === 'todos' ||
        (filtroStatus === 'concluidas' && tarefa.percentualCompleto === 100) ||
        (filtroStatus === 'em-andamento' &&
          tarefa.percentualCompleto > 0 &&
          tarefa.percentualCompleto < 100) ||
        (filtroStatus === 'pendentes' && tarefa.percentualCompleto === 0);

      // Filtros especiais para tipos específicos de atividades
      if (mostrarApenasAtrasadas) {
        if (tarefa.percentualCompleto === 100) return false;

        const hoje = new Date();
        const fimPrevisto = new Date(tarefa.fim);
        const fimBaseline = new Date(tarefa.fimBaseline);
        const diasParaFim = Math.ceil(
          (fimPrevisto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
        );

        const isAtrasada = diasParaFim < 0 || fimPrevisto > fimBaseline;
        return matchBusca && matchStatus && isAtrasada;
      }

      if (mostrarApenasCriticas) {
        if (tarefa.percentualCompleto === 100) return false;

        const hoje = new Date();
        const fimPrevisto = new Date(tarefa.fim);
        const diasParaFim = Math.ceil(
          (fimPrevisto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
        );

        const isCritica = diasParaFim <= 3 && diasParaFim >= 0;
        return matchBusca && matchStatus && isCritica;
      }

      if (mostrarApenasConcluidas) {
        return matchBusca && matchStatus && tarefa.percentualCompleto === 100;
      }

      if (mostrarApenasEmAndamento) {
        return (
          matchBusca &&
          matchStatus &&
          tarefa.percentualCompleto > 0 &&
          tarefa.percentualCompleto < 100
        );
      }

      if (mostrarApenasPendentes) {
        return matchBusca && matchStatus && tarefa.percentualCompleto === 0;
      }

      if (mostrarApenasEmDia) {
        if (tarefa.percentualCompleto === 100) return false;

        const hoje = new Date();
        const fimPrevisto = new Date(tarefa.fim);
        const fimBaseline = new Date(tarefa.fimBaseline);
        const diasParaFim = Math.ceil(
          (fimPrevisto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Consideramos "em dia" as tarefas que:
        // 1. Não estão atrasadas (fim previsto <= fim baseline E ainda tem tempo > 3 dias)
        // 2. Ou ainda tem mais de 3 dias para terminar
        const isEmDia =
          (fimPrevisto <= fimBaseline && diasParaFim > 3) || diasParaFim > 3;
        return matchBusca && matchStatus && isEmDia;
      }

      return matchBusca && matchStatus;
    });
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100/30 to-blue-100/30 rounded-full translate-y-24 -translate-x-24"></div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                mostrarApenasAtrasadas
                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                  : mostrarApenasCriticas
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                    : mostrarApenasConcluidas
                      ? 'bg-gradient-to-br from-green-500 to-green-600'
                      : mostrarApenasEmAndamento
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : mostrarApenasPendentes
                          ? 'bg-gradient-to-br from-gray-500 to-gray-600'
                          : mostrarApenasEmDia
                            ? 'bg-gradient-to-br from-green-400 to-green-500'
                            : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}
            >
              {mostrarApenasAtrasadas ? (
                <AlertTriangle className="w-6 h-6 text-white" />
              ) : mostrarApenasCriticas ? (
                <Clock className="w-6 h-6 text-white" />
              ) : mostrarApenasConcluidas ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : mostrarApenasEmAndamento ? (
                <Activity className="w-6 h-6 text-white" />
              ) : mostrarApenasPendentes ? (
                <Circle className="w-6 h-6 text-white" />
              ) : mostrarApenasEmDia ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <BarChart3 className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {mostrarApenasAtrasadas
                  ? 'Atividades Atrasadas'
                  : mostrarApenasCriticas
                    ? 'Atividades Críticas'
                    : mostrarApenasConcluidas
                      ? 'Atividades Concluídas'
                      : mostrarApenasEmAndamento
                        ? 'Atividades em Andamento'
                        : mostrarApenasPendentes
                          ? 'Atividades Pendentes'
                          : mostrarApenasEmDia
                            ? 'Atividades Em Dia'
                            : 'Cronograma de Preparação'}
              </h2>
              <p className="text-gray-600">
                {mostrarApenasAtrasadas
                  ? 'Atividades que ultrapassaram o prazo'
                  : mostrarApenasCriticas
                    ? 'Atividades próximas do prazo (3 dias ou menos)'
                    : mostrarApenasConcluidas
                      ? 'Atividades já finalizadas'
                      : mostrarApenasEmAndamento
                        ? 'Atividades em execução'
                        : mostrarApenasPendentes
                          ? 'Atividades aguardando início'
                          : mostrarApenasEmDia
                            ? 'Atividades com cronograma adequado'
                            : 'Visualização detalhada das atividades'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Busca com design aprimorado */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>

            {/* Filtro por Status com design aprimorado */}
            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
              <select
                className="pl-10 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
              >
                <option value="todos">Todas</option>
                <option value="concluidas">Concluídas</option>
                <option value="em-andamento">Em Andamento</option>
                <option value="pendentes">Pendentes</option>
              </select>
            </div>
          </div>

          {/* Botão para limpar filtros especiais */}
          {(mostrarApenasAtrasadas ||
            mostrarApenasCriticas ||
            mostrarApenasConcluidas ||
            mostrarApenasEmAndamento ||
            mostrarApenasPendentes ||
            mostrarApenasEmDia) &&
            onLimparFiltros && (
              <button
                onClick={onLimparFiltros}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Limpar Filtros</span>
              </button>
            )}
        </div>

        <div className="space-y-6">
          {categorias.map((categoria, index) => {
            const tarefasFiltradas = filtrarTarefas(categoria.tarefas);
            const isExpandida = categoriasExpandidas.has(categoria.nome);

            if (tarefasFiltradas.length === 0) return null;

            return (
              <div
                key={categoria.nome}
                className="border-2 border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 bg-white/60 backdrop-blur-sm"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Cabeçalho da Categoria com visual aprimorado */}
                <div
                  className="bg-gradient-to-r from-gray-50 via-white to-gray-50 p-6 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:via-white hover:to-purple-50 transition-all duration-300 relative overflow-hidden group"
                  onClick={() => toggleCategoria(categoria.nome)}
                >
                  {/* Elemento decorativo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          {isExpandida ? (
                            <ChevronDown className="w-6 h-6 text-blue-600 transition-transform duration-300" />
                          ) : (
                            <ChevronRight className="w-6 h-6 text-gray-600 transition-transform duration-300" />
                          )}
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full ${categoria.cor} shadow-md`}
                        />
                        <div>
                          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            {categoria.nome}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium">
                            {tarefasFiltradas.length} tarefa
                            {tarefasFiltradas.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Status da categoria com badges melhorados */}
                        {categoria.statusPrazo && (
                          <div className="flex items-center space-x-2 text-xs">
                            {categoria.statusPrazo.atrasadas > 0 && (
                              <div className="flex items-center space-x-1 bg-gradient-to-r from-red-100 to-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 shadow-sm">
                                <AlertTriangle className="w-3 h-3" />
                                <span className="font-semibold">
                                  {categoria.statusPrazo.atrasadas} atrasadas
                                </span>
                              </div>
                            )}
                            {categoria.statusPrazo.criticas > 0 && (
                              <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200 shadow-sm">
                                <Clock className="w-3 h-3" />
                                <span className="font-semibold">
                                  {categoria.statusPrazo.criticas} críticas
                                </span>
                              </div>
                            )}
                            {categoria.statusPrazo.adiantadas > 0 && (
                              <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                                <TrendingUp className="w-3 h-3" />
                                <span className="font-semibold">
                                  {categoria.statusPrazo.adiantadas} adiantadas
                                </span>
                              </div>
                            )}
                            {categoria.statusPrazo.concluidas > 0 && (
                              <div className="flex items-center space-x-1 bg-gradient-to-r from-green-100 to-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 shadow-sm">
                                <CheckCircle className="w-3 h-3" />
                                <span className="font-semibold">
                                  {categoria.statusPrazo.concluidas} concluídas
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Progresso com design circular */}
                        <div className="flex items-center space-x-4">
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
                                    : categoria.progresso >= 70
                                      ? 'text-blue-500'
                                      : categoria.progresso >= 40
                                        ? 'text-yellow-500'
                                        : 'text-red-500'
                                }`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-700">
                                {Math.round(categoria.progresso)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de Tarefas com melhor espaçamento */}
                {isExpandida && (
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                    <div className="space-y-4">
                      {tarefasFiltradas.map((tarefa, tarefaIndex) => (
                        <div
                          key={tarefa.id}
                          style={{
                            animationDelay: `${tarefaIndex * 50}ms`,
                          }}
                        >
                          <TarefaCard tarefa={tarefa} onClick={onTarefaClick} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ListaCronograma;
