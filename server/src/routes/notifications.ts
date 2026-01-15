import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requirePermission, requireRole } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { supabase } from '../lib';
import { sendEmail, sendBulkEmails, isEmailConfigured, EmailTemplate } from '../services/email';

const router = Router();

// Validation schemas
const notificationPreferencesSchema = z.object({
  task_assigned: z.boolean().default(true),
  project_status: z.boolean().default(true),
  form_approved: z.boolean().default(true),
  form_rejected: z.boolean().default(true),
  license_expiry: z.boolean().default(true),
});

const sendNotificationSchema = z.object({
  user_id: z.string().uuid().optional(),
  email: z.string().email().optional(),
  template: z.enum([
    'welcome',
    'password-reset',
    'task-assigned',
    'project-status',
    'license-expiry',
    'form-approved',
    'form-rejected',
    'form-submitted',
  ]),
  data: z.record(z.unknown()),
  subject: z.string().optional(),
});

// GET /api/notifications/config - Check if email is configured
router.get(
  '/config',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json({
      configured: isEmailConfigured,
    });
  })
);

// GET /api/notifications/preferences - Get current user's notification preferences
router.get(
  '/preferences',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new AppError(error.message, 500);
    }

    // Return default preferences if none exist
    const preferences = data || {
      user_id: userId,
      task_assigned: true,
      project_status: true,
      form_approved: true,
      form_rejected: true,
      license_expiry: true,
    };

    res.json(preferences);
  })
);

// PUT /api/notifications/preferences - Update notification preferences
router.put(
  '/preferences',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const preferences = notificationPreferencesSchema.parse(req.body);

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    res.json(data);
  })
);

// POST /api/notifications/send - Send a notification (admin only)
router.post(
  '/send',
  requireRole('administrator', 'manager'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { user_id, email, template, data, subject } = sendNotificationSchema.parse(req.body);

    if (!user_id && !email) {
      throw new AppError('Either user_id or email is required', 400);
    }

    // Get email address
    let recipientEmail = email;
    if (user_id && !email) {
      const { data: user, error } = await supabase
        .from('users')
        .select('email')
        .eq('id', user_id)
        .single();

      if (error || !user) {
        throw new AppError('User not found', 404);
      }
      recipientEmail = user.email;
    }

    if (!recipientEmail) {
      throw new AppError('Could not determine recipient email', 400);
    }

    // Check user preferences
    if (user_id) {
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user_id)
        .single();

      // Map template to preference key
      const templateToPreference: Record<string, string> = {
        'task-assigned': 'task_assigned',
        'project-status': 'project_status',
        'form-approved': 'form_approved',
        'form-rejected': 'form_rejected',
        'license-expiry': 'license_expiry',
      };

      const preferenceKey = templateToPreference[template];
      if (prefs && preferenceKey && !prefs[preferenceKey]) {
        res.json({
          success: false,
          message: 'User has disabled this notification type',
        });
        return;
      }
    }

    const success = await sendEmail({
      to: recipientEmail,
      template: template as EmailTemplate,
      data,
      subject,
    });

    res.json({ success });
  })
);

// POST /api/notifications/send-bulk - Send notifications to multiple users
router.post(
  '/send-bulk',
  requireRole('administrator'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const bulkSchema = z.object({
      user_ids: z.array(z.string().uuid()).optional(),
      role: z.string().optional(),
      template: z.enum([
        'welcome',
        'password-reset',
        'task-assigned',
        'project-status',
        'license-expiry',
        'form-approved',
        'form-rejected',
        'form-submitted',
      ]),
      data: z.record(z.unknown()),
      subject: z.string().optional(),
    });

    const { user_ids, role, template, data, subject } = bulkSchema.parse(req.body);

    // Get users
    let query = supabase.from('users').select('id, email');

    if (user_ids && user_ids.length > 0) {
      query = query.in('id', user_ids);
    } else if (role) {
      query = query.eq('role', role);
    } else {
      throw new AppError('Either user_ids or role is required', 400);
    }

    const { data: users, error } = await query;
    if (error) throw new AppError(error.message, 500);

    if (!users || users.length === 0) {
      res.json({ success: 0, failed: 0, message: 'No users found' });
      return;
    }

    // Build email list
    const emails = users.map((user) => ({
      to: user.email,
      template: template as EmailTemplate,
      data,
      subject,
    }));

    const result = await sendBulkEmails(emails);

    res.json({
      ...result,
      total: users.length,
    });
  })
);

// POST /api/notifications/test - Send a test email to the current user
router.post(
  '/test',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      throw new AppError('Unauthorized', 401);
    }

    const success = await sendEmail({
      to: userEmail,
      template: 'welcome',
      data: {
        name: req.user?.email?.split('@')[0] || 'User',
      },
      subject: 'Test Email from Solar CRM',
    });

    res.json({
      success,
      message: success ? 'Test email sent successfully' : 'Failed to send test email',
    });
  })
);

export default router;
