import React, { useState, useEffect } from 'react';
import { TarefaCronograma, CategoriaCronograma } from '../types/cronograma';
import { useThemeClasses } from '../contexts/ThemeContext';
import {
  Route,
  AlertTriangle,
  Clock,
  ArrowRight,
  Calendar,
  Target,
  Zap,
} from 'lucide-react';

interface CPMAnalysisRealProps {
  categorias: CategoriaCronograma[];
  onTarefaClick?: (tarefa: TarefaCronograma) => void;
}

interface DependenciaParsed {
  id: string;
  tipo: 'FS' | 'SS' | 'FF' | 'SF'; // Finish-to-Start, Start-to-Start, etc.
  lag: number; // em dias
}

interface TarefaCPM {
  tarefa: TarefaCronograma;
  inicioMaisEdo: Date;
  fimMaisEdo: Date;
  inicioMaisTarde: Date;
  fimMaisTarde: Date;
  folga: number;
  ehCritica: boolean;
  dependencias: DependenciaParsed[];
}

interface CaminhosCriticos {
  sequencias: TarefaCPM[][];
  duracaoTotal: number;
  margemSeguranca: number;
}

const CPMAnalysisReal: React.FC<CPMAnalysisRealProps> = ({
  categorias,
  onTarefaClick,
}) => {
  const themeClasses = useThemeClasses();
  const [tarefasCPM, setTarefasCPM] = useState<TarefaCPM[]>([]);
  const [caminhosCriticos, setCaminhosCriticos] =
    useState<CaminhosCriticos | null>(null);
  const [isCalculando, setIsCalculando] = useState(false);
  const [tarefasProblematicas, setTarefasProblematicas] = useState<TarefaCPM[]>(
    []
  );

  useEffect(() => {
    if (categorias && categorias.length > 0) {
      calcularCPM();
    }
  }, [categorias]);

  const obterTodasTarefas = (): TarefaCronograma[] => {
    try {
      const todas: TarefaCronograma[] = [];

      if (!categorias || categorias.length === 0) {
        console.warn('⚠️ Nenhuma categoria encontrada para CPM');
        return [];
      }

      categorias.forEach((categoria) => {
        if (categoria.tarefas && categoria.tarefas.length > 0) {
          categoria.tarefas.forEach((tarefa) => {
            // Validar se a tarefa tem os campos necessários
            if (
              tarefa &&
              tarefa.id &&
              tarefa.nome &&
              tarefa.duracao &&
              tarefa.inicio &&
              tarefa.fim
            ) {
              todas.push(tarefa);
              if (tarefa.subatividades) {
                todas.push(...tarefa.subatividades);
              }
            }
          });
        }
      });

      console.log('📋 CPM processou', todas.length, 'tarefas válidas');
      return todas.filter((t) => t.duracao && t.inicio && t.fim);
    } catch (error) {
      console.error('❌ Erro ao obter tarefas para CPM:', error);
      return [];
    }
  };

  const parseDependencias = (predecessores: string): DependenciaParsed[] => {
    if (!predecessores || predecessores.trim() === '') return [];

    const deps: DependenciaParsed[] = [];
    const partes = predecessores.split(';').map((p) => p.trim());

    partes.forEach((parte) => {
      if (!parte) return;

      // Exemplo de formats: "3SS+102.86 days", "210;219", "222SS", "215SS"
      let match = parte.match(
        /^(\d+)(SS|FS|FF|SF)?([+-]?\d*\.?\d*)\s*(days?)?$/i
      );

      if (match) {
        const id = match[1];
        const tipo = (match[2] || 'FS') as 'FS' | 'SS' | 'FF' | 'SF';
        const lagStr = match[3] || '0';
        const lag = parseFloat(lagStr) || 0;

        deps.push({ id, tipo, lag });
      } else {
        // Formato simples: apenas ID
        const simpleId = parte.match(/^\d+$/);
        if (simpleId) {
          deps.push({ id: simpleId[0], tipo: 'FS', lag: 0 });
        }
      }
    });

    return deps;
  };

  const calcularDuracao = (tarefa: TarefaCronograma): number => {
    try {
      // Extrai duração em dias de strings como "100 hrs", "5 days", "2656 hrs"
      const durStr = tarefa.duracao || '1 day';

      // Buscar por horas
      const hoursMatch = durStr.match(/(\d+(?:\.\d+)?)\s*hrs?/i);
      if (hoursMatch) {
        const horas = parseFloat(hoursMatch[1]);
        return Math.max(1, Math.ceil(horas / 8)); // Mínimo 1 dia, 8 horas = 1 dia
      }

      // Buscar por dias
      const daysMatch = durStr.match(/(\d+(?:\.\d+)?)\s*(e?days?)/i);
      if (daysMatch) {
        return Math.max(1, Math.ceil(parseFloat(daysMatch[1])));
      }

      // Fallback: usar diferença entre datas
      const inicio = new Date(tarefa.inicio);
      const fim = new Date(tarefa.fim);

      if (!isNaN(inicio.getTime()) && !isNaN(fim.getTime())) {
        const diffDays = Math.ceil(
          (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
        );
        return Math.max(1, diffDays);
      }

      return 1; // Fallback mínimo
    } catch (error) {
      console.error('❌ Erro ao calcular duração:', error, tarefa);
      return 1;
    }
  };

  const executarCalculoCPM = (): TarefaCPM[] => {
    const todas = obterTodasTarefas();
    const mapaTarefas = new Map<string, TarefaCronograma>();

    // Criar mapa de tarefas por ID
    todas.forEach((t) => mapaTarefas.set(t.id.toString(), t));

    const tarefasCPMCalc: TarefaCPM[] = todas.map((tarefa) => {
      const dependencias = parseDependencias(tarefa.predecessores || '');
      const duracao = calcularDuracao(tarefa);
      const inicioReal = new Date(tarefa.inicio);

      return {
        tarefa,
        inicioMaisEdo: inicioReal,
        fimMaisEdo: new Date(
          inicioReal.getTime() + duracao * 24 * 60 * 60 * 1000
        ),
        inicioMaisTarde: inicioReal,
        fimMaisTarde: new Date(tarefa.fim),
        folga: 0,
        ehCritica: false,
        dependencias,
      };
    });

    // Forward Pass - Calcular datas mais cedo possível
    let alteracoes = true;
    let iteracoes = 0;
    const maxIteracoes = 1000; // Proteção contra loop infinito

    while (alteracoes && iteracoes < maxIteracoes) {
      iteracoes++;
      alteracoes = false;

      tarefasCPMCalc.forEach((tarefaCPM) => {
        let novoInicioMaisEdo = new Date(tarefaCPM.tarefa.inicio);

        // Verificar todas as dependências
        tarefaCPM.dependencias.forEach((dep) => {
          const predecessora = tarefasCPMCalc.find(
            (t) => t.tarefa.id.toString() === dep.id
          );
          if (predecessora) {
            let dataRef: Date;

            switch (dep.tipo) {
              case 'SS': // Start-to-Start
                dataRef = new Date(
                  predecessora.inicioMaisEdo.getTime() +
                    dep.lag * 24 * 60 * 60 * 1000
                );
                break;
              case 'FF': // Finish-to-Finish
                dataRef = new Date(
                  predecessora.fimMaisEdo.getTime() +
                    dep.lag * 24 * 60 * 60 * 1000
                );
                dataRef = new Date(
                  dataRef.getTime() -
                    calcularDuracao(tarefaCPM.tarefa) * 24 * 60 * 60 * 1000
                );
                break;
              case 'SF': // Start-to-Finish
                dataRef = new Date(
                  predecessora.inicioMaisEdo.getTime() +
                    dep.lag * 24 * 60 * 60 * 1000
                );
                dataRef = new Date(
                  dataRef.getTime() -
                    calcularDuracao(tarefaCPM.tarefa) * 24 * 60 * 60 * 1000
                );
                break;
              default: // FS - Finish-to-Start
                dataRef = new Date(
                  predecessora.fimMaisEdo.getTime() +
                    dep.lag * 24 * 60 * 60 * 1000
                );
            }

            if (dataRef > novoInicioMaisEdo) {
              novoInicioMaisEdo = dataRef;
            }
          }
        });

        if (novoInicioMaisEdo.getTime() !== tarefaCPM.inicioMaisEdo.getTime()) {
          tarefaCPM.inicioMaisEdo = novoInicioMaisEdo;
          tarefaCPM.fimMaisEdo = new Date(
            novoInicioMaisEdo.getTime() +
              calcularDuracao(tarefaCPM.tarefa) * 24 * 60 * 60 * 1000
          );
          alteracoes = true;
        }
      });
    }

    if (iteracoes >= maxIteracoes) {
      console.warn(
        '⚠️ Forward pass atingiu limite de iterações:',
        maxIteracoes
      );
    } else {
      console.log('✅ Forward pass concluído em', iteracoes, 'iterações');
    }

    // Backward Pass - Calcular datas mais tarde possível
    const dataFinalProjeto = new Date(
      Math.max(
        ...tarefasCPMCalc.map((t) => t.fimMaisEdo.getTime()),
        ...todas.map((t) => new Date(t.fim).getTime())
      )
    );

    console.log(
      '📅 Data final do projeto PFUS3:',
      dataFinalProjeto.toLocaleDateString('pt-BR')
    );

    // Inicializar todas as tarefas com a data final
    tarefasCPMCalc.forEach((tarefaCPM) => {
      const duracao = calcularDuracao(tarefaCPM.tarefa);
      tarefaCPM.fimMaisTarde = dataFinalProjeto;
      tarefaCPM.inicioMaisTarde = new Date(
        dataFinalProjeto.getTime() - duracao * 24 * 60 * 60 * 1000
      );
    });

    // Calcular backward pass com dependências
    alteracoes = true;
    iteracoes = 0; // Reset contador

    while (alteracoes && iteracoes < maxIteracoes) {
      iteracoes++;
      alteracoes = false;

      tarefasCPMCalc.forEach((tarefaCPM) => {
        // Encontrar sucessoras desta tarefa
        const sucessoras = tarefasCPMCalc.filter((outra) =>
          outra.dependencias.some(
            (dep) => dep.id === tarefaCPM.tarefa.id.toString()
          )
        );

        let novoFimMaisTarde = new Date(tarefaCPM.tarefa.fim);

        sucessoras.forEach((sucessora) => {
          const dep = sucessora.dependencias.find(
            (d) => d.id === tarefaCPM.tarefa.id.toString()
          )!;
          let dataRef: Date;

          switch (dep.tipo) {
            case 'SS': // Start-to-Start
              dataRef = new Date(
                sucessora.inicioMaisTarde.getTime() -
                  dep.lag * 24 * 60 * 60 * 1000
              );
              dataRef = new Date(
                dataRef.getTime() +
                  calcularDuracao(tarefaCPM.tarefa) * 24 * 60 * 60 * 1000
              );
              break;
            case 'FF': // Finish-to-Finish
              dataRef = new Date(
                sucessora.fimMaisTarde.getTime() - dep.lag * 24 * 60 * 60 * 1000
              );
              break;
            case 'SF': // Start-to-Finish
              dataRef = new Date(
                sucessora.inicioMaisTarde.getTime() -
                  dep.lag * 24 * 60 * 60 * 1000
              );
              break;
            default: // FS - Finish-to-Start
              dataRef = new Date(
                sucessora.inicioMaisTarde.getTime() -
                  dep.lag * 24 * 60 * 60 * 1000
              );
          }

          if (dataRef < novoFimMaisTarde) {
            novoFimMaisTarde = dataRef;
          }
        });

        if (novoFimMaisTarde.getTime() !== tarefaCPM.fimMaisTarde.getTime()) {
          tarefaCPM.fimMaisTarde = novoFimMaisTarde;
          tarefaCPM.inicioMaisTarde = new Date(
            novoFimMaisTarde.getTime() -
              calcularDuracao(tarefaCPM.tarefa) * 24 * 60 * 60 * 1000
          );
          alteracoes = true;
        }
      });
    }

    if (iteracoes >= maxIteracoes) {
      console.warn(
        '⚠️ Backward pass atingiu limite de iterações:',
        maxIteracoes
      );
    } else {
      console.log('✅ Backward pass concluído em', iteracoes, 'iterações');
    }

    // Calcular folgas e identificar caminho crítico
    tarefasCPMCalc.forEach((tarefaCPM) => {
      const folgaTempo = Math.round(
        (tarefaCPM.fimMaisTarde.getTime() - tarefaCPM.fimMaisEdo.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      tarefaCPM.folga = folgaTempo;
      tarefaCPM.ehCritica = folgaTempo <= 0; // Crítica se folga <= 0
    });

    return tarefasCPMCalc.sort((a, b) => a.folga - b.folga);
  };

  const calcularCPM = async () => {
    setIsCalculando(true);

    try {
      console.log('🔄 Calculando CPM para PFUS3...');

      // Adicionar proteção contra travamento
      const timeout = setTimeout(() => {
        console.warn('⚠️ CPM cálculo demorou demais, interrompendo...');
        setIsCalculando(false);
        setTarefasCPM([]);
        setCaminhosCriticos(null);
      }, 10000); // 10 segundos timeout

      const resultadoCPM = executarCalculoCPM();
      clearTimeout(timeout);

      console.log(
        '✅ CPM calculado com sucesso:',
        resultadoCPM.length,
        'tarefas'
      );
      setTarefasCPM(resultadoCPM);

      // Identificar caminhos críticos
      const tarefasCriticas = resultadoCPM.filter((t) => t.ehCritica);
      const sequenciasCriticas = identificarSequenciasCriticas(tarefasCriticas);

      setCaminhosCriticos({
        sequencias: sequenciasCriticas,
        duracaoTotal: calcularDuracaoTotal(sequenciasCriticas[0] || []),
        margemSeguranca: calcularMargemSeguranca(resultadoCPM),
      });

      // Identificar tarefas problemáticas
      const problematicas = resultadoCPM
        .filter(
          (t) =>
            t.folga < 7 || // Menos de 1 semana de folga
            t.tarefa.percentualCompleto <
              t.tarefa.percentualReplanejamento * 0.8 || // Progresso atrasado
            new Date(t.tarefa.fim) < new Date() // Já passou do prazo
        )
        .slice(0, 10);

      setTarefasProblematicas(problematicas);

      console.log('✅ CPM calculado:', {
        totalTarefas: resultadoCPM.length,
        tarefasCriticas: tarefasCriticas.length,
        sequenciasCriticas: sequenciasCriticas.length,
        problematicas: problematicas.length,
      });
    } catch (error) {
      console.error('❌ Erro ao calcular CPM:', error);
    } finally {
      setIsCalculando(false);
    }
  };

  const identificarSequenciasCriticas = (
    tarefasCriticas: TarefaCPM[]
  ): TarefaCPM[][] => {
    if (!tarefasCriticas || tarefasCriticas.length === 0) {
      console.warn('⚠️ Nenhuma tarefa crítica encontrada');
      return [];
    }

    console.log(
      '🔍 Identificando sequências críticas para',
      tarefasCriticas.length,
      'tarefas críticas'
    );

    // Lógica simplificada para identificar sequências do caminho crítico
    const sequencias: TarefaCPM[][] = [];
    const processadas = new Set<number>();

    tarefasCriticas.forEach((tarefa) => {
      if (processadas.has(tarefa.tarefa.id)) return;

      const sequencia: TarefaCPM[] = [tarefa];
      processadas.add(tarefa.tarefa.id);

      // Buscar sucessoras críticas
      let atual = tarefa;
      while (true) {
        const proximaCritica = tarefasCriticas.find(
          (t) =>
            !processadas.has(t.tarefa.id) &&
            t.dependencias.some((dep) => dep.id === atual.tarefa.id.toString())
        );

        if (proximaCritica) {
          sequencia.push(proximaCritica);
          processadas.add(proximaCritica.tarefa.id);
          atual = proximaCritica;
        } else {
          break;
        }
      }

      if (sequencia.length >= 1) {
        // Mudança: aceitar sequências de 1 tarefa também
        sequencias.push(sequencia);
      }
    });

    const resultado = sequencias.sort((a, b) => b.length - a.length);
    console.log('📊 Encontradas', resultado.length, 'sequências críticas');
    return resultado;
  };

  const calcularDuracaoTotal = (sequencia: TarefaCPM[]): number => {
    if (!sequencia || sequencia.length === 0) {
      console.warn('⚠️ Sequência vazia para calcular duração total');
      return 0;
    }

    const total = sequencia.reduce((total, t) => {
      const duracao = calcularDuracao(t.tarefa);
      return total + duracao;
    }, 0);

    console.log(
      '📊 Duração total calculada:',
      total,
      'dias para',
      sequencia.length,
      'tarefas'
    );
    return total;
  };

  const calcularMargemSeguranca = (todas: TarefaCPM[]): number => {
    if (!todas || todas.length === 0) {
      console.warn('⚠️ Nenhuma tarefa para calcular margem de segurança');
      return 0;
    }

    const somaFolgas = todas.reduce(
      (acc, t) => acc + Math.max(0, t.folga || 0),
      0
    );
    const folgaMedia = somaFolgas / todas.length;
    const resultado = Math.round(folgaMedia);

    console.log(
      '📊 Margem de segurança calculada:',
      resultado,
      'dias (média de',
      todas.length,
      'tarefas)'
    );
    return isNaN(resultado) ? 0 : resultado;
  };

  const obterCorFolga = (folga: number) => {
    if (folga < 0) return 'text-red-600 bg-red-50 border-red-200';
    if (folga <= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (folga <= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  if (isCalculando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">
          Calculando Caminho Crítico do PFUS3...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análise CPM - PFUS3 2025</h2>
          <p className="text-gray-600 mt-1">
            Caminho Crítico e análise de dependências do projeto
          </p>
        </div>
        <button
          onClick={calcularCPM}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Route className="w-4 h-4" />
          <span>Recalcular CPM</span>
        </button>
      </div>

      {/* Resumo Executivo CPM */}
      {caminhosCriticos && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${themeClasses.card} p-6 rounded-lg border`}>
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {caminhosCriticos.sequencias?.length || 0}
                </p>
                <p className="text-sm text-gray-600">Caminhos Críticos</p>
              </div>
            </div>
          </div>

          <div className={`${themeClasses.card} p-6 rounded-lg border`}>
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {caminhosCriticos.duracaoTotal || 0}
                </p>
                <p className="text-sm text-gray-600">Dias Duração</p>
              </div>
            </div>
          </div>

          <div className={`${themeClasses.card} p-6 rounded-lg border`}>
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {tarefasCPM.filter((t) => t.ehCritica).length}
                </p>
                <p className="text-sm text-gray-600">Tarefas Críticas</p>
              </div>
            </div>
          </div>

          <div className={`${themeClasses.card} p-6 rounded-lg border`}>
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {isNaN(caminhosCriticos.margemSeguranca)
                    ? 0
                    : caminhosCriticos.margemSeguranca}
                </p>
                <p className="text-sm text-gray-600">Margem Média (dias)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tarefas Problemáticas */}
      {tarefasProblematicas.length > 0 && (
        <div className={`${themeClasses.card} rounded-lg border p-6`}>
          <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Tarefas Requerendo Atenção Imediata
          </h3>

          <div className="space-y-3">
            {tarefasProblematicas.map((tarefaCPM, index) => (
              <div
                key={index}
                className="p-4 border-l-4 border-red-500 bg-red-50 rounded cursor-pointer hover:bg-red-100"
                onClick={() => onTarefaClick && onTarefaClick(tarefaCPM.tarefa)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{tarefaCPM.tarefa.nome}</h4>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p>Categoria: {tarefaCPM.tarefa.categoria}</p>
                      <p>
                        Progresso: {tarefaCPM.tarefa.percentualCompleto}%
                        (Previsto: {tarefaCPM.tarefa.percentualReplanejamento}%)
                      </p>
                      <div className="flex space-x-4">
                        <span>
                          Início:{' '}
                          {new Date(tarefaCPM.tarefa.inicio).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                        <span>
                          Fim:{' '}
                          {new Date(tarefaCPM.tarefa.fim).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${obterCorFolga(tarefaCPM.folga)}`}
                    >
                      {tarefaCPM.folga < 0
                        ? 'ATRASADA'
                        : tarefaCPM.folga === 0
                          ? 'CRÍTICA'
                          : `${tarefaCPM.folga} dias de folga`}
                    </div>
                    {tarefaCPM.ehCritica && (
                      <div className="text-xs text-red-600 mt-1 font-medium">
                        CAMINHO CRÍTICO
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sequências do Caminho Crítico */}
      {caminhosCriticos && caminhosCriticos.sequencias.length > 0 && (
        <div className={`${themeClasses.card} rounded-lg border p-6`}>
          <h3 className="text-lg font-semibold mb-4">
            Principais Caminhos Críticos
          </h3>

          <div className="space-y-6">
            {caminhosCriticos.sequencias
              .slice(0, 3)
              .map((sequencia, seqIndex) => (
                <div key={seqIndex}>
                  <h4 className="font-medium mb-3 text-red-600">
                    Caminho Crítico #{seqIndex + 1} - {sequencia.length} tarefas
                  </h4>

                  <div className="flex flex-wrap items-center space-x-2 space-y-2">
                    {sequencia.map((tarefaCPM, taskIndex) => (
                      <React.Fragment key={taskIndex}>
                        <div
                          className="inline-flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-lg border border-red-200 cursor-pointer hover:bg-red-200"
                          onClick={() =>
                            onTarefaClick && onTarefaClick(tarefaCPM.tarefa)
                          }
                        >
                          <div className="text-sm">
                            <div className="font-medium">
                              {tarefaCPM.tarefa.nome.slice(0, 40)}...
                            </div>
                            <div className="text-xs">
                              {calcularDuracao(tarefaCPM.tarefa)} dias | Folga:{' '}
                              {tarefaCPM.folga}
                            </div>
                          </div>
                        </div>

                        {taskIndex < sequencia.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Lista de Todas as Tarefas com Folgas */}
      <div className={`${themeClasses.card} rounded-lg border p-6`}>
        <h3 className="text-lg font-semibold mb-4">
          Análise de Folgas - Todas as Tarefas
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Tarefa</th>
                <th className="text-left p-2">Categoria</th>
                <th className="text-left p-2">Progresso</th>
                <th className="text-left p-2">Duração</th>
                <th className="text-left p-2">Folga</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {tarefasCPM.slice(0, 20).map((tarefaCPM, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    onTarefaClick && onTarefaClick(tarefaCPM.tarefa)
                  }
                >
                  <td className="p-2">
                    <div className="font-medium">{tarefaCPM.tarefa.nome}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(tarefaCPM.tarefa.inicio).toLocaleDateString(
                        'pt-BR'
                      )}{' '}
                      -{' '}
                      {new Date(tarefaCPM.tarefa.fim).toLocaleDateString(
                        'pt-BR'
                      )}
                    </div>
                  </td>
                  <td className="p-2">{tarefaCPM.tarefa.categoria}</td>
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            tarefaCPM.tarefa.percentualCompleto >= 100
                              ? 'bg-green-500'
                              : tarefaCPM.tarefa.percentualCompleto >= 75
                                ? 'bg-blue-500'
                                : tarefaCPM.tarefa.percentualCompleto >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(100, tarefaCPM.tarefa.percentualCompleto)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs">
                        {tarefaCPM.tarefa.percentualCompleto}%
                      </span>
                    </div>
                  </td>
                  <td className="p-2">
                    {calcularDuracao(tarefaCPM.tarefa)} dias
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${obterCorFolga(tarefaCPM.folga)}`}
                    >
                      {tarefaCPM.folga} dias
                    </span>
                  </td>
                  <td className="p-2">
                    {tarefaCPM.ehCritica ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                        CRÍTICA
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CPMAnalysisReal;
