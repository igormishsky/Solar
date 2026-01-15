import { SolarEdgeClient } from './solaredge';
import { EnphaseClient } from './enphase';

// Monitoring provider types
export type MonitoringProvider = 'solaredge' | 'enphase' | 'generic';

// Common interfaces for monitoring data
export interface SystemStatus {
  systemId: string;
  provider: MonitoringProvider;
  status: 'active' | 'inactive' | 'error' | 'unknown';
  lastCommunication: Date | null;
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
  timestamp: Date;
  resolved: boolean;
}

export interface PerformanceData {
  timestamp: Date;
  powerKw: number;
  energyKwh: number;
  irradiance?: number;
  temperature?: number;
}

export interface HistoricalData {
  systemId: string;
  startDate: Date;
  endDate: Date;
  resolution: 'hourly' | 'daily' | 'weekly' | 'monthly';
  data: PerformanceData[];
  summary: {
    totalEnergyKwh: number;
    peakPowerKw: number;
    averagePowerKw: number;
    uptime: number; // percentage
  };
}

// Monitoring service configuration
export interface MonitoringConfig {
  provider: MonitoringProvider;
  apiKey: string;
  siteId?: string;
  systemId?: string;
  additionalConfig?: Record<string, unknown>;
}

// Abstract monitoring client interface
export interface IMonitoringClient {
  getSystemStatus(systemId: string): Promise<SystemStatus>;
  getCurrentPower(systemId: string): Promise<number>;
  getTodayEnergy(systemId: string): Promise<number>;
  getHistoricalData(systemId: string, startDate: Date, endDate: Date, resolution?: string): Promise<HistoricalData>;
  getAlerts(systemId: string): Promise<SystemAlert[]>;
}

// Factory to create monitoring clients
export function createMonitoringClient(config: MonitoringConfig): IMonitoringClient | null {
  switch (config.provider) {
    case 'solaredge':
      return new SolarEdgeClient(config.apiKey, config.siteId);
    case 'enphase':
      return new EnphaseClient(config.apiKey, config.systemId);
    default:
      return null;
  }
}

// Monitoring service that manages multiple systems
export class MonitoringService {
  private clients: Map<string, IMonitoringClient> = new Map();
  private cache: Map<string, { data: unknown; expiry: Date }> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  registerSystem(systemId: string, config: MonitoringConfig): boolean {
    const client = createMonitoringClient(config);
    if (client) {
      this.clients.set(systemId, client);
      return true;
    }
    return false;
  }

  unregisterSystem(systemId: string): void {
    this.clients.delete(systemId);
  }

  async getSystemStatus(systemId: string): Promise<SystemStatus | null> {
    const cacheKey = `status:${systemId}`;
    const cached = this.getFromCache<SystemStatus>(cacheKey);
    if (cached) return cached;

    const client = this.clients.get(systemId);
    if (!client) return null;

    try {
      const status = await client.getSystemStatus(systemId);
      this.setCache(cacheKey, status);
      return status;
    } catch (error) {
      console.error(`Failed to get status for system ${systemId}:`, error);
      return null;
    }
  }

  async getCurrentPower(systemId: string): Promise<number | null> {
    const cacheKey = `power:${systemId}`;
    const cached = this.getFromCache<number>(cacheKey);
    if (cached !== null) return cached;

    const client = this.clients.get(systemId);
    if (!client) return null;

    try {
      const power = await client.getCurrentPower(systemId);
      this.setCache(cacheKey, power, 60 * 1000); // 1 minute cache for real-time data
      return power;
    } catch (error) {
      console.error(`Failed to get power for system ${systemId}:`, error);
      return null;
    }
  }

  async getTodayEnergy(systemId: string): Promise<number | null> {
    const cacheKey = `energy:${systemId}`;
    const cached = this.getFromCache<number>(cacheKey);
    if (cached !== null) return cached;

    const client = this.clients.get(systemId);
    if (!client) return null;

    try {
      const energy = await client.getTodayEnergy(systemId);
      this.setCache(cacheKey, energy);
      return energy;
    } catch (error) {
      console.error(`Failed to get energy for system ${systemId}:`, error);
      return null;
    }
  }

  async getHistoricalData(
    systemId: string,
    startDate: Date,
    endDate: Date,
    resolution?: string
  ): Promise<HistoricalData | null> {
    const cacheKey = `history:${systemId}:${startDate.toISOString()}:${endDate.toISOString()}:${resolution}`;
    const cached = this.getFromCache<HistoricalData>(cacheKey);
    if (cached) return cached;

    const client = this.clients.get(systemId);
    if (!client) return null;

    try {
      const data = await client.getHistoricalData(systemId, startDate, endDate, resolution);
      this.setCache(cacheKey, data, 15 * 60 * 1000); // 15 minutes for historical data
      return data;
    } catch (error) {
      console.error(`Failed to get historical data for system ${systemId}:`, error);
      return null;
    }
  }

  async getAlerts(systemId: string): Promise<SystemAlert[]> {
    const cacheKey = `alerts:${systemId}`;
    const cached = this.getFromCache<SystemAlert[]>(cacheKey);
    if (cached) return cached;

    const client = this.clients.get(systemId);
    if (!client) return [];

    try {
      const alerts = await client.getAlerts(systemId);
      this.setCache(cacheKey, alerts, 2 * 60 * 1000); // 2 minutes for alerts
      return alerts;
    } catch (error) {
      console.error(`Failed to get alerts for system ${systemId}:`, error);
      return [];
    }
  }

  async getAllSystemsStatus(): Promise<Map<string, SystemStatus | null>> {
    const results = new Map<string, SystemStatus | null>();
    const promises = Array.from(this.clients.keys()).map(async (systemId) => {
      const status = await this.getSystemStatus(systemId);
      results.set(systemId, status);
    });
    await Promise.all(promises);
    return results;
  }

  // Cache management
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > new Date()) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T, duration?: number): void {
    this.cache.set(key, {
      data,
      expiry: new Date(Date.now() + (duration || this.cacheDuration)),
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();
