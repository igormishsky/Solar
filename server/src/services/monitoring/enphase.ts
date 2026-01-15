import {
  IMonitoringClient,
  SystemStatus,
  SystemAlert,
  HistoricalData,
  PerformanceData,
} from './index';

const ENPHASE_API_BASE = 'https://api.enphaseenergy.com/api/v4';

interface EnphaseSystemSummary {
  system_id: number;
  status: string;
  operational_at: number;
  last_report_at: number;
  current_power: number;
  energy_today: number;
  energy_lifetime: number;
}

interface EnphaseProductionStats {
  intervals: Array<{
    end_at: number;
    devices_reporting: number;
    wh_del: number;
    powr: number;
  }>;
}

interface EnphaseAlert {
  id: string;
  type: string;
  device_type: string;
  device_serial: string;
  start_date: number;
  resolved_at: number | null;
  message: string;
}

export class EnphaseClient implements IMonitoringClient {
  private apiKey: string;
  private systemId: string | undefined;

  constructor(apiKey: string, systemId?: string) {
    this.apiKey = apiKey;
    this.systemId = systemId;
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${ENPHASE_API_BASE}${endpoint}`);
    url.searchParams.append('key', this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Enphase API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getSystemStatus(systemId: string): Promise<SystemStatus> {
    const sysId = this.systemId || systemId;

    try {
      const summary = await this.request<EnphaseSystemSummary>(
        `/systems/${sysId}/summary`
      );

      const alerts = await this.getAlerts(systemId);

      return {
        systemId: sysId,
        provider: 'enphase',
        status: this.mapStatus(summary.status),
        lastCommunication: summary.last_report_at
          ? new Date(summary.last_report_at * 1000)
          : null,
        currentPowerKw: (summary.current_power || 0) / 1000,
        todayEnergyKwh: (summary.energy_today || 0) / 1000,
        lifetimeEnergyMwh: (summary.energy_lifetime || 0) / 1000000,
        alerts,
      };
    } catch (error) {
      console.error('Enphase getSystemStatus error:', error);
      return {
        systemId,
        provider: 'enphase',
        status: 'error',
        lastCommunication: null,
        currentPowerKw: 0,
        todayEnergyKwh: 0,
        lifetimeEnergyMwh: 0,
        alerts: [],
      };
    }
  }

  async getCurrentPower(systemId: string): Promise<number> {
    const sysId = this.systemId || systemId;

    const summary = await this.request<EnphaseSystemSummary>(
      `/systems/${sysId}/summary`
    );

    return (summary.current_power || 0) / 1000; // Convert W to kW
  }

  async getTodayEnergy(systemId: string): Promise<number> {
    const sysId = this.systemId || systemId;

    const summary = await this.request<EnphaseSystemSummary>(
      `/systems/${sysId}/summary`
    );

    return (summary.energy_today || 0) / 1000; // Convert Wh to kWh
  }

  async getHistoricalData(
    systemId: string,
    startDate: Date,
    endDate: Date,
    resolution = 'day'
  ): Promise<HistoricalData> {
    const sysId = this.systemId || systemId;

    try {
      const response = await this.request<EnphaseProductionStats>(
        `/systems/${sysId}/telemetry/production_micro`,
        {
          start_at: Math.floor(startDate.getTime() / 1000).toString(),
          end_at: Math.floor(endDate.getTime() / 1000).toString(),
          granularity: this.mapResolution(resolution),
        }
      );

      const data: PerformanceData[] = (response.intervals || []).map((interval) => ({
        timestamp: new Date(interval.end_at * 1000),
        powerKw: (interval.powr || 0) / 1000,
        energyKwh: (interval.wh_del || 0) / 1000,
      }));

      // Calculate summary
      const totalEnergyKwh = data.reduce((sum, d) => sum + d.energyKwh, 0);
      const peakPowerKw = Math.max(...data.map((d) => d.powerKw), 0);
      const averagePowerKw = data.length > 0
        ? data.reduce((sum, d) => sum + d.powerKw, 0) / data.length
        : 0;

      return {
        systemId,
        startDate,
        endDate,
        resolution: this.reverseMapResolution(resolution),
        data,
        summary: {
          totalEnergyKwh,
          peakPowerKw,
          averagePowerKw,
          uptime: 100, // Enphase doesn't provide this directly
        },
      };
    } catch (error) {
      console.error('Enphase getHistoricalData error:', error);
      return {
        systemId,
        startDate,
        endDate,
        resolution: 'daily',
        data: [],
        summary: {
          totalEnergyKwh: 0,
          peakPowerKw: 0,
          averagePowerKw: 0,
          uptime: 0,
        },
      };
    }
  }

  async getAlerts(systemId: string): Promise<SystemAlert[]> {
    const sysId = this.systemId || systemId;

    try {
      const response = await this.request<{ alerts: EnphaseAlert[] }>(
        `/systems/${sysId}/alerts`
      );

      return (response.alerts || []).map((alert) => ({
        id: alert.id,
        type: this.mapAlertType(alert.type),
        code: alert.type,
        message: alert.message || `${alert.type} on ${alert.device_type}`,
        timestamp: new Date(alert.start_date * 1000),
        resolved: alert.resolved_at !== null,
      }));
    } catch (error) {
      console.error('Enphase getAlerts error:', error);
      return [];
    }
  }

  // Helper methods
  private mapStatus(status: string): 'active' | 'inactive' | 'error' | 'unknown' {
    switch (status?.toLowerCase()) {
      case 'normal':
      case 'comm':
        return 'active';
      case 'micro':
      case 'power':
        return 'inactive';
      case 'error':
        return 'error';
      default:
        return 'unknown';
    }
  }

  private mapAlertType(type: string): 'error' | 'warning' | 'info' {
    switch (type?.toLowerCase()) {
      case 'critical':
      case 'production_alert':
        return 'error';
      case 'warning':
      case 'communication_alert':
        return 'warning';
      default:
        return 'info';
    }
  }

  private mapResolution(resolution: string): string {
    switch (resolution.toLowerCase()) {
      case 'hourly':
        return 'fifteen_mins';
      case 'daily':
        return 'day';
      case 'weekly':
        return 'week';
      case 'monthly':
        return 'month';
      default:
        return 'day';
    }
  }

  private reverseMapResolution(resolution: string): 'hourly' | 'daily' | 'weekly' | 'monthly' {
    switch (resolution.toLowerCase()) {
      case 'fifteen_mins':
        return 'hourly';
      case 'day':
        return 'daily';
      case 'week':
        return 'weekly';
      case 'month':
        return 'monthly';
      default:
        return 'daily';
    }
  }
}
