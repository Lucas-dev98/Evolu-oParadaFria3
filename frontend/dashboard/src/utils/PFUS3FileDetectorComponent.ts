import { PFUS3FileMetadata } from '../types/PFUS3Types';

/**
 * Componente responsável por detectar o tipo de arquivo PFUS3 e suas características
 */
export class PFUS3FileDetectorComponent {
  /**
   * Detecta o tipo de arquivo PFUS3 baseado no conteúdo
   */
  static detectFileType(
    csvContent: string,
    fileName?: string
  ): PFUS3FileMetadata['type'] {
    const header = csvContent.split('\n')[0] || '';

    // Detecção por nome do arquivo
    if (fileName) {
      if (
        fileName.includes('290805') ||
        fileName.toLowerCase().includes('preparacao') ||
        fileName.toLowerCase().includes('preparação')
      ) {
        console.log('🔍 Tipo detectado por nome do arquivo: Preparação');
        return 'preparacao';
      }
      if (
        fileName.includes('250820') ||
        fileName.toLowerCase().includes('report')
      ) {
        console.log('🔍 Tipo detectado por nome do arquivo: Report');
        return 'report';
      }
    }

    // Detecção por conteúdo do cabeçalho
    const isPreparacaoFile =
      header.includes('ID,Nome da tarefa,% Complete') ||
      header.includes('Physical % Complete') ||
      csvContent.includes('Cronograma de Preparação - PFUS3') ||
      csvContent.includes('Cronograma Preparação - PFUS3') ||
      header.includes('Duration,Start,Finish');

    const isReportFile =
      header.includes('Id;Id_exclusiva;Nivel') ||
      header.includes('Id;Id_exclusiva;N�vel') ||
      csvContent.includes('Report PFUS3') ||
      header.includes('EDT;Nome;');

    if (isPreparacaoFile) {
      console.log('🔍 Tipo detectado por cabeçalho: Preparação');
      return 'preparacao';
    }

    if (isReportFile) {
      console.log('🔍 Tipo detectado por cabeçalho: Report');
      return 'report';
    }

    // Fallback: detecta pelo separador mais comum
    const semicolonCount = (header.match(/;/g) || []).length;
    const commaCount = (header.match(/,/g) || []).length;

    const detectedType = semicolonCount > commaCount ? 'report' : 'preparacao';
    console.log('🔍 Tipo detectado por separadores:', {
      pontoVirgula: semicolonCount,
      virgulas: commaCount,
      tipoDetectado: detectedType,
    });

    return detectedType;
  }

  /**
   * Detecta o separador usado no arquivo CSV
   */
  static detectSeparator(csvContent: string): ',' | ';' {
    const header = csvContent.split('\n')[0] || '';
    const semicolonCount = (header.match(/;/g) || []).length;
    const commaCount = (header.match(/,/g) || []).length;

    return semicolonCount > commaCount ? ';' : ',';
  }

  /**
   * Extrai metadados completos do arquivo
   */
  static extractFileMetadata(
    csvContent: string,
    fileName?: string
  ): PFUS3FileMetadata {
    const lines = csvContent.split('\n').filter((line) => line.trim());
    const type = this.detectFileType(csvContent, fileName);
    const separator = this.detectSeparator(csvContent);

    return {
      name: fileName || 'unknown',
      size: csvContent.length,
      type,
      lines: lines.length,
      separator,
    };
  }

  /**
   * Valida se o arquivo tem estrutura básica válida
   */
  static validateFileStructure(csvContent: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!csvContent || csvContent.trim().length === 0) {
      return { isValid: false, error: 'Arquivo está vazio' };
    }

    const lines = csvContent.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      return {
        isValid: false,
        error: 'Arquivo deve ter pelo menos cabeçalho e uma linha de dados',
      };
    }

    return { isValid: true };
  }
}
