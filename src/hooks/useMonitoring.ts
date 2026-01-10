import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { Tables } from '@/types/database.types';

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
  // Simulated monitoring data - in production, this would come from monitoring API
  currentPowerKw: number;
  todayProductionKwh: number;
  monthProductionKwh: number;
  efficiency: number;
}

export interface MonitoringStats {
  totalSystemsOnline: number;
  totalSystemsOffline: number;
  totalSystemsWarning: number;
  totalCapacityKw: number;
  totalTodayProductionKwh: number;
  averageEfficiency: number;
}

/**
 * Fetch all monitored systems (completed projects with commercial activation)
 */
export function useMonitoredSystems() {
  return useQuery({
    queryKey: queryKeys.monitoring?.systems ?? ['monitoring', 'systems'],
    queryFn: async () => {
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
          customers (
            first_name,
            last_name
          )
        `)
        .eq('status', 'completed')
        .in('current_stage', ['commercial_activation', 'standing_order_form'])
        .order('actual_completion_date', { ascending: false });

      if (error) throw error;

      // Transform and simulate monitoring data
      // In production, this would fetch from SolarEdge/Enphase/other monitoring API
      const monitoredSystems: MonitoredSystem[] = (projects || []).map((project) => {
        const customer = project.customers as { first_name: string; last_name: string } | null;
        const systemSizeKw = project.system_size_kw || 5;

        // Simulate realistic monitoring data based on system size
        const hourOfDay = new Date().getHours();
        const isDaytime = hourOfDay >= 6 && hourOfDay <= 18;
        const peakHour = hourOfDay >= 10 && hourOfDay <= 14;

        // Simulate power production based on time of day
        let currentPowerKw = 0;
        if (isDaytime) {
          const sunIntensity = peakHour ? 0.8 : 0.4;
          currentPowerKw = systemSizeKw * sunIntensity * (0.9 + Math.random() * 0.2);
        }

        // Simulate daily production (average 4-5 peak sun hours in Israel)
        const todayProductionKwh = systemSizeKw * 4.5 * (0.85 + Math.random() * 0.15);

        // Simulate monthly production
        const dayOfMonth = new Date().getDate();
        const monthProductionKwh = todayProductionKwh * dayOfMonth;

        // Calculate efficiency (compared to expected)
        const expectedDaily = (project.estimated_annual_production || systemSizeKw * 1500) / 365;
        const efficiency = Math.min(100, (todayProductionKwh / expectedDaily) * 100);

        // Simulate status (most systems online, occasional warning/offline)
        const randomStatus = Math.random();
        const status: 'online' | 'offline' | 'warning' =
          randomStatus > 0.95 ? 'offline' :
          randomStatus > 0.85 ? 'warning' : 'online';

        return {
          id: project.id,
          projectName: project.name,
          customerName: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown',
          systemSizeKw: project.system_size_kw,
          panelCount: project.panel_count,
          inverterModel: project.inverter_model,
          estimatedAnnualProduction: project.estimated_annual_production,
          activationDate: project.actual_completion_date,
          status,
          currentPowerKw: Math.round(currentPowerKw * 100) / 100,
          todayProductionKwh: Math.round(todayProductionKwh * 100) / 100,
          monthProductionKwh: Math.round(monthProductionKwh * 100) / 100,
          efficiency: Math.round(efficiency),
        };
      });

      return monitoredSystems;
    },
    staleTime: 1000 * 60, // 1 minute - monitoring data should refresh frequently
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
        .select('id, system_size_kw, estimated_annual_production')
        .eq('status', 'completed')
        .in('current_stage', ['commercial_activation', 'standing_order_form']);

      if (error) throw error;

      const systems = projects || [];
      const totalCapacityKw = systems.reduce((sum, p) => sum + (p.system_size_kw || 0), 0);

      // Simulate aggregate stats
      const stats: MonitoringStats = {
        totalSystemsOnline: Math.floor(systems.length * 0.9),
        totalSystemsOffline: Math.floor(systems.length * 0.02),
        totalSystemsWarning: systems.length - Math.floor(systems.length * 0.9) - Math.floor(systems.length * 0.02),
        totalCapacityKw: Math.round(totalCapacityKw * 100) / 100,
        totalTodayProductionKwh: Math.round(totalCapacityKw * 4.5 * 100) / 100,
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
      const hourOfDay = new Date().getHours();
      const isDaytime = hourOfDay >= 6 && hourOfDay <= 18;

      // Generate hourly production data for today
      const hourlyProduction: { hour: number; production: number }[] = [];
      for (let hour = 0; hour < 24; hour++) {
        let production = 0;
        if (hour >= 6 && hour <= 18) {
          const peakFactor = hour >= 10 && hour <= 14 ? 0.9 : 0.5;
          production = systemSizeKw * peakFactor * (0.85 + Math.random() * 0.15);
        }
        hourlyProduction.push({ hour, production: Math.round(production * 100) / 100 });
      }

      // Generate weekly production data
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

      return {
        project,
        hourlyProduction,
        weeklyProduction,
        currentPower: isDaytime ? systemSizeKw * 0.7 : 0,
        todayProduction: systemSizeKw * 4.5,
        monthProduction: systemSizeKw * 4.5 * new Date().getDate(),
        yearProduction: systemSizeKw * 4.5 * Math.floor(Math.random() * 365),
      };
    },
    enabled: !!projectId,
    staleTime: 1000 * 30, // 30 seconds for individual system
  });
}
