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
} from 'lucide-react';

interface ListaCronogramaProps {
  categorias: CategoriaCronograma[];
  onTarefaClick?: (tarefa: TarefaCronograma) => void;
}

const ListaCronograma: React.FC<ListaCronogramaProps> = ({
  categorias,
  onTarefaClick,
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Cronograma de Preparação
              </h2>
              <p className="text-gray-600">
                Visualização detalhada das atividades
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
