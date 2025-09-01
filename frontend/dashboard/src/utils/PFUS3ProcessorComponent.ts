import { PFUS3ProcessedData } from '../types/PFUS3Types';
// Importa o processador original existente
import { PFUS3DataProcessor } from './pfus3DataProcessor';

/**
 * Componente principal para processamento de dados PFUS3
 * Atua como uma interface limpa para o processador existente
 */
export class PFUS3ProcessorComponent {
  /**
   * Processa dados PFUS3 a partir de conteúdo CSV
   * @param csvContent Conteúdo do arquivo CSV
   * @param fileName Nome do arquivo (opcional, para melhor detecção)
   * @returns Dados processados PFUS3
   */
  static processPFUS3Data(
    csvContent: string,
    fileName?: string
  ): PFUS3ProcessedData {
    console.log('🔄 [PFUS3ProcessorComponent] Iniciando processamento...');
    console.log('📁 Nome do arquivo:', fileName || 'não informado');

    // Delega para o processador original
    return PFUS3DataProcessor.processPFUS3Data(csvContent);
  }

  /**
   * Salva dados processados no localStorage com mesclagem
   * @param processedData Dados processados para salvar
   */
  static saveToLocalStorage(processedData: PFUS3ProcessedData): void {
    console.log(
      '💾 [PFUS3ProcessorComponent] Salvando dados no localStorage...'
    );
    PFUS3DataProcessor.saveToLocalStorage(processedData);
  }

  /**
   * Carrega dados do localStorage
   * @returns Dados PFUS3 ou null se não existir
   */
  static loadFromLocalStorage(): PFUS3ProcessedData | null {
    console.log(
      '📂 [PFUS3ProcessorComponent] Carregando dados do localStorage...'
    );
    return PFUS3DataProcessor.loadFromLocalStorage();
  }

  /**
   * Verifica se existem dados no localStorage
   * @returns true se existem dados
   */
  static hasDataInLocalStorage(): boolean {
    return localStorage.getItem('pfus3_data') !== null;
  }

  /**
   * Limpa dados do localStorage
   */
  static clearLocalStorage(): void {
    console.log(
      '🗑️ [PFUS3ProcessorComponent] Limpando dados do localStorage...'
    );
    localStorage.removeItem('pfus3_data');
  }

  /**
   * Processa e salva arquivo PFUS3 em uma operação
   * @param csvContent Conteúdo do arquivo CSV
   * @param fileName Nome do arquivo
   * @returns Dados processados
   */
  static processAndSave(
    csvContent: string,
    fileName?: string
  ): PFUS3ProcessedData {
    const processedData = this.processPFUS3Data(csvContent, fileName);
    this.saveToLocalStorage(processedData);
    return processedData;
  }

  /**
   * Obtém estatísticas dos dados armazenados
   */
  static getStorageStats() {
    const data = this.loadFromLocalStorage();
    if (!data) {
      return null;
    }

    const allActivities = [
      ...data.fases.preparacao,
      ...data.fases.corteProdução,
      ...data.fases.blackouts,
      ...data.fases.procedimentosParada,
      ...data.fases.manutencao,
      ...data.fases.procedimentosPartida,
    ];

    return {
      totalFases: Object.keys(data.fases).length,
      totalAtividades: allActivities.length,
      fasesComDados: Object.keys(data.fases).filter(
        (key) => data.fases[key as keyof typeof data.fases].length > 0
      ),
      totalAreas: Object.keys(data.areas).length,
      progressoGeral: data.resumoKPIs.progressoGeralReal,
      ultimaAtualizacao: new Date().toISOString(),
    };
  }
}
