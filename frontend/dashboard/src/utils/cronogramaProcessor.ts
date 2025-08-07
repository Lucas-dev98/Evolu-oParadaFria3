import {
  TarefaCronograma,
  CategoriaCronograma,
  ResumoCronograma,
} from '../types/cronograma';

export const processarCronogramaCSV = (
  data: any[]
): {
  categorias: CategoriaCronograma[];
  resumo: ResumoCronograma;
} => {
  const tarefas: TarefaCronograma[] = [];

  // Processar cada linha do CSV
  data.forEach((linha, index) => {
    // Pular linhas vazias ou cabeçalhos
    if (!linha['Nome da tarefa'] || linha['Nome da tarefa'].includes('ID'))
      return;

    const tarefa: TarefaCronograma = {
      id: parseInt(linha.ID) || index,
      nome: linha['Nome da tarefa'] || '',
      percentualCompleto:
        parseFloat(linha['% Complete']?.replace('%', '')) || 0,
      percentualFisico:
        parseFloat(linha['Physical % Complete']?.replace('%', '')) || 0,
      percentualReplanejamento:
        parseFloat(linha['% Previsto Replanejamento']?.replace('%', '')) || 0,
      duracao: linha.Duration || '',
      inicio: linha.Start || '',
      fim: linha.Finish || '',
      inicioReal:
        linha['Actual Start'] !== 'NA' ? linha['Actual Start'] : undefined,
      fimReal:
        linha['Actual Finish'] !== 'NA' ? linha['Actual Finish'] : undefined,
      predecessores: linha.Predecessors || '',
      inicioBaseline: linha['Baseline Start'] || '',
      fimBaseline: linha['Baseline Finish'] || '',
      percentualFisicoPrev: parseFloat(linha['% Físico Prev. LB']) || 0,
      percentualFisicoReplan:
        parseFloat(linha['% Físico Prev. Replanejado']) || 0,
      percentualFisicoCalc: parseFloat(linha['% Físico Calculado']) || 0,
      nivel: calcularNivel(linha['Nome da tarefa']),
      categoria: extrairCategoria(linha['Nome da tarefa']),
    };

    tarefas.push(tarefa);
  });

  // Agrupar tarefas por categoria
  const categorias = agruparPorCategoria(tarefas);

  // Organizar hierarquia de subatividades
  const categoriasComHierarquia = organizarHierarquiaSubatividades(categorias);

  // Calcular resumo
  const resumo = calcularResumo(tarefas);

  return { categorias: categoriasComHierarquia, resumo };
};

const calcularNivel = (nomeTarefa: string): number => {
  // Contar o número de espaços ou tabs no início da string
  const match = nomeTarefa.match(/^(\s+)/);
  if (!match) return 0;

  // Cada 4 espaços = 1 nível de indentação
  return Math.floor(match[1].length / 4);
};

const extrairCategoria = (nomeTarefa: string): string => {
  const nome = nomeTarefa.trim();

  // Categorias principais baseadas na estrutura real do PFUS3
  if (nome.includes('Mobilização')) return 'Mobilização';
  if (nome.includes('Canteiros') || nome.includes('Canteiro'))
    return 'Canteiros';
  if (nome.includes('Logística')) return 'Logística';
  if (nome.includes('Refratário')) return 'Refratário';
  if (nome.includes('Elétrica')) return 'Elétrica';
  if (
    nome.includes('Preparação (Espessador') ||
    nome.includes('Espessador') ||
    nome.includes('Moagem') ||
    nome.includes('Homogeneização')
  )
    return 'Espessador/Moagem/Homogeneização';
  if (nome.includes('Mecânica do Forno') || nome.includes('Mecânica'))
    return 'Mecânica do Forno';
  if (nome.includes('Ventilador')) return 'Ventiladores';
  if (nome.includes('Bogiflex')) return 'Bogiflex';
  if (nome.includes('Trilho')) return 'Trilhos';
  if (nome.includes('Selagem')) return 'Selagens';
  if (nome.includes('Junta')) return 'Juntas de Expansão';
  if (nome.includes('Caixa Seca')) return 'Caixas Secas';

  // Categorias específicas do PFUS3
  if (nome === 'Cronograma de Preparação - PFUS3 2025')
    return 'Projeto Principal';
  if (
    nome.includes('Início da Parada') ||
    nome.includes('Início da Preparação')
  )
    return 'Marcos do Projeto';

  return 'Geral';
};

// Função para organizar hierarquia de subatividades
const organizarHierarquiaSubatividades = (
  categorias: CategoriaCronograma[]
): CategoriaCronograma[] => {
  return categorias.map((categoria) => {
    const tarefasHierarquicas = construirHierarquia(categoria.tarefas);
    return {
      ...categoria,
      tarefas: tarefasHierarquicas,
    };
  });
};

// Função para construir hierarquia de tarefas baseada no nível de indentação
const construirHierarquia = (
  tarefas: TarefaCronograma[]
): TarefaCronograma[] => {
  const tarefasOrdenadas = [...tarefas].sort((a, b) => a.id - b.id);
  const tarefasPrincipais: TarefaCronograma[] = [];
  const pilhaTarefas: TarefaCronograma[] = [];

  tarefasOrdenadas.forEach((tarefa) => {
    // Limpar a pilha se necessário (quando encontramos uma tarefa de nível menor ou igual)
    while (
      pilhaTarefas.length > 0 &&
      pilhaTarefas[pilhaTarefas.length - 1].nivel >= tarefa.nivel
    ) {
      pilhaTarefas.pop();
    }

    // Criar uma cópia da tarefa para evitar mutações
    const novaTarefa: TarefaCronograma = {
      ...tarefa,
      subatividades: [],
      tarefaPai:
        pilhaTarefas.length > 0
          ? pilhaTarefas[pilhaTarefas.length - 1].id
          : undefined,
    };

    if (pilhaTarefas.length === 0) {
      // Tarefa de nível raiz
      tarefasPrincipais.push(novaTarefa);
    } else {
      // Subatividade - adicionar à tarefa pai
      const tarefaPai = pilhaTarefas[pilhaTarefas.length - 1];
      if (!tarefaPai.subatividades) {
        tarefaPai.subatividades = [];
      }
      tarefaPai.subatividades.push(novaTarefa);
    }

    // Adicionar à pilha para possíveis subatividades futuras
    pilhaTarefas.push(novaTarefa);
  });

  return tarefasPrincipais;
};

const agruparPorCategoria = (
  tarefas: TarefaCronograma[]
): CategoriaCronograma[] => {
  const grupos: { [key: string]: TarefaCronograma[] } = {};

  tarefas.forEach((tarefa) => {
    if (!grupos[tarefa.categoria]) {
      grupos[tarefa.categoria] = [];
    }
    grupos[tarefa.categoria].push(tarefa);
  });

  const coresCategoria: { [key: string]: string } = {
    Geral: 'bg-gray-500 dark:bg-gray-400',
    Logística: 'bg-blue-500 dark:bg-blue-400',
    Refratário: 'bg-red-500 dark:bg-red-400',
    Elétrica: 'bg-yellow-500 dark:bg-yellow-400',
    'Mecânica do Forno': 'bg-green-500 dark:bg-green-400',
    'Espessador/Moagem/Homogeneização': 'bg-indigo-500 dark:bg-indigo-400',
    Canteiros: 'bg-pink-500 dark:bg-pink-400',
    Mobilização: 'bg-orange-500 dark:bg-orange-400',
    Ventiladores: 'bg-purple-500 dark:bg-purple-400',
    Trilhos: 'bg-teal-500 dark:bg-teal-400',
    Selagens: 'bg-cyan-500 dark:bg-cyan-400',
    'Juntas de Expansão': 'bg-emerald-500 dark:bg-emerald-400',
    'Caixas Secas': 'bg-violet-500 dark:bg-violet-400',
    Bogiflex: 'bg-rose-500 dark:bg-rose-400',
    'Projeto Principal': 'bg-slate-500 dark:bg-slate-400',
    'Marcos do Projeto': 'bg-amber-500 dark:bg-amber-400',
  };

  return Object.entries(grupos)
    .map(([nomeCategoria, tarefasCategoria]) => {
      const progressoMedio =
        tarefasCategoria.reduce(
          (acc, tarefa) => acc + tarefa.percentualCompleto,
          0
        ) / tarefasCategoria.length;

      return {
        nome: nomeCategoria,
        cor: coresCategoria[nomeCategoria] || 'bg-gray-500 dark:bg-gray-400',
        icone: '', // Pode ser adicionado posteriormente
        progresso: Math.round(progressoMedio),
        tarefas: tarefasCategoria.sort((a, b) => a.id - b.id),
      };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));
};

const calcularResumo = (tarefas: TarefaCronograma[]): ResumoCronograma => {
  const totalTarefas = tarefas.length;
  const tarefasConcluidas = tarefas.filter(
    (t) => t.percentualCompleto === 100
  ).length;
  const tarefasEmAndamento = tarefas.filter(
    (t) => t.percentualCompleto > 0 && t.percentualCompleto < 100
  ).length;
  const tarefasPendentes = tarefas.filter(
    (t) => t.percentualCompleto === 0
  ).length;

  // Calcular progresso geral baseado na média ponderada das tarefas
  const progressoGeral = Math.round(
    tarefas.reduce((acc, tarefa) => acc + tarefa.percentualCompleto, 0) /
      totalTarefas
  );

  // Calcular dias restantes até 14/08/25 (data baseline do projeto PFUS3)
  const dataBaselineProjeto = new Date('2025-08-14');
  const hoje = new Date();
  const diasRestantes = Math.max(
    0,
    Math.ceil(
      (dataBaselineProjeto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  // Análise de status individual das tarefas
  let atividadesEmDia = 0;
  let atividadesAtrasadas = 0;
  let atividadesAdiantadas = 0;
  let atividadesCriticas = 0;

  tarefas.forEach((tarefa) => {
    if (tarefa.percentualCompleto === 100) return; // Pular tarefas concluídas

    const fimPrevisto = new Date(tarefa.fim);
    const fimBaseline = new Date(tarefa.fimBaseline);
    const diasParaFim = Math.ceil(
      (fimPrevisto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Classificar atividade
    if (diasParaFim < 0 || fimPrevisto > fimBaseline) {
      atividadesAtrasadas++;
    } else if (diasParaFim <= 3 && diasParaFim >= 0) {
      atividadesCriticas++;
    } else if (fimPrevisto < fimBaseline && diasParaFim > 3) {
      atividadesAdiantadas++;
    } else {
      atividadesEmDia++;
    }
  });

  const statusGeral = {
    totalAtividades: totalTarefas,
    atividadesEmDia,
    atividadesAtrasadas,
    atividadesAdiantadas,
    atividadesCriticas,
    progressoMedio: progressoGeral,
  };

  return {
    progressoGeral,
    totalTarefas,
    tarefasConcluidas,
    tarefasEmAndamento,
    tarefasPendentes,
    diasRestantes,
    dataPrevistaConclusao: '14/08/2025', // Data baseline do projeto PFUS3
    statusGeral,
  };
};

export const gerarTemplateCronograma = () => {
  const template = [
    {
      ID: 1,
      'Nome da tarefa': 'Preparação da Área Principal',
      '% Complete': '75%',
      'Physical % Complete': '70%',
      '% Previsto Replanejamento': '80%',
      Duration: '10 days',
      Start: '2025-08-01',
      Finish: '2025-08-15',
      'Actual Start': '2025-08-01',
      'Actual Finish': 'NA',
      Predecessors: '',
      'Baseline Start': '2025-08-01',
      'Baseline Finish': '2025-08-15',
      '% Físico Prev. LB': 0.75,
      '% Físico Prev. Replanejado': 0.7,
      '% Físico Calculado': 0.75,
    },
    {
      ID: 2,
      'Nome da tarefa': '    Mobilização de Equipamentos',
      '% Complete': '100%',
      'Physical % Complete': '100%',
      '% Previsto Replanejamento': '100%',
      Duration: '5 days',
      Start: '2025-08-01',
      Finish: '2025-08-05',
      'Actual Start': '2025-08-01',
      'Actual Finish': '2025-08-05',
      Predecessors: '1',
      'Baseline Start': '2025-08-01',
      'Baseline Finish': '2025-08-05',
      '% Físico Prev. LB': 1.0,
      '% Físico Prev. Replanejado': 1.0,
      '% Físico Calculado': 1.0,
    },
  ];

  return template;
};

// Função para analisar status de prazo das tarefas
export const analisarStatusPrazo = (
  tarefas: TarefaCronograma[],
  dataReferencia: Date
) => {
  const status = {
    emDia: 0,
    atrasadas: 0,
    adiantadas: 0,
    criticas: 0,
    concluidas: 0,
    emAndamento: 0,
    pendentes: 0,
  };

  tarefas.forEach((tarefa) => {
    // Status de conclusão
    if (tarefa.percentualCompleto === 100) {
      status.concluidas++;
    } else if (tarefa.percentualCompleto > 0) {
      status.emAndamento++;
    } else {
      status.pendentes++;
    }

    // Análise de prazo apenas para tarefas não concluídas
    if (tarefa.percentualCompleto < 100) {
      const dataFimPrevista = new Date(tarefa.fim);
      const dataFimBaseline = new Date(tarefa.fimBaseline);

      // Validar se as datas são válidas
      if (
        isNaN(dataFimPrevista.getTime()) ||
        isNaN(dataFimBaseline.getTime())
      ) {
        // Se as datas são inválidas, considerar em dia por padrão
        status.emDia++;
        return;
      }

      const diasParaFim = Math.ceil(
        (dataFimPrevista.getTime() - dataReferencia.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Críticas: menos de 3 dias para o fim
      if (diasParaFim <= 3 && diasParaFim >= 0) {
        status.criticas++;
      }
      // Atrasadas: data fim já passou ou fim previsto > baseline
      else if (diasParaFim < 0 || dataFimPrevista > dataFimBaseline) {
        status.atrasadas++;
      }
      // Adiantadas: fim previsto < baseline
      else if (dataFimPrevista < dataFimBaseline) {
        status.adiantadas++;
      }
      // Em dia: dentro do prazo baseline
      else {
        status.emDia++;
      }
    }
  });

  return status;
};

// Função para analisar status geral do cronograma
export const analisarStatusGeralPrazo = (categorias: CategoriaCronograma[]) => {
  const statusGeral = {
    totalAtividades: 0,
    atividadesEmDia: 0,
    atividadesAtrasadas: 0,
    atividadesAdiantadas: 0,
    atividadesCriticas: 0,
    progressoMedio: 0,
  };

  // Somar todas as tarefas de todas as categorias
  categorias.forEach((categoria) => {
    statusGeral.totalAtividades += categoria.tarefas.length;
    statusGeral.progressoMedio += categoria.progresso;

    // Somar status de cada categoria
    const status = categoria.statusPrazo;
    if (status) {
      statusGeral.atividadesEmDia += status.emDia;
      statusGeral.atividadesAtrasadas += status.atrasadas;
      statusGeral.atividadesAdiantadas += status.adiantadas;
      statusGeral.atividadesCriticas += status.criticas;
    }
  });

  statusGeral.progressoMedio = statusGeral.progressoMedio / categorias.length;

  return statusGeral;
};

// Nova função para processar o CSV real do cronograma PFUS3
export const processarCronogramaRealCSV = (csvContent: string) => {
  console.log('Iniciando processamento do CSV...');
  const linhas = csvContent
    .split('\n')
    .filter((linha) => linha.trim() && !linha.startsWith('﻿'));
  console.log('Total de linhas:', linhas.length);

  const tarefas: TarefaCronograma[] = [];

  // Pular o cabeçalho
  for (let i = 1; i < Math.min(linhas.length, 200); i++) {
    // Processar mais linhas agora
    const linha = linhas[i];
    if (!linha.trim()) continue;

    console.log(`Processando linha ${i}:`, linha.substring(0, 100));

    // Parse manual considerando vírgulas dentro de aspas
    const campos = parsearLinhaCSV(linha);
    console.log(`Campos extraídos (${campos.length}):`, campos.slice(0, 5));

    if (campos.length < 10) continue;

    const nome = campos[1]?.replace(/"/g, '').trim();
    if (!nome || nome.includes('Indicators') || nome.includes('Task name'))
      continue;

    const tarefa: TarefaCronograma = {
      id: parseInt(campos[0]) || i,
      nome: nome,
      percentualCompleto: parseFloat(campos[2]?.replace('%', '') || '0'),
      percentualFisico: parseFloat(campos[3]?.replace('%', '') || '0'),
      percentualReplanejamento: parseFloat(campos[4]?.replace('%', '') || '0'),
      duracao: campos[5] || '',
      inicio: campos[6] || '',
      fim: campos[7] || '',
      inicioReal: campos[8] !== 'NA' ? campos[8] : undefined,
      fimReal: campos[9] !== 'NA' ? campos[9] : undefined,
      predecessores: campos[10] || '',
      inicioBaseline: campos[11] || '',
      fimBaseline: campos[12] || '',
      percentualFisicoPrev: parseFloat(campos[13]) || 0,
      percentualFisicoReplan: parseFloat(campos[14]) || 0,
      percentualFisicoCalc: parseFloat(campos[15]) || 0,
      nivel: calcularNivel(nome),
      categoria: extrairCategoriaReal(nome, i, linhas),
    };

    console.log('Tarefa criada:', {
      nome: tarefa.nome,
      percentual: tarefa.percentualCompleto,
    });
    tarefas.push(tarefa);
  }

  console.log('Total de tarefas processadas:', tarefas.length);

  // Agrupar por categorias principais
  const categoriasPrincipais = [
    'Logística',
    'Refratário',
    'Elétrica',
    'Preparação',
    'Mecânica do Forno',
    'Barramentos',
  ];

  const categorias: CategoriaCronograma[] = categoriasPrincipais
    .map((nomeCategoria) => {
      const tarefasCategoria = tarefas.filter(
        (t) =>
          t.categoria === nomeCategoria ||
          t.nome.toLowerCase().includes(nomeCategoria.toLowerCase()) ||
          (nomeCategoria === 'Mecânica do Forno' &&
            t.nome.toLowerCase().includes('mecânica'))
      );

      const progressoMedio =
        tarefasCategoria.length > 0
          ? tarefasCategoria.reduce((sum, t) => sum + t.percentualCompleto, 0) /
            tarefasCategoria.length
          : 0;

      // Analisar status de prazo
      const hoje = new Date();
      const statusAnalise = analisarStatusPrazo(tarefasCategoria, hoje);

      const categoria = {
        nome: nomeCategoria,
        tarefas: tarefasCategoria,
        progresso: progressoMedio,
        cor: getCategoriaColor(nomeCategoria),
        icone: getCategoriaIcon(nomeCategoria),
        // Adicionar informações de status
        statusPrazo: statusAnalise,
      };

      console.log(`Categoria ${nomeCategoria}:`, {
        tarefas: tarefasCategoria.length,
        progresso: progressoMedio,
        status: statusAnalise,
      });
      return categoria;
    })
    .filter((cat) => cat.tarefas.length > 0);

  // Criar análise de status geral
  const statusGeral = analisarStatusGeralPrazo(categorias);

  // Buscar a tarefa principal (ID 0) para obter o progresso geral real
  const tarefaPrincipal = tarefas.find((t) => t.id === 0);
  const progressoGeralReal = tarefaPrincipal
    ? tarefaPrincipal.percentualCompleto
    : tarefas.length > 0
      ? tarefas.reduce((sum, t) => sum + t.percentualCompleto, 0) /
        tarefas.length
      : 0;

  // Obter data de conclusão da tarefa principal
  const dataConclusao = tarefaPrincipal?.fim || '2025-09-18';
  const dataFim = new Date(dataConclusao);
  const hoje = new Date();
  const diasRestantes = Math.max(
    0,
    Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  );

  const resumo: ResumoCronograma = {
    totalTarefas: tarefas.length,
    tarefasConcluidas: tarefas.filter((t) => t.percentualCompleto >= 100)
      .length,
    tarefasEmAndamento: tarefas.filter(
      (t) => t.percentualCompleto > 0 && t.percentualCompleto < 100
    ).length,
    tarefasPendentes: tarefas.filter((t) => t.percentualCompleto === 0).length,
    progressoGeral: progressoGeralReal,
    diasRestantes: diasRestantes,
    dataPrevistaConclusao: dataFim.toLocaleDateString('pt-BR'),
    statusGeral: statusGeral,
  };

  console.log('Resumo final:', resumo);
  console.log(
    'Progresso geral obtido da tarefa principal (ID 0):',
    progressoGeralReal
  );
  console.log('Categorias finais:', categorias.length);

  // Gerar dados de evolução baseados no cronograma
  const dadosEvolucao = gerarDadosEvolucao(tarefas);
  console.log('Dados de evolução gerados:', dadosEvolucao.length, 'séries');

  return { categorias, resumo, evolucao: dadosEvolucao };
};

// Função auxiliar para parsear linha CSV considerando vírgulas dentro de aspas
function parsearLinhaCSV(linha: string): string[] {
  const campos: string[] = [];
  let campoAtual = '';
  let dentroAspas = false;

  for (let i = 0; i < linha.length; i++) {
    const char = linha[i];

    if (char === '"') {
      dentroAspas = !dentroAspas;
    } else if (char === ',' && !dentroAspas) {
      campos.push(campoAtual);
      campoAtual = '';
    } else {
      campoAtual += char;
    }
  }

  campos.push(campoAtual);
  return campos;
}

// Função para extrair categoria baseada no contexto real do cronograma
function extrairCategoriaReal(
  nome: string,
  index: number,
  linhas: string[]
): string {
  const nomeClean = nome.trim();

  // Categorias principais identificadas no cronograma
  if (nomeClean.includes('Logística')) return 'Logística';
  if (nomeClean.includes('Refratário')) return 'Refratário';
  if (nomeClean.includes('Elétrica')) return 'Elétrica';
  if (
    nomeClean.includes('Espessador') ||
    nomeClean.includes('Moagem') ||
    nomeClean.includes('Homogeneização')
  )
    return 'Preparação (Espessador / Moagem / Homogeneização)';
  if (
    nomeClean.includes('Mecânica do Forno') ||
    nomeClean.includes('Meio do Forno')
  )
    return 'Mecânica do Forno (Meio do Forno)';
  if (nomeClean.includes('Barramentos')) return 'Barramentos';

  // Para sub-tarefas, procurar a categoria pai
  const nivel = calcularNivel(nome);
  if (nivel > 1) {
    for (let i = index - 1; i >= 1; i--) {
      const linhaPai = linhas[i]?.split(',')[1]?.replace(/"/g, '').trim();
      if (linhaPai) {
        const nivelPai = calcularNivel(linhaPai);
        if (nivelPai < nivel) {
          if (linhaPai.includes('Logística')) return 'Logística';
          if (linhaPai.includes('Refratário')) return 'Refratário';
          if (linhaPai.includes('Elétrica')) return 'Elétrica';
          if (
            linhaPai.includes('Espessador') ||
            linhaPai.includes('Moagem') ||
            linhaPai.includes('Homogeneização')
          )
            return 'Preparação (Espessador / Moagem / Homogeneização)';
          if (
            linhaPai.includes('Mecânica do Forno') ||
            linhaPai.includes('Meio do Forno')
          )
            return 'Mecânica do Forno (Meio do Forno)';
          if (linhaPai.includes('Barramentos')) return 'Barramentos';
        }
      }
    }
  }

  return 'Geral';
}

// Função para obter cores das categorias
function getCategoriaColor(categoria: string): string {
  const cores: { [key: string]: string } = {
    Logística: '#3B82F6',
    Refratário: '#10B981',
    Elétrica: '#F59E0B',
    'Preparação (Espessador / Moagem / Homogeneização)': '#EF4444',
    'Mecânica do Forno (Meio do Forno)': '#8B5CF6',
    Barramentos: '#EC4899',
    Geral: '#6B7280',
  };

  return cores[categoria] || '#6B7280';
}

// Função para obter ícones das categorias
function getCategoriaIcon(categoria: string): string {
  const icones: { [key: string]: string } = {
    Logística: 'truck',
    Refratário: 'hammer',
    Elétrica: 'zap',
    'Preparação (Espessador / Moagem / Homogeneização)': 'settings',
    'Mecânica do Forno (Meio do Forno)': 'cog',
    Barramentos: 'activity',
    Geral: 'folder',
  };

  return icones[categoria] || 'folder';
}

// ========================================
// FUNÇÕES DE PERSISTÊNCIA DE DADOS
// ========================================

const CRONOGRAMA_STORAGE_KEY = 'cronograma_pfus3_data';
const CRONOGRAMA_VERSION_KEY = 'cronograma_pfus3_version';
const CURRENT_VERSION = '1.0';

interface DadosCronogramaPersistidos {
  categorias: CategoriaCronograma[];
  resumo: ResumoCronograma;
  dataCarregamento: string;
  nomeArquivo?: string;
  versao: string;
}

/**
 * Salvar dados do cronograma no localStorage
 */
export const salvarCronogramaLocal = (
  categorias: CategoriaCronograma[],
  resumo: ResumoCronograma,
  nomeArquivo?: string
): void => {
  try {
    const dados: DadosCronogramaPersistidos = {
      categorias,
      resumo,
      dataCarregamento: new Date().toISOString(),
      nomeArquivo,
      versao: CURRENT_VERSION,
    };

    localStorage.setItem(CRONOGRAMA_STORAGE_KEY, JSON.stringify(dados));
    localStorage.setItem(CRONOGRAMA_VERSION_KEY, CURRENT_VERSION);

    console.log('✅ Cronograma salvo localmente:', {
      categorias: categorias.length,
      tarefasTotais: resumo.totalTarefas,
      arquivo: nomeArquivo,
    });
  } catch (error) {
    console.error('❌ Erro ao salvar cronograma localmente:', error);
  }
};

/**
 * Carregar dados do cronograma do localStorage
 */
export const carregarCronogramaLocal = (): {
  categorias: CategoriaCronograma[];
  resumo: ResumoCronograma;
  metadados: {
    dataCarregamento: string;
    nomeArquivo?: string;
    versao: string;
  };
} | null => {
  try {
    const dadosString = localStorage.getItem(CRONOGRAMA_STORAGE_KEY);
    const versaoSalva = localStorage.getItem(CRONOGRAMA_VERSION_KEY);

    if (!dadosString || versaoSalva !== CURRENT_VERSION) {
      console.log('⚠️ Dados não encontrados ou versão incompatível');
      return null;
    }

    const dados: DadosCronogramaPersistidos = JSON.parse(dadosString);

    console.log('✅ Cronograma carregado localmente:', {
      categorias: dados.categorias.length,
      tarefasTotais: dados.resumo.totalTarefas,
      arquivo: dados.nomeArquivo,
      dataCarregamento: dados.dataCarregamento,
    });

    return {
      categorias: dados.categorias,
      resumo: dados.resumo,
      metadados: {
        dataCarregamento: dados.dataCarregamento,
        nomeArquivo: dados.nomeArquivo,
        versao: dados.versao,
      },
    };
  } catch (error) {
    console.error('❌ Erro ao carregar cronograma local:', error);
    return null;
  }
};

/**
 * Verificar se existem dados salvos localmente
 */
export const existeCronogramaLocal = (): boolean => {
  try {
    const dadosString = localStorage.getItem(CRONOGRAMA_STORAGE_KEY);
    const versaoSalva = localStorage.getItem(CRONOGRAMA_VERSION_KEY);
    return !!(dadosString && versaoSalva === CURRENT_VERSION);
  } catch (error) {
    return false;
  }
};

/**
 * Limpar dados salvos localmente
 */
export const limparCronogramaLocal = (): void => {
  try {
    localStorage.removeItem(CRONOGRAMA_STORAGE_KEY);
    localStorage.removeItem(CRONOGRAMA_VERSION_KEY);
    console.log('✅ Dados do cronograma removidos localmente');
  } catch (error) {
    console.error('❌ Erro ao limpar dados locais:', error);
  }
};

/**
 * Obter informações sobre os dados salvos
 */
export const obterInfoCronogramaLocal = (): {
  dataCarregamento: string;
  nomeArquivo?: string;
  versao: string;
  tamanho: string;
} | null => {
  try {
    const dadosString = localStorage.getItem(CRONOGRAMA_STORAGE_KEY);
    if (!dadosString) return null;

    const dados: DadosCronogramaPersistidos = JSON.parse(dadosString);
    const tamanhoKB = Math.round(dadosString.length / 1024);

    return {
      dataCarregamento: dados.dataCarregamento,
      nomeArquivo: dados.nomeArquivo,
      versao: dados.versao,
      tamanho: `${tamanhoKB} KB`,
    };
  } catch (error) {
    console.error('❌ Erro ao obter info do cronograma local:', error);
    return null;
  }
};

/**
 * Gerar dados de evolução baseados no cronograma CSV
 */
export const gerarDadosEvolucao = (tarefas: TarefaCronograma[]): any[] => {
  try {
    console.log('🎯 Gerando dados de evolução para', tarefas.length, 'tarefas');

    // Identificar todas as categorias únicas presentes no cronograma
    const categoriasEncontradas = new Set<string>();
    tarefas.forEach((tarefa) => {
      if (tarefa.categoria && tarefa.categoria !== 'Geral') {
        categoriasEncontradas.add(tarefa.categoria);
      }
    });

    console.log(
      '📊 Categorias encontradas:',
      Array.from(categoriasEncontradas)
    );

    // Se não há categorias suficientes, usar as categorias principais do cronograma
    const categoriasPrincipais =
      Array.from(categoriasEncontradas).length > 0
        ? Array.from(categoriasEncontradas)
        : [
            'Logística',
            'Refratário',
            'Elétrica',
            'Preparação (Espessador / Moagem / Homogeneização)',
            'Mecânica do Forno (Meio do Forno)',
            'Barramentos',
            'Canteiros',
            'Mobilização',
          ];

    // Extrair datas únicas do cronograma para criar timeline realista
    const datasUnicas = new Set<Date>();
    tarefas.forEach((tarefa) => {
      // Adicionar datas de início
      if (tarefa.inicio && tarefa.inicio !== 'NA') {
        try {
          const dataInicio = new Date(tarefa.inicio);
          if (!isNaN(dataInicio.getTime())) {
            datasUnicas.add(dataInicio);
          }
        } catch (e) {}
      }

      // Adicionar datas de fim
      if (tarefa.fim && tarefa.fim !== 'NA') {
        try {
          const dataFim = new Date(tarefa.fim);
          if (!isNaN(dataFim.getTime())) {
            datasUnicas.add(dataFim);
          }
        } catch (e) {}
      }
    });

    // Converter para array ordenado e criar pontos temporais
    const datasOrdenadas = Array.from(datasUnicas).sort(
      (a, b) => a.getTime() - b.getTime()
    );

    let pontosTempo: string[] = [];

    if (datasOrdenadas.length > 0) {
      // Usar datas reais do cronograma
      const dataInicio = datasOrdenadas[0];
      const dataFim = datasOrdenadas[datasOrdenadas.length - 1];

      // Criar pontos semanais entre início e fim
      const pontos = [];
      const dataAtual = new Date(dataInicio);

      while (dataAtual <= dataFim && pontos.length < 20) {
        pontos.push(new Date(dataAtual));
        dataAtual.setDate(dataAtual.getDate() + 7); // Incrementar 1 semana
      }

      pontosTempo = pontos.map((data) =>
        data.toLocaleDateString('pt-BR', {
          month: 'short',
          day: '2-digit',
        })
      );
    } else {
      // Fallback: usar últimas 12 semanas
      const hoje = new Date();
      pontosTempo = Array.from({ length: 12 }, (_, i) => {
        const data = new Date(hoje);
        data.setDate(data.getDate() - (11 - i) * 7);
        return data.toLocaleDateString('pt-BR', {
          month: 'short',
          day: '2-digit',
        });
      });
    }

    console.log('📅 Pontos temporais gerados:', pontosTempo.length);

    // Gerar séries de dados para cada categoria
    const dadosEvolucao = categoriasPrincipais.map((categoria) => {
      const tarefasCategoria = tarefas.filter(
        (t) =>
          t.categoria === categoria ||
          t.nome.toLowerCase().includes(categoria.toLowerCase())
      );

      console.log(
        `🔍 Categoria "${categoria}": ${tarefasCategoria.length} tarefas`
      );

      if (tarefasCategoria.length === 0) {
        // Categoria sem tarefas - gerar dados sintéticos baixos
        return {
          name: categoria,
          data: pontosTempo.map((tempo, index) => ({
            x: tempo,
            y: Math.round(Math.random() * 15 + index * 2),
          })),
        };
      }

      // Calcular progresso real da categoria
      const progressoMedio =
        tarefasCategoria.reduce(
          (acc, tarefa) => acc + tarefa.percentualCompleto,
          0
        ) / tarefasCategoria.length;

      // Gerar curva de evolução realista
      const dadosCategoria = pontosTempo.map((tempo, index) => {
        // Distribuição não linear do progresso ao longo do tempo
        const progressoBase = progressoMedio;
        const fatorTempo = (index + 1) / pontosTempo.length;

        // Simular aceleração inicial e desaceleração no final
        let progressoNoPonto;
        if (fatorTempo < 0.3) {
          // Início lento (30% do tempo, 15% do progresso)
          progressoNoPonto = progressoBase * 0.15 * (fatorTempo / 0.3);
        } else if (fatorTempo < 0.8) {
          // Meio acelerado (50% do tempo, 70% do progresso)
          progressoNoPonto =
            progressoBase * (0.15 + 0.7 * ((fatorTempo - 0.3) / 0.5));
        } else {
          // Final (20% do tempo, 15% restante do progresso)
          progressoNoPonto =
            progressoBase * (0.85 + 0.15 * ((fatorTempo - 0.8) / 0.2));
        }

        // Adicionar variação natural
        const variacao = (Math.random() - 0.5) * 5;
        const progressoFinal = Math.max(
          0,
          Math.min(100, Math.round(progressoNoPonto + variacao))
        );

        return {
          x: tempo,
          y: progressoFinal,
        };
      });

      return {
        name: categoria,
        data: dadosCategoria,
      };
    });

    console.log(
      '✅ Dados de evolução gerados:',
      dadosEvolucao.map((d) => `${d.name}: ${d.data.length} pontos`)
    );

    return dadosEvolucao.filter((categoria) => categoria.data.length > 0);
  } catch (error) {
    console.error('❌ Erro ao gerar dados de evolução:', error);
    return gerarEvolucaoBasedaEmProgresso(tarefas);
  }
};

/**
 * Gerar evolução baseada apenas no progresso das tarefas (fallback)
 */
/**
 * Gerar evolução baseada apenas no progresso das tarefas (fallback)
 */
const gerarEvolucaoBasedaEmProgresso = (tarefas: TarefaCronograma[]): any[] => {
  const categoriasPrincipais = [
    'Logística',
    'Refratário',
    'Elétrica',
    'Mecânica do Forno',
    'Espessador/Moagem',
  ];
  const hoje = new Date();

  // Gerar 12 pontos distribuídos nos últimos 3 meses
  const pontosTempo = Array.from({ length: 12 }, (_, i) => {
    const data = new Date(hoje);
    data.setDate(data.getDate() - (11 - i) * 7); // Pontos semanais
    return data.toLocaleDateString('pt-BR', {
      month: 'short',
      day: '2-digit',
    });
  });

  return categoriasPrincipais.map((categoria) => {
    const tarefasCategoria = tarefas.filter((t) => t.categoria === categoria);

    if (tarefasCategoria.length === 0) {
      return {
        name: categoria,
        data: pontosTempo.map((tempo, index) => ({
          x: tempo,
          y: Math.round(Math.random() * 20 + index * 5), // Dados sintéticos
        })),
      };
    }

    const progressoMedio =
      tarefasCategoria.reduce(
        (acc, tarefa) => acc + tarefa.percentualCompleto,
        0
      ) / tarefasCategoria.length;

    return {
      name: categoria,
      data: pontosTempo.map((tempo, index) => ({
        x: tempo,
        y: Math.round(Math.min(100, (progressoMedio * (index + 1)) / 12)),
      })),
    };
  });
};
