export interface EventArea {
  id: number;
  name: string;
  category: string;
  capacity: number;
  currentOccupancy: number;
  evolution: EvolutionPoint[];
  status: string;
  temperature: number;
  humidity: number;
}

export interface EvolutionPoint {
  time: string;
  occupancy: number;
}

export interface DashboardSummary {
  totalAreas: number;
  totalCapacity: number;
  totalOccupancy: number;
  occupancyRate: number;
  areasByCategory: { [key: string]: EventArea[] };
  activeAreas: number;
  averageTemperature: string;
  averageHumidity: string;
}

export interface RealtimeData {
  id: number;
  name: string;
  currentOccupancy: number;
  capacity: number;
  temperature: number;
  humidity: number;
  lastUpdate: string;
}

export interface EvolutionData {
  name: string;
  data: {
    x: string;
    y: number;
  }[];
}
