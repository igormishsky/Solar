import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Types for monitoring data
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

// Helper to fetch from monitoring API
async function monitoringApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}/monitoring${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.message || error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Simulated data generator (fallback when no real monitoring configured)
function generateSimulatedData(systemSizeKw: number) {
  const hourOfDay = new Date().getHours();
  const isDaytime = hourOfDay >= 6 && hourOfDay <= 18;
  const peakHour = hourOfDay >= 10 && hourOfDay <= 14;

  let currentPowerKw = 0;
  if (isDaytime) {
    const sunIntensity = peakHour ? 0.8 : 0.4;
    currentPowerKw = systemSizeKw * sunIntensity * (0.9 + Math.random() * 0.2);
  }

  const todayProductionKwh = systemSizeKw * 4.5 * (0.85 + Math.random() * 0.15);
  const dayOfMonth = new Date().getDate();
  const monthProductionKwh = todayProductionKwh * dayOfMonth;

  return {
    currentPowerKw: Math.round(currentPowerKw * 100) / 100,
    todayProductionKwh: Math.round(todayProductionKwh * 100) / 100,
    monthProductionKwh: Math.round(monthProductionKwh * 100) / 100,
  };
}

/**
 * Register a monitoring system with the backend
 */
export function useRegisterMonitoringSystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: MonitoringConfig & { systemId: string }) => {
      return monitoringApi<{ message: string; systemId: string; provider: string }>(
        '/systems',
        {
          method: 'POST',
          body: JSON.stringify(config),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring'] });
    },
  });
}

/**
 * Unregister a monitoring system
 */
export function useUnregisterMonitoringSystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (systemId: string) => {
      return monitoringApi<{ message: string }>(`/systems/${systemId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring'] });
    },
  });
}

/**
 * Fetch real-time system status from monitoring API
 */
export function useSystemStatus(systemId: string, enabled = true) {
  return useQuery({
    queryKey: ['monitoring', 'status', systemId],
    queryFn: async () => {
      return monitoringApi<SystemStatus>(`/systems/${systemId}/status`);
    },
    enabled: enabled && !!systemId,
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
  });
}

/**
 * Fetch current power from monitoring API
 */
export function useCurrentPower(systemId: string, enabled = true) {
  return useQuery({
    queryKey: ['monitoring', 'power', systemId],
    queryFn: async () => {
      return monitoringApi<{ systemId: string; currentPowerKw: number; timestamp: string }>(
        `/systems/${systemId}/power`
      );
    },
    enabled: enabled && !!systemId,
    staleTime: 1000 * 30, // 30 seconds for real-time data
    retry: 1,
  });
}

/**
 * Fetch today's energy from monitoring API
 */
export function useTodayEnergy(systemId: string, enabled = true) {
  return useQuery({
    queryKey: ['monitoring', 'energy', systemId],
    queryFn: async () => {
      return monitoringApi<{ systemId: string; todayEnergyKwh: number; timestamp: string }>(
        `/systems/${systemId}/energy/today`
      );
    },
    enabled: enabled && !!systemId,
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
  });
}

/**
 * Fetch historical data from monitoring API
 */
export function useHistoricalData(
  systemId: string,
  startDate: Date,
  endDate: Date,
  resolution: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily',
  enabled = true
) {
  return useQuery({
    queryKey: ['monitoring', 'history', systemId, startDate.toISOString(), endDate.toISOString(), resolution],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        resolution,
      });
      return monitoringApi<HistoricalData>(`/systems/${systemId}/history?${params}`);
    },
    enabled: enabled && !!systemId,
    staleTime: 1000 * 60 * 15, // 15 minutes for historical data
    retry: 1,
  });
}

/**
 * Fetch alerts from monitoring API
 */
export function useSystemAlerts(systemId: string, enabled = true) {
  return useQuery({
    queryKey: ['monitoring', 'alerts', systemId],
    queryFn: async () => {
      return monitoringApi<{ systemId: string; alerts: SystemAlert[]; timestamp: string }>(
        `/systems/${systemId}/alerts`
      );
    },
    enabled: enabled && !!systemId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
}

/**
 * Clear monitoring cache
 */
export function useClearMonitoringCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return monitoringApi<{ message: string }>('/cache/clear', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring'] });
    },
  });
}

/**
 * Fetch all monitored systems (completed projects with commercial activation)
 * Combines Supabase project data with real monitoring data when available
 */
export function useMonitoredSystems() {
  return useQuery({
    queryKey: queryKeys.monitoring?.systems ?? ['monitoring', 'systems'],
    queryFn: async () => {
      // Fetch project data from Supabase
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          system_size_kw,
          panel_count,
          inverter_model,
          estimated_annual_production,
          actual_completion_date,
          customer_id,
          monitoring_config,
          customers (
            first_name,
            last_name
          )
        `)
        .eq('status', 'completed')
        .in('current_stage', ['commercial_activation', 'standing_order_form'])
        .order('actual_completion_date', { ascending: false });

      if (error) throw error;

      // Try to fetch real monitoring data for systems with configured monitoring
      const monitoredSystems: MonitoredSystem[] = await Promise.all(
        (projects || []).map(async (project) => {
          const customer = project.customers as { first_name: string; last_name: string } | null;
          const systemSizeKw = project.system_size_kw || 5;
          const monitoringConfig = project.monitoring_config as { provider: string; systemId: string } | null;

          let realData = null;

          // Try to fetch real monitoring data if config exists
          if (monitoringConfig?.systemId) {
            try {
              const status = await monitoringApi<SystemStatus>(
                `/systems/${monitoringConfig.systemId}/status`
              );
              realData = {
                status: status.status === 'active' ? 'online' as const :
                        status.status === 'error' ? 'offline' as const : 'warning' as const,
                currentPowerKw: status.currentPowerKw,
                todayProductionKwh: status.todayEnergyKwh,
                alerts: status.alerts,
              };
            } catch {
              // Real monitoring not available, will use simulated data
            }
          }

          // Use real data or fall back to simulation
          const simulated = generateSimulatedData(systemSizeKw);
          const randomStatus = Math.random();
          const simulatedStatus: 'online' | 'offline' | 'warning' =
            randomStatus > 0.95 ? 'offline' :
            randomStatus > 0.85 ? 'warning' : 'online';

          const expectedDaily = (project.estimated_annual_production || systemSizeKw * 1500) / 365;
          const todayProduction = realData?.todayProductionKwh ?? simulated.todayProductionKwh;
          const efficiency = Math.min(100, (todayProduction / expectedDaily) * 100);

          return {
            id: project.id,
            projectName: project.name,
            customerName: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown',
            systemSizeKw: project.system_size_kw,
            panelCount: project.panel_count,
            inverterModel: project.inverter_model,
            estimatedAnnualProduction: project.estimated_annual_production,
            activationDate: project.actual_completion_date,
            status: realData?.status ?? simulatedStatus,
            currentPowerKw: realData?.currentPowerKw ?? simulated.currentPowerKw,
            todayProductionKwh: todayProduction,
            monthProductionKwh: simulated.monthProductionKwh,
            efficiency: Math.round(efficiency),
            monitoringConfig: monitoringConfig || undefined,
          };
        })
      );

      return monitoredSystems;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Get aggregated monitoring statistics
 */
export function useMonitoringStats() {
  return useQuery({
    queryKey: queryKeys.monitoring?.stats ?? ['monitoring', 'stats'],
    queryFn: async () => {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, system_size_kw, estimated_annual_production, monitoring_config')
        .eq('status', 'completed')
        .in('current_stage', ['commercial_activation', 'standing_order_form']);

      if (error) throw error;

      const systems = projects || [];
      const totalCapacityKw = systems.reduce((sum, p) => sum + (p.system_size_kw || 0), 0);

      // Try to get real aggregated status
      let realStats = null;
      try {
        const response = await monitoringApi<{ systems: Record<string, SystemStatus>; count: number }>(
          '/systems/status/all'
        );
        const statuses = Object.values(response.systems).filter(Boolean);
        if (statuses.length > 0) {
          realStats = {
            totalSystemsOnline: statuses.filter(s => s?.status === 'active').length,
            totalSystemsOffline: statuses.filter(s => s?.status === 'error' || s?.status === 'inactive').length,
            totalSystemsWarning: statuses.filter(s => s?.status === 'unknown').length,
            totalTodayProductionKwh: statuses.reduce((sum, s) => sum + (s?.todayEnergyKwh || 0), 0),
          };
        }
      } catch {
        // Fall back to simulated stats
      }

      const stats: MonitoringStats = {
        totalSystemsOnline: realStats?.totalSystemsOnline ?? Math.floor(systems.length * 0.9),
        totalSystemsOffline: realStats?.totalSystemsOffline ?? Math.floor(systems.length * 0.02),
        totalSystemsWarning: realStats?.totalSystemsWarning ??
          (systems.length - Math.floor(systems.length * 0.9) - Math.floor(systems.length * 0.02)),
        totalCapacityKw: Math.round(totalCapacityKw * 100) / 100,
        totalTodayProductionKwh: realStats?.totalTodayProductionKwh ??
          Math.round(totalCapacityKw * 4.5 * 100) / 100,
        averageEfficiency: 92,
      };

      return stats;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Fetch monitoring details for a specific project
 */
export function useProjectMonitoring(projectId: string) {
  return useQuery({
    queryKey: queryKeys.monitoring?.project?.(projectId) ?? ['monitoring', 'project', projectId],
    queryFn: async () => {
      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          system_size_kw,
          panel_count,
          inverter_model,
          estimated_annual_production,
          actual_completion_date,
          current_stage,
          monitoring_config,
          customers (
            first_name,
            last_name,
            property_city
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      if (!project) return null;

      const systemSizeKw = project.system_size_kw || 5;
      const monitoringConfig = project.monitoring_config as { provider: string; systemId: string } | null;

      // Try to fetch real monitoring data
      let realHistorical = null;
      let realStatus = null;

      if (monitoringConfig?.systemId) {
        try {
          // Fetch current status
          realStatus = await monitoringApi<SystemStatus>(
            `/systems/${monitoringConfig.systemId}/status`
          );

          // Fetch today's hourly data
          const today = new Date();
          const startOfDay = new Date(today);
          startOfDay.setHours(0, 0, 0, 0);

          realHistorical = await monitoringApi<HistoricalData>(
            `/systems/${monitoringConfig.systemId}/history?startDate=${startOfDay.toISOString()}&endDate=${today.toISOString()}&resolution=hourly`
          );
        } catch {
          // Fall back to simulated data
        }
      }

      // Generate hourly production data
      const hourlyProduction: { hour: number; production: number }[] = [];
      if (realHistorical?.data) {
        // Use real historical data
        for (let hour = 0; hour < 24; hour++) {
          const dataPoint = realHistorical.data.find(
            d => new Date(d.timestamp).getHours() === hour
          );
          hourlyProduction.push({
            hour,
            production: dataPoint?.energyKwh ?? 0,
          });
        }
      } else {
        // Generate simulated data
        for (let hour = 0; hour < 24; hour++) {
          let production = 0;
          if (hour >= 6 && hour <= 18) {
            const peakFactor = hour >= 10 && hour <= 14 ? 0.9 : 0.5;
            production = systemSizeKw * peakFactor * (0.85 + Math.random() * 0.15);
          }
          hourlyProduction.push({ hour, production: Math.round(production * 100) / 100 });
        }
      }

      // Generate weekly production data (simulated for now)
      const weeklyProduction: { day: string; production: number }[] = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        weeklyProduction.push({
          day: days[date.getDay()],
          production: Math.round(systemSizeKw * 4.5 * (0.7 + Math.random() * 0.3) * 100) / 100,
        });
      }

      const hourOfDay = new Date().getHours();
      const isDaytime = hourOfDay >= 6 && hourOfDay <= 18;

      return {
        project,
        hourlyProduction,
        weeklyProduction,
        currentPower: realStatus?.currentPowerKw ?? (isDaytime ? systemSizeKw * 0.7 : 0),
        todayProduction: realStatus?.todayEnergyKwh ?? systemSizeKw * 4.5,
        monthProduction: (realStatus?.todayEnergyKwh ?? systemSizeKw * 4.5) * new Date().getDate(),
        yearProduction: systemSizeKw * 4.5 * Math.floor(Math.random() * 365),
        monitoringProvider: monitoringConfig?.provider,
        isRealData: !!realStatus,
      };
    },
    enabled: !!projectId,
    staleTime: 1000 * 30, // 30 seconds for individual system
  });
}
