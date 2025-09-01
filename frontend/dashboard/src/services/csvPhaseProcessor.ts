import Papa from 'papaparse';

// Interface for the CSV data structure (PFUS3 format)
export interface CSVActivity {
  Id: string;
  Id_exclusiva: number;
  Nivel_da_estrutura_de_topicos: number;
  EDT: string;
  Nome: string;
  Porcentagem_Prev_Real: number;
  Porcentagem_Prev_LB: number;
  Duracao: string;
  Inicio: string;
  Termino: string;
  Inicio_da_Linha_de_Base: string;
  Termino_da_linha_de_base: string;
  Area: string;
  Responsavel_da_Tarefa: string;
  Dashboard: string;
  Desvio_LB: number;
  children?: CSVActivity[];
}

// Interface for processed phase data
export interface ProcessedPhaseData {
  phases: {
    parada: {
      name: string;
      progress: number;
      activities: PhaseActivity[];
      totalTasks: number;
      completedTasks: number;
      estimatedEnd: string;
    };
    manutencao: {
      name: string;
      progress: number;
      activities: PhaseActivity[];
      totalTasks: number;
      completedTasks: number;
      estimatedEnd: string;
    };
    partida: {
      name: string;
      progress: number;
      activities: PhaseActivity[];
      totalTasks: number;
      completedTasks: number;
      estimatedEnd: string;
    };
  };
  lastUpdate: string;
  projectName: string;
}

export interface PhaseActivity {
  id: string;
  name: string;
  edt: string;
  level: number;
  dashboardIndicator: string;
  baselineProgress: number;
  realProgress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  category: string;
}

/**
 * Processes CSV data from PFBT1 format and extracts phase information
 */
export class CSVPhaseProcessor {
  /**
   * Parse CSV file and extract phase data
   */
  static async processCSVFile(file: File): Promise<ProcessedPhaseData> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const processedData = this.extractPhaseData(
              results.data as CSVActivity[]
            );
            resolve(processedData);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  /**
   * Extract and organize phase data from parsed CSV
   */
  private static extractPhaseData(data: CSVActivity[]): ProcessedPhaseData {
    // Find the main project name
    const projectName =
      data.find((row) => row.Nivel_da_estrutura_de_topicos === 0)?.Nome ||
      'Projeto PFBT1';

    // Separate data by phase based on EDT codes
    const paradaData = data.filter(
      (row) => row.EDT.startsWith('1.2') && row.EDT !== '1.2'
    );
    const manutencaoData = data.filter(
      (row) => row.EDT.startsWith('1.3') && row.EDT !== '1.3'
    );
    const partidaData = data.filter(
      (row) => row.EDT.startsWith('1.4') && row.EDT !== '1.4'
    );

    // Get main phase progress
    const paradaMain = data.find((row) => row.EDT === '1.2');
    const manutencaoMain = data.find((row) => row.EDT === '1.3');
    const partidaMain = data.find((row) => row.EDT === '1.4');

    return {
      phases: {
        parada: {
          name: 'Parada',
          progress: this.parseProgress(
            String(paradaMain?.Porcentagem_Prev_Real || 0)
          ),
          activities: this.processActivities(paradaData, 'parada'),
          totalTasks: paradaData.length,
          completedTasks: paradaData.filter(
            (row) => row.Porcentagem_Prev_Real === 100
          ).length,
          estimatedEnd: this.calculateEstimatedEnd('parada', paradaData),
        },
        manutencao: {
          name: 'Manutenção',
          progress: this.parseProgress(
            String(manutencaoMain?.Porcentagem_Prev_Real || 0)
          ),
          activities: this.processActivities(manutencaoData, 'manutencao'),
          totalTasks: manutencaoData.length,
          completedTasks: manutencaoData.filter(
            (row) => row.Porcentagem_Prev_Real === 100
          ).length,
          estimatedEnd: this.calculateEstimatedEnd(
            'manutencao',
            manutencaoData
          ),
        },
        partida: {
          name: 'Partida',
          progress: this.parseProgress(
            String(partidaMain?.Porcentagem_Prev_Real || 0)
          ),
          activities: this.processActivities(partidaData, 'partida'),
          totalTasks: partidaData.length,
          completedTasks: partidaData.filter(
            (row) => row.Porcentagem_Prev_Real === 100
          ).length,
          estimatedEnd: this.calculateEstimatedEnd('partida', partidaData),
        },
      },
      lastUpdate: new Date().toISOString(),
      projectName,
    };
  }

  /**
   * Process individual activities for a phase
   */
  private static processActivities(
    data: CSVActivity[],
    phaseType: string
  ): PhaseActivity[] {
    return data.map((row) => {
      const realProgress = row.Porcentagem_Prev_Real;
      const baselineProgress = row.Porcentagem_Prev_LB;

      return {
        id: String(row.Id_exclusiva),
        name: row.Nome,
        edt: row.EDT,
        level: row.Nivel_da_estrutura_de_topicos,
        dashboardIndicator: row.Dashboard,
        baselineProgress,
        realProgress,
        status: this.determineStatus(realProgress),
        category: this.extractCategory(row.Nome, row.EDT),
      };
    });
  }

  /**
   * Parse progress percentage from string format (handles comma decimal separator)
   */
  private static parseProgress(progressStr: string): number {
    if (!progressStr || progressStr.trim() === '') return 0;

    // Replace comma with dot for proper parsing
    const normalized = progressStr.replace(',', '.');
    const progress = parseFloat(normalized);

    return isNaN(progress) ? 0 : Math.round(progress * 100) / 100;
  }

  /**
   * Determine activity status based on progress
   */
  private static determineStatus(
    progress: number
  ): 'not-started' | 'in-progress' | 'completed' {
    if (progress === 0) return 'not-started';
    if (progress === 100) return 'completed';
    return 'in-progress';
  }

  /**
   * Extract category from activity name and EDT
   */
  private static extractCategory(name: string, edt: string): string {
    const nameLower = name.toLowerCase();

    // Common categories based on activity names
    if (nameLower.includes('elétrica') || nameLower.includes('eletrica'))
      return 'Elétrica';
    if (nameLower.includes('mecânica') || nameLower.includes('mecanica'))
      return 'Mecânica';
    if (nameLower.includes('refratário') || nameLower.includes('refratario'))
      return 'Refratário';
    if (
      nameLower.includes('instrumentação') ||
      nameLower.includes('instrumentacao')
    )
      return 'Instrumentação';
    if (nameLower.includes('civil') || nameLower.includes('estrutural'))
      return 'Civil/Estrutural';
    if (nameLower.includes('forno')) return 'Forno';
    if (nameLower.includes('grelha')) return 'Grelha';
    if (nameLower.includes('ventilador')) return 'Ventiladores';
    if (nameLower.includes('transportador') || nameLower.includes('correia'))
      return 'Transporte';
    if (nameLower.includes('silo')) return 'Silos';
    if (nameLower.includes('mistura')) return 'Mistura';
    if (nameLower.includes('briquete')) return 'Briquetagem';
    if (nameLower.includes('secagem') || nameLower.includes('secador'))
      return 'Secagem';
    if (nameLower.includes('peneira')) return 'Peneiramento';
    if (nameLower.includes('precipitador')) return 'Precipitadores';
    if (nameLower.includes('bloqueio') || nameLower.includes('desbloqueio'))
      return 'Bloqueio/Segurança';
    if (nameLower.includes('limpeza')) return 'Limpeza';
    if (nameLower.includes('teste') || nameLower.includes('calibra'))
      return 'Testes/Calibração';

    // Fallback based on EDT structure
    const edtParts = edt.split('.');
    if (edtParts.length >= 3) {
      const subSection = edtParts[2];
      return `Seção ${subSection}`;
    }

    return 'Geral';
  }

  /**
   * Calculate estimated end date based on current progress
   */
  private static calculateEstimatedEnd(
    phaseType: string,
    data: CSVActivity[]
  ): string {
    const totalActivities = data.length;
    const completedActivities = data.filter(
      (row) => row.Porcentagem_Prev_Real === 100
    ).length;
    const progressPercent =
      totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

    // Simple estimation based on current progress
    // This is a basic calculation - in real scenarios you'd use more sophisticated scheduling
    const baseDate = new Date();
    let estimatedDays = 0;

    switch (phaseType) {
      case 'parada':
        estimatedDays =
          progressPercent >= 95 ? 1 : Math.ceil((100 - progressPercent) / 10);
        break;
      case 'manutencao':
        estimatedDays =
          progressPercent >= 95 ? 2 : Math.ceil((100 - progressPercent) / 5);
        break;
      case 'partida':
        estimatedDays =
          progressPercent >= 95 ? 3 : Math.ceil((100 - progressPercent) / 8);
        break;
    }

    baseDate.setDate(baseDate.getDate() + estimatedDays);
    return baseDate.toLocaleDateString('pt-BR');
  }

  /**
   * Get summary statistics for all phases
   */
  static getProjectSummary(data: ProcessedPhaseData) {
    const phases = Object.values(data.phases);
    const totalTasks = phases.reduce((sum, phase) => sum + phase.totalTasks, 0);
    const totalCompleted = phases.reduce(
      (sum, phase) => sum + phase.completedTasks,
      0
    );
    const overallProgress =
      totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    return {
      overallProgress,
      totalTasks,
      totalCompleted,
      phases: phases.map((phase) => ({
        name: phase.name,
        progress: phase.progress,
        status:
          phase.progress === 100
            ? 'completed'
            : phase.progress > 0
              ? 'in-progress'
              : 'not-started',
      })),
    };
  }
}
