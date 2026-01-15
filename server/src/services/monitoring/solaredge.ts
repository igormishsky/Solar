import {
  IMonitoringClient,
  SystemStatus,
  SystemAlert,
  HistoricalData,
  PerformanceData,
} from './index';

const SOLAREDGE_API_BASE = 'https://monitoringapi.solaredge.com';

interface SolarEdgeApiResponse<T> {
  [key: string]: T;
}

interface SolarEdgeSiteDetails {
  id: number;
  name: string;
  status: string;
  peakPower: number;
  lastUpdateTime: string;
}

interface SolarEdgeOverview {
  lastUpdateTime: string;
  lifeTimeData: { energy: number };
  lastYearData: { energy: number };
  lastMonthData: { energy: number };
  lastDayData: { energy: number };
  currentPower: { power: number };
}

interface SolarEdgePowerData {
  timeUnit: string;
  unit: string;
  values: Array<{ date: string; value: number | null }>;
}

interface SolarEdgeAlert {
  alertId: number;
  severity: string;
  alertCode: string;
  alertName: string;
  timeStamp: string;
  isActive: boolean;
}

export class SolarEdgeClient implements IMonitoringClient {
  private apiKey: string;
  private siteId: string | undefined;

  constructor(apiKey: string, siteId?: string) {
    this.apiKey = apiKey;
    this.siteId = siteId;
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${SOLAREDGE_API_BASE}${endpoint}`);
    url.searchParams.append('api_key', this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`SolarEdge API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getSystemStatus(systemId: string): Promise<SystemStatus> {
    const siteId = this.siteId || systemId;

    try {
      // Get site details
      const detailsResponse = await this.request<SolarEdgeApiResponse<SolarEdgeSiteDetails>>(
        `/site/${siteId}/details`
      );
      const details = detailsResponse.details;

      // Get overview (current power, energy)
      const overviewResponse = await this.request<SolarEdgeApiResponse<SolarEdgeOverview>>(
        `/site/${siteId}/overview`
      );
      const overview = overviewResponse.overview;

      // Get alerts
      const alerts = await this.getAlerts(systemId);

      return {
        systemId: siteId,
        provider: 'solaredge',
        status: this.mapStatus(details.status),
        lastCommunication: overview.lastUpdateTime ? new Date(overview.lastUpdateTime) : null,
        currentPowerKw: (overview.currentPower?.power || 0) / 1000,
        todayEnergyKwh: (overview.lastDayData?.energy || 0) / 1000,
        lifetimeEnergyMwh: (overview.lifeTimeData?.energy || 0) / 1000000,
        alerts,
      };
    } catch (error) {
      console.error('SolarEdge getSystemStatus error:', error);
      return {
        systemId,
        provider: 'solaredge',
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
    const siteId = this.siteId || systemId;

    const response = await this.request<SolarEdgeApiResponse<SolarEdgeOverview>>(
      `/site/${siteId}/overview`
    );

    return (response.overview?.currentPower?.power || 0) / 1000; // Convert W to kW
  }

  async getTodayEnergy(systemId: string): Promise<number> {
    const siteId = this.siteId || systemId;

    const response = await this.request<SolarEdgeApiResponse<SolarEdgeOverview>>(
      `/site/${siteId}/overview`
    );

    return (response.overview?.lastDayData?.energy || 0) / 1000; // Convert Wh to kWh
  }

  async getHistoricalData(
    systemId: string,
    startDate: Date,
    endDate: Date,
    resolution = 'HOUR'
  ): Promise<HistoricalData> {
    const siteId = this.siteId || systemId;

    const response = await this.request<SolarEdgeApiResponse<SolarEdgePowerData>>(
      `/site/${siteId}/energy`,
      {
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(endDate),
        timeUnit: this.mapResolution(resolution),
      }
    );

    const energyData = response.energy;
    const data: PerformanceData[] = (energyData?.values || [])
      .filter((v) => v.value !== null)
      .map((v) => ({
        timestamp: new Date(v.date),
        powerKw: 0, // Energy endpoint doesn't provide power
        energyKwh: (v.value || 0) / 1000,
      }));

    // Calculate summary
    const totalEnergyKwh = data.reduce((sum, d) => sum + d.energyKwh, 0);
    const peakEnergyKwh = Math.max(...data.map((d) => d.energyKwh), 0);

    return {
      systemId,
      startDate,
      endDate,
      resolution: this.reverseMapResolution(energyData?.timeUnit || resolution),
      data,
      summary: {
        totalEnergyKwh,
        peakPowerKw: peakEnergyKwh, // Approximate
        averagePowerKw: data.length > 0 ? totalEnergyKwh / data.length : 0,
        uptime: 100, // SolarEdge doesn't provide this directly
      },
    };
  }

  async getAlerts(systemId: string): Promise<SystemAlert[]> {
    const siteId = this.siteId || systemId;

    try {
      const response = await this.request<SolarEdgeApiResponse<{ alerts: SolarEdgeAlert[] }>>(
        `/site/${siteId}/alerts`
      );

      return (response.alerts?.alerts || []).map((alert) => ({
        id: alert.alertId.toString(),
        type: this.mapAlertSeverity(alert.severity),
        code: alert.alertCode,
        message: alert.alertName,
        timestamp: new Date(alert.timeStamp),
        resolved: !alert.isActive,
      }));
    } catch (error) {
      console.error('SolarEdge getAlerts error:', error);
      return [];
    }
  }

  // Helper methods
  private mapStatus(status: string): 'active' | 'inactive' | 'error' | 'unknown' {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'active';
      case 'pending':
      case 'disabled':
        return 'inactive';
      case 'error':
        return 'error';
      default:
        return 'unknown';
    }
  }

  private mapAlertSeverity(severity: string): 'error' | 'warning' | 'info' {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private mapResolution(resolution: string): string {
    switch (resolution.toLowerCase()) {
      case 'hourly':
        return 'HOUR';
      case 'daily':
        return 'DAY';
      case 'weekly':
        return 'WEEK';
      case 'monthly':
        return 'MONTH';
      default:
        return resolution.toUpperCase();
    }
  }

  private reverseMapResolution(resolution: string): 'hourly' | 'daily' | 'weekly' | 'monthly' {
    switch (resolution.toUpperCase()) {
      case 'HOUR':
        return 'hourly';
      case 'DAY':
        return 'daily';
      case 'WEEK':
        return 'weekly';
      case 'MONTH':
        return 'monthly';
      default:
        return 'daily';
    }
  }
}
