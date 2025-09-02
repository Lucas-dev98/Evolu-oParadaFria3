import { CronogramaPFUS3 } from './cronogramaOperacionalProcessorPFUS3';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    fases: number;
    ativos: number;
    subatividades: number;
  };
}

export class CSVValidator {
  static validatePFUS3(data: CronogramaPFUS3[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      stats: {
        totalRows: data.length,
        validRows: 0,
        invalidRows: 0,
        fases: 0,
        ativos: 0,
        subatividades: 0,
      },
    };

    // Validações obrigatórias
    const requiredFields = [
      'Id',
      'Nome',
      'EDT',
      'Nível_da_estrutura_de_tópicos',
    ];

    data.forEach((row, index) => {
      let isRowValid = true;
      const rowErrors: string[] = [];

      // Verificar campos obrigatórios
      requiredFields.forEach((field) => {
        if (
          !row[field as keyof CronogramaPFUS3] ||
          String(row[field as keyof CronogramaPFUS3]).trim() === ''
        ) {
          rowErrors.push(`Campo obrigatório "${field}" vazio`);
          isRowValid = false;
        }
      });

      // Validar nível hierárquico
      const nivel = parseInt(row.Nível_da_estrutura_de_tópicos);
      if (isNaN(nivel) || nivel < 0 || nivel > 10) {
        rowErrors.push(
          `Nível hierárquico inválido: ${row.Nível_da_estrutura_de_tópicos}`
        );
        isRowValid = false;
      }

      // Validar EDT
      if (row.EDT && !/^[\d.]+$/.test(row.EDT)) {
        result.warnings.push(
          `Linha ${index + 1}: EDT com formato não padrão: "${row.EDT}"`
        );
      }

      // Validar percentual
      const percentual = row.Porcentagem_Prev_Real?.replace(',', '.');
      if (
        percentual &&
        (isNaN(parseFloat(percentual)) ||
          parseFloat(percentual) < 0 ||
          parseFloat(percentual) > 100)
      ) {
        result.warnings.push(
          `Linha ${index + 1}: Percentual inválido: "${row.Porcentagem_Prev_Real}"`
        );
      }

      // Validar datas
      if (row.Início && isNaN(new Date(row.Início).getTime())) {
        result.warnings.push(
          `Linha ${index + 1}: Data de início inválida: "${row.Início}"`
        );
      }

      if (row.Término && isNaN(new Date(row.Término).getTime())) {
        result.warnings.push(
          `Linha ${index + 1}: Data de término inválida: "${row.Término}"`
        );
      }

      // Contabilizar estatísticas
      if (isRowValid) {
        result.stats.validRows++;

        if (nivel === 2) result.stats.fases++;
        else if (nivel === 3) result.stats.ativos++;
        else if (nivel >= 4) result.stats.subatividades++;
      } else {
        result.stats.invalidRows++;
        result.errors.push(`Linha ${index + 1}: ${rowErrors.join(', ')}`);
      }
    });

    // Validações estruturais
    if (result.stats.fases === 0) {
      result.errors.push('Nenhuma fase (nível 2) encontrada no cronograma');
      result.isValid = false;
    }

    if (result.stats.ativos === 0) {
      result.warnings.push('Nenhum ativo (nível 3) encontrado no cronograma');
    }

    // Verificar se há dados de manutenção e partida
    const hasManutencao = data.some((row) => row.EDT?.startsWith('1.8'));
    const hasPartida = data.some((row) => row.EDT?.startsWith('1.9'));

    if (!hasManutencao) {
      result.warnings.push(
        'Não foram encontrados dados de Manutenção (EDT 1.8.X)'
      );
    }

    if (!hasPartida) {
      result.warnings.push(
        'Não foram encontrados dados de Partida (EDT 1.9.X)'
      );
    }

    // Sugestões
    if (result.stats.invalidRows > 0) {
      result.suggestions.push(
        'Revisar linhas com dados inválidos antes do processamento'
      );
    }

    if (result.warnings.length > 5) {
      result.suggestions.push(
        'Considerar revisar a qualidade dos dados do arquivo CSV'
      );
    }

    result.isValid = result.errors.length === 0;

    return result;
  }

  static generateValidationReport(validation: ValidationResult): string {
    let report = '📊 RELATÓRIO DE VALIDAÇÃO DO CSV PFUS3\n';
    report += '='.repeat(50) + '\n\n';

    // Estatísticas
    report += '📈 ESTATÍSTICAS:\n';
    report += `   Total de linhas: ${validation.stats.totalRows}\n`;
    report += `   Linhas válidas: ${validation.stats.validRows}\n`;
    report += `   Linhas inválidas: ${validation.stats.invalidRows}\n`;
    report += `   Fases encontradas: ${validation.stats.fases}\n`;
    report += `   Ativos encontrados: ${validation.stats.ativos}\n`;
    report += `   Subatividades encontradas: ${validation.stats.subatividades}\n\n`;

    // Resultado geral
    report += `✅ RESULTADO: ${validation.isValid ? 'VÁLIDO' : 'INVÁLIDO'}\n\n`;

    // Erros
    if (validation.errors.length > 0) {
      report += '❌ ERROS CRÍTICOS:\n';
      validation.errors.forEach((error) => {
        report += `   • ${error}\n`;
      });
      report += '\n';
    }

    // Warnings
    if (validation.warnings.length > 0) {
      report += '⚠️ AVISOS:\n';
      validation.warnings.forEach((warning) => {
        report += `   • ${warning}\n`;
      });
      report += '\n';
    }

    // Sugestões
    if (validation.suggestions.length > 0) {
      report += '💡 SUGESTÕES:\n';
      validation.suggestions.forEach((suggestion) => {
        report += `   • ${suggestion}\n`;
      });
    }

    return report;
  }
}
