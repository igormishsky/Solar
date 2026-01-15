/**
 * Types for solar monitoring system data.
 * Used by useMonitoring hooks and related components.
 */

export interface SystemStatus {
  systemId: string;
  provider: 'solaredge' | 'enphase' | 'generic';
  status: 'active' | 'inactive' | 'error' | 'unknown';
  lastCommunication: string | null;
  currentPowerKw: number;
  todayEnergyKwh: number;
  lifetimeEnergyMwh: number;
  alerts: SystemAlert[];
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface HistoricalData {
  systemId: string;
  startDate: string;
  endDate: string;
  resolution: 'hourly' | 'daily' | 'weekly' | 'monthly';
  data: PerformanceData[];
  summary: {
    totalEnergyKwh: number;
    peakPowerKw: number;
    averagePowerKw: number;
    uptime: number;
  };
}

export interface PerformanceData {
  timestamp: string;
  powerKw: number;
  energyKwh: number;
  irradiance?: number;
  temperature?: number;
}

export interface MonitoredSystem {
  id: string;
  projectName: string;
  customerName: string;
  systemSizeKw: number | null;
  panelCount: number | null;
  inverterModel: string | null;
  estimatedAnnualProduction: number | null;
  activationDate: string | null;
  status: 'online' | 'offline' | 'warning';
  currentPowerKw: number;
  todayProductionKwh: number;
  monthProductionKwh: number;
  efficiency: number;
  monitoringConfig?: {
    provider: string;
    systemId: string;
  };
}

export interface MonitoringStats {
  totalSystemsOnline: number;
  totalSystemsOffline: number;
  totalSystemsWarning: number;
  totalCapacityKw: number;
  totalTodayProductionKwh: number;
  averageEfficiency: number;
}

export interface MonitoringConfig {
  provider: 'solaredge' | 'enphase' | 'generic';
  apiKey: string;
  siteId?: string;
  systemId?: string;
}

export type MonitoringResolution = 'hourly' | 'daily' | 'weekly' | 'monthly';
export type MonitoringProvider = 'solaredge' | 'enphase' | 'generic';
export type SystemStatusType = 'active' | 'inactive' | 'error' | 'unknown';
export type MonitoredSystemStatus = 'online' | 'offline' | 'warning';
