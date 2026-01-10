import { Router } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { AuthenticatedRequest, requirePermission, requireRole } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { supabase } from '../lib';

const router = Router();

// Admin Supabase client for user management
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Validation schemas
const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  role: z.enum(['administrator', 'manager', 'office_staff', 'field_technician', 'viewer']).default('viewer'),
  phone: z.string().optional().nullable(),
});

const userUpdateSchema = z.object({
  full_name: z.string().min(1).optional(),
  role: z.enum(['administrator', 'manager', 'office_staff', 'field_technician', 'viewer']).optional(),
  phone: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
});

// GET /api/users - List all users (admin/manager only)
router.get(
  '/',
  requirePermission('users:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { role, query, page = 1, limit = 50 } = req.query;

    let dbQuery = supabase.from('users').select('*', { count: 'exact' });

    if (role) {
      dbQuery = dbQuery.eq('role', role);
    }

    if (query) {
      dbQuery = dbQuery.or(
        `full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`
      );
    }

    const offset = (Number(page) - 1) * Number(limit);
    dbQuery = dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await dbQuery;

    if (error) throw new AppError(error.message, 500);

    res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  })
);

// GET /api/users/:id - Get single user
router.get(
  '/:id',
  requirePermission('users:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError('User not found', 404);

    res.json(data);
  })
);

// POST /api/users - Create new user (admin only)
router.post(
  '/',
  requireRole('administrator'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const validatedData = userCreateSchema.parse(req.body);

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true,
    });

    if (authError) {
      throw new AppError(authError.message, 400);
    }

    if (!authData.user) {
      throw new AppError('Failed to create user', 500);
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        full_name: validatedData.full_name,
        role: validatedData.role,
        phone: validatedData.phone,
      })
      .select()
      .single();

    if (profileError) {
      // Rollback: delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new AppError(profileError.message, 500);
    }

    res.status(201).json(profileData);
  })
);

// PUT /api/users/:id - Update user
router.put(
  '/:id',
  requirePermission('users:update'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const validatedData = userUpdateSchema.parse(req.body);

    // Check if user is trying to change their own role (not allowed)
    if (req.user?.id === id && validatedData.role && req.user.role !== 'administrator') {
      throw new AppError('You cannot change your own role', 403);
    }

    // Only admins can change roles
    if (validatedData.role && req.user?.role !== 'administrator') {
      throw new AppError('Only administrators can change user roles', 403);
    }

    const { data, error } = await supabase
      .from('users')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    res.json(data);
  })
);

// DELETE /api/users/:id - Delete user (admin only)
router.delete(
  '/:id',
  requireRole('administrator'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.user?.id === id) {
      throw new AppError('You cannot delete your own account', 403);
    }

    // Delete from auth (this will cascade to users table due to FK)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      throw new AppError(authError.message, 500);
    }

    res.status(204).send();
  })
);

// POST /api/users/:id/reset-password - Reset user password (admin only)
router.post(
  '/:id/reset-password',
  requireRole('administrator'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { password } = z.object({ password: z.string().min(8) }).parse(req.body);

    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password,
    });

    if (error) throw new AppError(error.message, 500);

    res.json({ message: 'Password reset successfully' });
  })
);

export default router;
