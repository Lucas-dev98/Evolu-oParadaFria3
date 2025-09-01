export interface ActivityItem {
  id: string;
  ordem: number;
  edt: string;
  nivel: number;
  nome: string;
  dashboard: string;
  percentualPlanejado: number;
  percentualRealizado: number;
  children?: ActivityItem[];
}

export interface PhaseData {
  id: string;
  name: string;
  edt: string;
  percentualPlanejado: number;
  percentualRealizado: number;
  activities: ActivityItem[];
}

export class CSVPhaseProcessor {
  private parseCSVLine(line: string): ActivityItem | null {
    const parts = line.split(';');
    if (parts.length < 8) return null;

    const [id, ordem, edt, nivel, nome, dashboard, planejado, realizado] =
      parts;

    return {
      id: id.trim(),
      ordem: parseInt(ordem.trim()),
      edt: edt.trim(),
      nivel: parseInt(nivel.trim()),
      nome: nome.trim(),
      dashboard: dashboard.trim(),
      percentualPlanejado: parseFloat(planejado.replace(',', '.')) || 0,
      percentualRealizado: parseFloat(realizado.replace(',', '.')) || 0,
    };
  }

  private buildHierarchy(items: ActivityItem[]): ActivityItem[] {
    const result: ActivityItem[] = [];
    const stack: ActivityItem[] = [];

    for (const item of items) {
      // Remove items from stack until we find the parent level
      while (stack.length > 0 && stack[stack.length - 1].nivel >= item.nivel) {
        stack.pop();
      }

      // If we have a parent, add this item as its child
      if (stack.length > 0) {
        const parent = stack[stack.length - 1];
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(item);
      } else {
        // This is a root item
        result.push(item);
      }

      // Add this item to the stack
      stack.push(item);
    }

    return result;
  }

  public processCSVData(csvContent: string): PhaseData[] {
    const lines = csvContent.split('\n').filter((line) => line.trim());
    const activities: ActivityItem[] = [];

    // Parse all CSV lines
    for (const line of lines) {
      const activity = this.parseCSVLine(line);
      if (activity) {
        activities.push(activity);
      }
    }

    // Sort by ordem to maintain proper order
    activities.sort((a, b) => a.ordem - b.ordem);

    // Separate activities by phase
    const preparacaoActivities = activities.filter((a) =>
      a.edt.startsWith('1.1')
    );
    const paradaActivities = activities.filter((a) => a.edt.startsWith('1.2'));
    const manutencaoActivities = activities.filter((a) =>
      a.edt.startsWith('1.3')
    );
    const partidaActivities = activities.filter((a) => a.edt.startsWith('1.4'));

    const phases: PhaseData[] = [];

    // Process Preparação phase
    if (preparacaoActivities.length > 0) {
      const hierarchy = this.buildHierarchy(preparacaoActivities);
      const totalPlanejado = this.calculateAverage(
        preparacaoActivities,
        'percentualPlanejado'
      );
      const totalRealizado = this.calculateAverage(
        preparacaoActivities,
        'percentualRealizado'
      );

      phases.push({
        id: 'preparacao',
        name: 'Preparação',
        edt: '1.1',
        percentualPlanejado: totalPlanejado,
        percentualRealizado: totalRealizado,
        activities: hierarchy,
      });
    }

    // Process Parada phase
    if (paradaActivities.length > 0) {
      const hierarchy = this.buildHierarchy(paradaActivities);
      const totalPlanejado = this.calculateAverage(
        paradaActivities,
        'percentualPlanejado'
      );
      const totalRealizado = this.calculateAverage(
        paradaActivities,
        'percentualRealizado'
      );

      phases.push({
        id: 'parada',
        name: 'Parada',
        edt: '1.2',
        percentualPlanejado: totalPlanejado,
        percentualRealizado: totalRealizado,
        activities: hierarchy,
      });
    }

    // Process Manutenção phase
    if (manutencaoActivities.length > 0) {
      const hierarchy = this.buildHierarchy(manutencaoActivities);
      const totalPlanejado = this.calculateAverage(
        manutencaoActivities,
        'percentualPlanejado'
      );
      const totalRealizado = this.calculateAverage(
        manutencaoActivities,
        'percentualRealizado'
      );

      phases.push({
        id: 'manutencao',
        name: 'Manutenção',
        edt: '1.3',
        percentualPlanejado: totalPlanejado,
        percentualRealizado: totalRealizado,
        activities: hierarchy,
      });
    }

    // Process Partida phase
    if (partidaActivities.length > 0) {
      const hierarchy = this.buildHierarchy(partidaActivities);
      const totalPlanejado = this.calculateAverage(
        partidaActivities,
        'percentualPlanejado'
      );
      const totalRealizado = this.calculateAverage(
        partidaActivities,
        'percentualRealizado'
      );

      phases.push({
        id: 'partida',
        name: 'Partida',
        edt: '1.4',
        percentualPlanejado: totalPlanejado,
        percentualRealizado: totalRealizado,
        activities: hierarchy,
      });
    }

    return phases;
  }

  private calculateAverage(
    activities: ActivityItem[],
    field: 'percentualPlanejado' | 'percentualRealizado'
  ): number {
    if (activities.length === 0) return 0;
    const sum = activities.reduce((acc, activity) => acc + activity[field], 0);
    return Math.round((sum / activities.length) * 100) / 100;
  }

  public getPhasesByArea(phases: PhaseData[]): {
    [areaName: string]: PhaseData[];
  } {
    const areaGroups: { [areaName: string]: PhaseData[] } = {};

    phases.forEach((phase) => {
      // Group by main area names (extract from activity names)
      const areaNames = this.extractAreaNames(phase.activities);

      areaNames.forEach((areaName) => {
        if (!areaGroups[areaName]) {
          areaGroups[areaName] = [];
        }
        areaGroups[areaName].push(phase);
      });
    });

    return areaGroups;
  }

  private extractAreaNames(activities: ActivityItem[]): string[] {
    const areaNames = new Set<string>();

    const extractFromActivity = (activity: ActivityItem) => {
      // Extract area names from activity names
      const name = activity.nome.toLowerCase();

      // Common industrial areas
      if (name.includes('sinterização') || name.includes('sinter'))
        areaNames.add('Sinterização');
      if (name.includes('britagem') || name.includes('britador'))
        areaNames.add('Britagem');
      if (name.includes('peneiramento') || name.includes('peneira'))
        areaNames.add('Peneiramento');
      if (name.includes('torre') && name.includes('resfriamento'))
        areaNames.add('Torres de Resfriamento');
      if (name.includes('mistura') || name.includes('misturador'))
        areaNames.add('Mistura');
      if (name.includes('briquetagem') || name.includes('briquete'))
        areaNames.add('Briquetagem');
      if (name.includes('precipitador')) areaNames.add('Precipitadores');
      if (name.includes('ventilador')) areaNames.add('Ventiladores');
      if (name.includes('pátio')) areaNames.add('Pátio');
      if (name.includes('elétrica') || name.includes('eletrica'))
        areaNames.add('Elétrica');
      if (name.includes('instrumentação') || name.includes('instrumentacao'))
        areaNames.add('Instrumentação');

      // If no specific area found, use generic
      if (areaNames.size === 0) {
        areaNames.add('Geral');
      }

      // Process children
      if (activity.children) {
        activity.children.forEach(extractFromActivity);
      }
    };

    activities.forEach(extractFromActivity);
    return Array.from(areaNames);
  }
}

export const csvPhaseProcessor = new CSVPhaseProcessor();
