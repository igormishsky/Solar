import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  monitoringService,
  MonitoringConfig,
  MonitoringProvider,
} from '../services/monitoring';

const router = Router();

// Validation schemas
const registerSystemSchema = z.object({
  systemId: z.string().min(1),
  provider: z.enum(['solaredge', 'enphase', 'generic']),
  apiKey: z.string().min(1),
  siteId: z.string().optional(),
  additionalConfig: z.record(z.unknown()).optional(),
});

const dateRangeSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date',
  }),
  resolution: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
});

// Register a new monitoring system
router.post('/systems', async (req: Request, res: Response) => {
  try {
    const validation = registerSystemSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { systemId, provider, apiKey, siteId, additionalConfig } = validation.data;

    const config: MonitoringConfig = {
      provider: provider as MonitoringProvider,
      apiKey,
      siteId,
      systemId,
      additionalConfig,
    };

    const success = monitoringService.registerSystem(systemId, config);

    if (success) {
      res.status(201).json({
        message: 'System registered successfully',
        systemId,
        provider,
      });
    } else {
      res.status(400).json({
        error: 'Failed to register system',
        message: 'Unsupported provider or invalid configuration',
      });
    }
  } catch (error) {
    console.error('Error registering monitoring system:', error);
    res.status(500).json({ error: 'Failed to register monitoring system' });
  }
});

// Unregister a monitoring system
router.delete('/systems/:systemId', async (req: Request, res: Response) => {
  try {
    const { systemId } = req.params;
    monitoringService.unregisterSystem(systemId);
    res.json({ message: 'System unregistered successfully', systemId });
  } catch (error) {
    console.error('Error unregistering system:', error);
    res.status(500).json({ error: 'Failed to unregister system' });
  }
});

// Get system status
router.get('/systems/:systemId/status', async (req: Request, res: Response) => {
  try {
    const { systemId } = req.params;
    const status = await monitoringService.getSystemStatus(systemId);

    if (!status) {
      return res.status(404).json({
        error: 'System not found',
        message: 'System is not registered or status unavailable',
      });
    }

    res.json(status);
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({ error: 'Failed to get system status' });
  }
});

// Get current power
router.get('/systems/:systemId/power', async (req: Request, res: Response) => {
  try {
    const { systemId } = req.params;
    const power = await monitoringService.getCurrentPower(systemId);

    if (power === null) {
      return res.status(404).json({
        error: 'System not found',
        message: 'System is not registered or power data unavailable',
      });
    }

    res.json({ systemId, currentPowerKw: power, timestamp: new Date() });
  } catch (error) {
    console.error('Error getting current power:', error);
    res.status(500).json({ error: 'Failed to get current power' });
  }
});

// Get today's energy
router.get('/systems/:systemId/energy/today', async (req: Request, res: Response) => {
  try {
    const { systemId } = req.params;
    const energy = await monitoringService.getTodayEnergy(systemId);

    if (energy === null) {
      return res.status(404).json({
        error: 'System not found',
        message: 'System is not registered or energy data unavailable',
      });
    }

    res.json({ systemId, todayEnergyKwh: energy, timestamp: new Date() });
  } catch (error) {
    console.error('Error getting today energy:', error);
    res.status(500).json({ error: 'Failed to get today energy' });
  }
});

// Get historical data
router.get('/systems/:systemId/history', async (req: Request, res: Response) => {
  try {
    const { systemId } = req.params;

    const validation = dateRangeSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { startDate, endDate, resolution } = validation.data;

    const data = await monitoringService.getHistoricalData(
      systemId,
      new Date(startDate),
      new Date(endDate),
      resolution
    );

    if (!data) {
      return res.status(404).json({
        error: 'System not found',
        message: 'System is not registered or historical data unavailable',
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error getting historical data:', error);
    res.status(500).json({ error: 'Failed to get historical data' });
  }
});

// Get alerts
router.get('/systems/:systemId/alerts', async (req: Request, res: Response) => {
  try {
    const { systemId } = req.params;
    const alerts = await monitoringService.getAlerts(systemId);
    res.json({ systemId, alerts, timestamp: new Date() });
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

// Get all systems status
router.get('/systems/status/all', async (_req: Request, res: Response) => {
  try {
    const statuses = await monitoringService.getAllSystemsStatus();
    const result: Record<string, unknown> = {};

    statuses.forEach((status, systemId) => {
      result[systemId] = status;
    });

    res.json({
      systems: result,
      count: statuses.size,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error getting all systems status:', error);
    res.status(500).json({ error: 'Failed to get all systems status' });
  }
});

// Clear monitoring cache
router.post('/cache/clear', async (_req: Request, res: Response) => {
  try {
    monitoringService.clearCache();
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Webhook endpoint for real-time alerts (SolarEdge/Enphase can post here)
router.post('/webhooks/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const payload = req.body;

    console.log(`Received webhook from ${provider}:`, JSON.stringify(payload, null, 2));

    // Process webhook based on provider
    switch (provider) {
      case 'solaredge':
        // Handle SolarEdge webhook
        // SolarEdge sends alerts via their notification system
        if (payload.alertType) {
          console.log(`SolarEdge alert: ${payload.alertType} for site ${payload.siteId}`);
        }
        break;

      case 'enphase':
        // Handle Enphase webhook
        // Enphase Enlighten sends system events
        if (payload.event_type) {
          console.log(`Enphase event: ${payload.event_type} for system ${payload.system_id}`);
        }
        break;

      default:
        return res.status(400).json({ error: 'Unknown provider' });
    }

    // Acknowledge receipt
    res.status(200).json({ received: true, timestamp: new Date() });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

export default router;
