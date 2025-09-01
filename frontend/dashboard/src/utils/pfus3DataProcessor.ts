import { PFUS3ProcessedData, PFUS3PhaseData } from '../types/PFUS3Types';

/**
 * Processador PFUS3 simplificado
 */
export class PFUS3DataProcessor {
  static processPFUS3Data(csvContent: string): PFUS3ProcessedData {
    console.log('🔄 Processando dados PFUS3...');

    try {
      const lines = csvContent.split('\n').filter((line) => line.trim());
      const header = lines[0];
      const separator = header.includes(';') ? ';' : ',';

      console.log('📊 Linhas:', lines.length, 'Separador:', separator);

      const activities: PFUS3PhaseData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const columns = this.parseCSVLine(lines[i], separator);

        if (columns.length >= 5 && columns[1]?.trim()) {
          const activity: PFUS3PhaseData = {
            id: columns[0] || `${i}`,
            idExclusiva: columns[0] || `${i}`,
            nivel: 0,
            edt: columns[3] || '',
            nome: columns[1].trim(),
            progressoReal: this.parsePercentage(columns[2] || '0'),
            progressoBaseline: 0,
            duracao: '',
            inicio: '',
            termino: '',
            inicioBaseline: '',
            terminoBaseline: '',
            area: this.extractArea(columns[1]),
            responsavel: 'Não definido',
            dashboard: 'Geral',
            desvioBaseline: 0,
          };

          if (activity.nome && !activity.nome.includes('---')) {
            activities.push(activity);
          }
        }
      }

      console.log('✅ Atividades processadas:', activities.length);

      return this.buildProcessedData(activities);
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      throw error;
    }
  }

  static parseCSVLine(line: string, separator: string): string[] {
    return line.split(separator).map((col) => col.trim().replace(/"/g, ''));
  }

  static parsePercentage(str: string): number {
    const cleaned = str.replace(/[%\s]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), 100);
  }

  static extractArea(nome: string): string {
    if (!nome) return 'Geral';

    if (
      nome.toLowerCase().includes('preparação') ||
      nome.toLowerCase().includes('preparacao')
    ) {
      return 'Preparação';
    }
    if (
      nome.toLowerCase().includes('mecânica') ||
      nome.toLowerCase().includes('mecanica')
    ) {
      return 'Mecânica';
    }
    if (
      nome.toLowerCase().includes('elétrica') ||
      nome.toLowerCase().includes('eletrica')
    ) {
      return 'Elétrica';
    }
    if (
      nome.toLowerCase().includes('instrumentação') ||
      nome.toLowerCase().includes('instrumentacao')
    ) {
      return 'Instrumentação';
    }

    return 'Geral';
  }

  static buildProcessedData(activities: PFUS3PhaseData[]): PFUS3ProcessedData {
    const preparacao = activities.filter(
      (a) =>
        a.nome.toLowerCase().includes('preparação') ||
        a.nome.toLowerCase().includes('preparacao') ||
        a.area === 'Preparação'
    );

    const manutencao = activities.filter(
      (a) =>
        a.nome.toLowerCase().includes('manutenção') ||
        a.nome.toLowerCase().includes('manutencao') ||
        a.area !== 'Preparação'
    );

    return {
      geral: {
        progressoGeral:
          activities.length > 0
            ? activities.reduce((sum, a) => sum + a.progressoReal, 0) /
              activities.length
            : 0,
        inicioProjetado: '',
        terminoProjetado: '',
        duracaoTotal: `${activities.length} atividades`,
      },
      fases: {
        preparacao,
        corteProdução: [],
        blackouts: [],
        procedimentosParada: [],
        manutencao,
        procedimentosPartida: [],
      },
      areas: this.buildAreas(activities),
      resumoKPIs: this.buildKPIs(activities),
    };
  }

  static buildAreas(activities: PFUS3PhaseData[]) {
    const areas: any = {};

    activities.forEach((activity) => {
      const areaName = activity.area;
      if (!areas[areaName]) {
        areas[areaName] = {
          nome: areaName,
          atividades: [],
          progressoMedio: 0,
          responsaveis: [],
        };
      }
      areas[areaName].atividades.push(activity);
    });

    Object.keys(areas).forEach((areaName) => {
      const area = areas[areaName];
      area.progressoMedio =
        area.atividades.length > 0
          ? area.atividades.reduce(
              (sum: number, a: any) => sum + a.progressoReal,
              0
            ) / area.atividades.length
          : 0;
    });

    return areas;
  }

  static buildKPIs(activities: PFUS3PhaseData[]) {
    const total = activities.length;
    const concluidas = activities.filter((a) => a.progressoReal === 100).length;
    const emAndamento = activities.filter(
      (a) => a.progressoReal > 0 && a.progressoReal < 100
    ).length;
    const pendentes = activities.filter((a) => a.progressoReal === 0).length;

    return {
      totalAtividades: total,
      atividadesConcluidas: concluidas,
      atividadesEmAndamento: emAndamento,
      atividadesPendentes: pendentes,
      progressoGeralReal:
        total > 0
          ? activities.reduce((sum, a) => sum + a.progressoReal, 0) / total
          : 0,
      progressoGeralBaseline: 0,
      desvioMedio: 0,
      areasComProblemas: [],
    };
  }

  static saveToLocalStorage(data: PFUS3ProcessedData): void {
    try {
      // Carrega dados existentes para mesclagem
      const existing = this.loadFromLocalStorage();
      let finalData = data;

      if (existing) {
        console.log('🔄 Mesclando dados...');
        finalData = this.mergeData(existing, data);
      }

      localStorage.setItem('pfus3_data', JSON.stringify(finalData));
      console.log('✅ Dados salvos no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
    }
  }

  static loadFromLocalStorage(): PFUS3ProcessedData | null {
    try {
      const stored = localStorage.getItem('pfus3_data');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('❌ Erro ao carregar:', error);
      return null;
    }
  }

  static mergeData(
    existing: PFUS3ProcessedData,
    newData: PFUS3ProcessedData
  ): PFUS3ProcessedData {
    const hasPreparacaoNew = newData.fases.preparacao.length > 0;
    const hasOtherPhasesNew = newData.fases.manutencao.length > 0;

    return {
      geral: newData.geral,
      fases: {
        preparacao: hasPreparacaoNew
          ? newData.fases.preparacao
          : existing.fases.preparacao,
        corteProdução: hasOtherPhasesNew
          ? newData.fases.corteProdução
          : existing.fases.corteProdução,
        blackouts: hasOtherPhasesNew
          ? newData.fases.blackouts
          : existing.fases.blackouts,
        procedimentosParada: hasOtherPhasesNew
          ? newData.fases.procedimentosParada
          : existing.fases.procedimentosParada,
        manutencao: hasOtherPhasesNew
          ? newData.fases.manutencao
          : existing.fases.manutencao,
        procedimentosPartida: hasOtherPhasesNew
          ? newData.fases.procedimentosPartida
          : existing.fases.procedimentosPartida,
      },
      areas: { ...existing.areas, ...newData.areas },
      resumoKPIs: newData.resumoKPIs,
    };
  }
}
