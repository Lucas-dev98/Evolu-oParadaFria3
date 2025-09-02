import Papa from 'papaparse';
import { Phase, PhaseType } from '../types/phases';
import { cacheManager } from './cacheManager';
import { CSVValidator, ValidationResult } from './csvValidator';

// Interface para compatibilidade com o cronograma operacional
export interface ProcessedCronogramaActivity {
  id: string;
  name: string;
  duration: string;
  start: string;
  finish: string;
  responsible: string;
  status?: string;
  area?: string; // Nova propriedade para área/frente de trabalho
  edt?: string; // Nova propriedade para EDT
  percentualCompleto?: number; // Nova propriedade para percentual
  nivel?: number; // Nova propriedade para nível hierárquico
}

export interface ProcessedCronograma {
  phases: Phase[];
  metadata: {
    titulo: string;
    dataInicio: string;
    dataFim: string;
    duracaoTotal: string;
  };
}

// Interface para o formato PFUS3
export interface CronogramaPFUS3 {
  Id: string;
  Id_exclusiva: string;
  Nível_da_estrutura_de_tópicos: string;
  EDT: string;
  Nome: string;
  Porcentagem_Prev_Real: string;
  Porcentagem_Prev_LB: string;
  Duração: string;
  Início: string;
  Término: string;
  Início_da_Linha_de_Base: string;
  Término_da_linha_de_base: string;
  Área: string;
  Responsável_da_Tarefa: string;
  Dashboard: string;
  Desvio_LB: string;
}

// Interface para representar um ativo da usina
export interface AtivoUsina {
  id: string;
  nome: string;
  area: string;
  edt: string;
  tipo: string;
  subatividades: ProcessedCronogramaActivity[];
  percentualMedio: number;
  status: string;
  dataInicio: string;
  dataFim: string;
  // Novas propriedades para estrutura hierárquica
  faseId?: string;
  faseNome?: string;
  nivel?: number;
  totalSubatividades?: number;
  subatividadesConcluidas?: number;
  progresso?: number;
}

// Função para determinar o status de uma atividade
function determineActivityStatus(row: CronogramaPFUS3): string {
  const percentual = parseFloat(
    row.Porcentagem_Prev_Real?.replace(',', '.') || '0'
  );
  const endDate = new Date(row['Término']);
  const today = new Date();

  if (percentual >= 100) return 'concluida';
  if (endDate < today && percentual < 100) return 'atrasada';
  if (percentual > 0) return 'em-andamento';
  return 'pendente';
}

// Função para identificar frentes de trabalho baseada nos níveis hierárquicos do PFUS3
export const identificarFrentesDeTrabalho = (
  rows: CronogramaPFUS3[]
): AtivoUsina[] => {
  console.log(
    '🏭 Identificando frentes de trabalho baseadas nos níveis hierárquicos do CSV...'
  );

  // Organizar por níveis conforme especificado pelo usuário:
  // Nível 2 = Fases (Parada, Manutenção, Partida)
  // Nível 3 = Frentes de trabalho (Ativos da usina)
  // Nível 4+ = Subatividades

  const fasesPrincipais = rows.filter(
    (row) => parseInt(row.Nível_da_estrutura_de_tópicos) === 2
  );

  const frentesDeTrabalho = rows.filter(
    (row) => parseInt(row.Nível_da_estrutura_de_tópicos) === 3
  );

  const subatividades = rows.filter(
    (row) => parseInt(row.Nível_da_estrutura_de_tópicos) >= 4
  );

  console.log(`� Estrutura encontrada:`);
  console.log(`  📋 Nível 2 (Fases): ${fasesPrincipais.length}`);
  console.log(`  🏭 Nível 3 (Frentes/Ativos): ${frentesDeTrabalho.length}`);
  console.log(`  🔧 Nível 4+ (Subatividades): ${subatividades.length}`);

  // Log das fases principais encontradas
  fasesPrincipais.forEach((fase) => {
    console.log(`    📋 Fase: "${fase.Nome}" (EDT: ${fase.EDT})`);
  });

  // Log das frentes de trabalho encontradas
  frentesDeTrabalho.forEach((frente) => {
    console.log(`    🏭 Frente: "${frente.Nome}" (EDT: ${frente.EDT})`);
  });

  // Agrupar ativos por frente de trabalho
  const ativosPorId: { [id: string]: AtivoUsina } = {};

  // Processar cada frente de trabalho (nível 3) como ativo da usina
  frentesDeTrabalho.forEach((frente) => {
    console.log(`🔍 Processando frente: "${frente.Nome}"`);

    // Encontrar todas as subatividades desta frente (níveis 4+)
    const subatividadesFrente = subatividades.filter((row) => {
      const edt = row.EDT;
      // Verificar se é subatividade desta frente (EDT começa com EDT da frente)
      return edt && frente.EDT && edt.startsWith(frente.EDT);
    });

    console.log(
      `  🔧 Subatividades encontradas: ${subatividadesFrente.length}`
    );

    // Converter subatividades para o formato ProcessedCronogramaActivity
    const subatividadesProcessadas: ProcessedCronogramaActivity[] =
      subatividadesFrente.map((activity, index) => {
        const percentual = parseFloat(
          activity.Porcentagem_Prev_Real?.replace(',', '.') || '0'
        );

        return {
          id: activity.Id || `${frente.Id}-sub-${index}`,
          name: activity.Nome || 'Atividade sem nome',
          duration: activity.Duração || '0 hrs',
          start: activity.Início || '',
          finish: activity.Término || '',
          responsible: activity.Responsável_da_Tarefa || '',
          status: determineActivityStatus(activity),
          area: activity.Área || frente.Área || 'Geral',
          edt: activity.EDT || '',
          percentualCompleto: percentual,
          nivel: parseInt(activity.Nível_da_estrutura_de_tópicos) || 4,
        };
      });

    // Calcular percentual médio das subatividades
    const percentualMedio =
      subatividadesProcessadas.length > 0
        ? subatividadesProcessadas.reduce(
            (sum, sub) => sum + (sub.percentualCompleto || 0),
            0
          ) / subatividadesProcessadas.length
        : parseFloat(frente.Porcentagem_Prev_Real?.replace(',', '.') || '0');

    // Determinar tipo de ativo baseado no nome da frente
    const tipoAtivo = determinarTipoAtivo(frente.Nome);

    // Encontrar a fase pai (nível 2) desta frente
    const fasePai = fasesPrincipais.find(
      (fase) =>
        frente.EDT.startsWith(fase.EDT) ||
        frente.Nome.toLowerCase().includes(
          fase.Nome.toLowerCase().split(' ')[0]
        )
    );

    console.log(
      `  📋 Fase pai identificada: ${fasePai?.Nome || 'Não encontrada'}`
    );

    // Criar o ativo da usina (frente de trabalho)
    const ativo: AtivoUsina = {
      id: frente.Id,
      nome: frente.Nome,
      area: frente.Área || 'Geral',
      edt: frente.EDT,
      tipo: tipoAtivo,
      faseId: fasePai?.Id || '',
      faseNome: fasePai?.Nome || 'Fase não identificada',
      nivel: 3, // Nível da frente de trabalho
      subatividades: subatividadesProcessadas,
      percentualMedio: Math.round(percentualMedio),
      status: determineActivityStatus(frente),
      dataInicio: frente.Início,
      dataFim: frente.Término,
      totalSubatividades: subatividadesProcessadas.length,
      subatividadesConcluidas: subatividadesProcessadas.filter(
        (sub) => (sub.percentualCompleto || 0) >= 100
      ).length,
      progresso: Math.round(percentualMedio),
    };

    console.log(
      `  ✅ Ativo criado: "${ativo.nome}" (${ativo.totalSubatividades} subatividades, ${ativo.progresso}% concluído)`
    );

    ativosPorId[frente.Id] = ativo;
  });

  const ativos = Object.values(ativosPorId);
  console.log(
    `✅ ${ativos.length} ativos da usina identificados com estrutura hierárquica completa`
  );

  // Log final da estrutura criada
  ativos.forEach((ativo) => {
    console.log(`🏭 Ativo: "${ativo.nome}" (Fase: ${ativo.faseNome})`);
    console.log(
      `    📊 ${ativo.totalSubatividades} subatividades, ${ativo.progresso}% concluído`
    );
    console.log(`    🎯 Tipo: ${ativo.tipo}, EDT: ${ativo.edt}`);
  });

  console.log(
    `✅ ${ativos.length} ativos da usina identificados com estrutura hierárquica completa`
  );

  return ativos;
};

// Função auxiliar para determinar o tipo do ativo baseado no nome
function determinarTipoAtivo(nome: string): string {
  const nomeMinusculo = nome.toLowerCase();

  if (nomeMinusculo.includes('precipitador')) return 'Precipitadores';
  if (nomeMinusculo.includes('caldeira')) return 'Caldeira';
  if (nomeMinusculo.includes('turbina')) return 'Turbina';
  if (nomeMinusculo.includes('gerador')) return 'Gerador';
  if (nomeMinusculo.includes('condensador')) return 'Condensador';
  if (nomeMinusculo.includes('bomba')) return 'Bombas';
  if (nomeMinusculo.includes('ventilador')) return 'Ventiladores';
  if (nomeMinusculo.includes('chaminé')) return 'Chaminés';
  if (nomeMinusculo.includes('transformador')) return 'Transformadores';
  if (nomeMinusculo.includes('sistema')) return 'Sistemas';
  if (nomeMinusculo.includes('espessador')) return 'Espessador';
  if (nomeMinusculo.includes('moagem')) return 'Moagem';
  if (nomeMinusculo.includes('alimentação')) return 'Alimentação';
  if (nomeMinusculo.includes('forno')) return 'Forno';

  return 'Outros';
}

export const processarCronogramaOperacional = (
  csvText: string
): Promise<ProcessedCronograma> => {
  return new Promise((resolve, reject) => {
    try {
      // Verificar cache primeiro
      const cacheKey = 'pfus3_processed';
      const cached = cacheManager.get(cacheKey, csvText);
      if (cached) {
        console.log('✅ Dados recuperados do cache');
        resolve(cached);
        return;
      }

      console.log('🔄 Processando CSV PFUS3 (não encontrado no cache)...');
    } catch (error) {
      console.error('❌ Erro ao verificar cache:', error);
    }

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';', // CSV usa ponto e vírgula
      encoding: 'UTF-8', // Mudança para UTF-8
      transformHeader: (header) => {
        // Normalizar headers com caracteres especiais
        const normalizedHeader = header
          .trim()
          .replace(/[\u00A0\uFEFF]/g, '')
          .replace(
            /N�vel_da_estrutura_de_t�picos/g,
            'Nível_da_estrutura_de_tópicos'
          )
          .replace(/Dura��o/g, 'Duração')
          .replace(/In�cio/g, 'Início')
          .replace(/T�rmino/g, 'Término')
          .replace(/�rea/g, 'Área')
          .replace(/Respons�vel_da_Tarefa/g, 'Responsável_da_Tarefa');

        console.log(
          `📝 Header normalizado: "${header}" → "${normalizedHeader}"`
        );
        return normalizedHeader;
      },
      complete: async (results) => {
        try {
          console.log('🔍 Iniciando processamento do CSV PFUS3...');
          console.log('📊 Resultados do Papa Parse:', results);

          const data = results.data as CronogramaPFUS3[];
          console.log('📊 Total de linhas parseadas:', data.length);

          // Validar dados antes do processamento
          console.log('🔍 Validando estrutura dos dados...');
          const validation = CSVValidator.validatePFUS3(data);

          if (!validation.isValid) {
            console.error('❌ Dados inválidos encontrados:');
            validation.errors.forEach((error) => console.error(`  - ${error}`));
            throw new Error(
              `Dados CSV inválidos: ${validation.errors.join('; ')}`
            );
          }

          if (validation.warnings.length > 0) {
            console.warn('⚠️ Avisos encontrados:');
            validation.warnings.forEach((warning) =>
              console.warn(`  - ${warning}`)
            );
          }

          console.log('📈 Estatísticas da validação:', validation.stats);

          // Filtrar linhas válidas
          const validRows = data.filter(
            (row) => row.Id && row.Nome && row.EDT && row.Nome.trim() !== ''
          );
          console.log('✅ Linhas válidas filtradas:', validRows.length);

          if (validRows.length === 0) {
            console.error('❌ Nenhuma linha válida encontrada no CSV');
            throw new Error('Arquivo CSV não contém dados válidos');
          }

          // Extrair cronograma principal
          const cronogramaPrincipal = validRows.find(
            (row) =>
              row.Nome.toLowerCase().includes('cronograma') ||
              row.Nome.toLowerCase().includes('pfus3') ||
              row.Nome.toLowerCase().includes('parada')
          );

          const metadata = {
            titulo: cronogramaPrincipal?.Nome || 'Cronograma Operacional PFUS3',
            dataInicio: cronogramaPrincipal?.['Início'] || '',
            dataFim: cronogramaPrincipal?.['Término'] || '',
            duracaoTotal: cronogramaPrincipal?.['Duração'] || '',
          };

          // Separar por fases baseado no EDT
          const preparacaoRows = validRows.filter(
            (row) =>
              row.EDT?.startsWith('1.1') ||
              row.EDT?.startsWith('1.2') ||
              row.EDT?.startsWith('1.3') ||
              row.EDT?.startsWith('1.4') ||
              row.EDT?.startsWith('1.5') ||
              row.EDT?.startsWith('1.6') ||
              row.Nome.toLowerCase().includes('preparação') ||
              row.Nome.toLowerCase().includes('preparacao') ||
              row.Nome.toLowerCase().includes('mobilização') ||
              row.Nome.toLowerCase().includes('mobilizacao') ||
              row.Nome.toLowerCase().includes('planejamento')
          );

          const paradaRows = validRows.filter(
            (row) =>
              row.EDT?.startsWith('1.7') ||
              row.Nome.toLowerCase().includes('parada') ||
              row.Nome.toLowerCase().includes('procedimento')
          );

          const manutencaoRows = validRows.filter(
            (row) =>
              row.EDT?.startsWith('1.8') ||
              row.Nome.toLowerCase().includes('manutenção') ||
              row.Nome.toLowerCase().includes('manutencao')
          );

          const partidaRows = validRows.filter(
            (row) =>
              row.EDT?.startsWith('1.9') ||
              row.Nome.toLowerCase().includes('partida') ||
              row.Nome.toLowerCase().includes('teste')
          );

          // Debug: mostrar quantas atividades foram encontradas para cada fase
          console.log('📋 Atividades por fase:');
          console.log('  🟦 Preparação:', preparacaoRows.length);
          console.log('  🟥 Parada:', paradaRows.length);
          console.log('  🟧 Manutenção:', manutencaoRows.length);
          console.log('  🟩 Partida:', partidaRows.length);

          if (
            preparacaoRows.length === 0 &&
            paradaRows.length === 0 &&
            manutencaoRows.length === 0 &&
            partidaRows.length === 0
          ) {
            console.warn(
              '⚠️ Nenhuma atividade encontrada para as fases conhecidas'
            );
            console.log(
              '📊 Amostra de EDTs encontrados:',
              validRows.slice(0, 10).map((r) => r.EDT)
            );
          }
          console.log('🔍 PFUS3 - Atividades por fase:');
          console.log(`📋 Preparação: ${preparacaoRows.length} atividades`);
          console.log(`⏹️ Parada: ${paradaRows.length} atividades`);
          console.log(`🔨 Manutenção: ${manutencaoRows.length} atividades`);
          console.log(`▶️ Partida: ${partidaRows.length} atividades`);

          // Debug: mostrar exemplos de EDTs encontrados
          console.log('📊 Exemplos de EDTs por fase:');
          console.log(
            'Preparação EDTs:',
            preparacaoRows.slice(0, 3).map((r) => r.EDT)
          );
          console.log(
            'Parada EDTs:',
            paradaRows.slice(0, 3).map((r) => r.EDT)
          );
          console.log(
            'Manutenção EDTs:',
            manutencaoRows.slice(0, 3).map((r) => r.EDT)
          );
          console.log(
            'Partida EDTs:',
            partidaRows.slice(0, 3).map((r) => r.EDT)
          );

          const phases: Phase[] = [
            createPhase(
              'preparacao',
              'Preparação PFUS3',
              'Planejamento e preparação para a parada - Cronograma PFUS3 2025',
              '📋',
              'text-blue-600',
              'bg-blue-50',
              'border-blue-200',
              preparacaoRows
            ),
            createPhase(
              'parada',
              'Parada',
              'Procedimentos de parada da usina',
              '⏹️',
              'text-red-600',
              'bg-red-50',
              'border-red-200',
              paradaRows
            ),
            createPhase(
              'manutencao',
              'Manutenção',
              'Atividades de manutenção',
              '🔨',
              'text-orange-600',
              'bg-orange-50',
              'border-orange-200',
              manutencaoRows
            ),
            createPhase(
              'partida',
              'Partida',
              'Procedimentos de partida da usina',
              '▶️',
              'text-green-600',
              'bg-green-50',
              'border-green-200',
              partidaRows
            ),
          ];

          const result = {
            phases,
            metadata,
          };

          // Salvar no cache
          try {
            cacheManager.set('pfus3_processed', csvText, result);
          } catch (cacheError) {
            console.warn('⚠️ Erro ao salvar no cache:', cacheError);
          }

          resolve(result);
        } catch (error) {
          console.error('Erro ao processar formato PFUS3:', error);
          reject(error);
        }
      },
      error: (error: any) => {
        console.error('Erro no Papa Parse (PFUS3):', error);
        reject(error);
      },
    });
  });
};

function createPhase(
  id: PhaseType,
  name: string,
  description: string,
  icon: string,
  color: string,
  bgColor: string,
  borderColor: string,
  rows: CronogramaPFUS3[]
): Phase {
  const completedCount = rows.filter(
    (row) =>
      row.Porcentagem_Prev_Real === '100' ||
      row.Nome.toLowerCase().includes('concluída') ||
      row.Nome.toLowerCase().includes('finalizada')
  ).length;

  const progress =
    rows.length > 0 ? Math.round((completedCount / rows.length) * 100) : 0;

  const delayedCount = rows.filter(
    (row) =>
      parseFloat(row.Porcentagem_Prev_Real?.replace(',', '.') || '0') < 100 &&
      new Date(row['Término']) < new Date()
  ).length;

  const criticalCount = rows.filter(
    (row) =>
      row.Nome.toLowerCase().includes('crítica') ||
      row.Nome.toLowerCase().includes('bloqueio')
  ).length;

  const startDate = getEarliestDate(rows);
  const endDate = getLatestDate(rows);
  const estimatedDuration = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  // Processar atividades individuais do CSV
  const processedActivities: ProcessedCronogramaActivity[] = rows.map(
    (row, index) => ({
      id: row.Id || `${id}-${index}`,
      name: row.Nome,
      duration: row.Duração || '1 day',
      start: row['Início'] || new Date().toISOString().split('T')[0],
      finish: row['Término'] || new Date().toISOString().split('T')[0],
      responsible: row['Responsável_da_Tarefa'] || 'Não definido',
      status: determineActivityStatus(row),
      area: row['Área'] || 'Geral',
      edt: row.EDT || '',
      percentualCompleto: parseFloat(
        row.Porcentagem_Prev_Real?.replace(',', '.') || '0'
      ),
    })
  );

  // Identificar e organizar frentes de trabalho (ativos da usina) automaticamente
  const ativosIdentificados = identificarFrentesDeTrabalho(rows);

  console.log(
    `📋 Fase ${name}: ${processedActivities.length} atividades processadas`
  );
  console.log(
    `🏭 Fase ${name}: ${ativosIdentificados.length} ativos identificados`
  );
  const uniqueAreas = Array.from(
    new Set(processedActivities.map((a) => a.area).filter(Boolean))
  );
  const uniqueEdts = Array.from(
    new Set(processedActivities.map((a) => a.edt).filter(Boolean))
  ).slice(0, 5);
  console.log('🔍 Áreas encontradas:', uniqueAreas);
  console.log('📊 EDTs encontrados:', uniqueEdts);

  return {
    id,
    name,
    description,
    icon,
    color,
    bgColor,
    borderColor,
    progress,
    activities: rows.length,
    completedActivities: completedCount,
    delayedActivities: delayedCount,
    criticalActivities: criticalCount,
    onTimeActivities: rows.length - delayedCount - criticalCount,
    advancedActivities: 0,
    startDate,
    endDate,
    estimatedDuration,
    estimatedEnd: endDate.toLocaleDateString('pt-BR'),
    daysRemaining,
    totalTasks: rows.length,
    inProgressTasks: rows.length - completedCount,
    pendingTasks: rows.length - completedCount,
    status: getPhaseStatus(rows),
    categories: [],
    processedActivities: processedActivities, // Incluir atividades processadas
    ativosIdentificados: ativosIdentificados, // Incluir ativos da usina identificados
  };
}

function getPhaseStatus(
  rows: CronogramaPFUS3[]
): 'not-started' | 'in-progress' | 'completed' {
  const completed = rows.filter(
    (row) =>
      row.Porcentagem_Prev_Real === '100' ||
      row.Nome.toLowerCase().includes('concluída') ||
      row.Nome.toLowerCase().includes('finalizada')
  ).length;

  if (completed === 0) return 'not-started';
  if (completed === rows.length) return 'completed';
  return 'in-progress';
}

function getEarliestDate(rows: CronogramaPFUS3[]): Date {
  const dates = rows
    .map((row) => new Date(row['Início']))
    .filter((date) => !isNaN(date.getTime()));
  return dates.length > 0
    ? new Date(Math.min(...dates.map((d) => d.getTime())))
    : new Date();
}

function getLatestDate(rows: CronogramaPFUS3[]): Date {
  const dates = rows
    .map((row) => new Date(row['Término']))
    .filter((date) => !isNaN(date.getTime()));
  return dates.length > 0
    ? new Date(Math.max(...dates.map((d) => d.getTime())))
    : new Date();
}
