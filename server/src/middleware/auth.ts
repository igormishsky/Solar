import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      role: profile.role,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Permission-based middleware
export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requirePermission = (permission: string) => {
  const ROLE_PERMISSIONS: Record<string, string[]> = {
    administrator: ['*'],
    manager: [
      'customers:read', 'customers:create', 'customers:update',
      'projects:read', 'projects:create', 'projects:update',
      'tasks:*',
      'professionals:read', 'professionals:create', 'professionals:update',
      'documents:read', 'documents:upload',
      'forms:read', 'forms:update', 'forms:approve',
      'reports:view', 'reports:export',
    ],
    office_staff: [
      'customers:read', 'customers:create', 'customers:update',
      'projects:read', 'projects:create', 'projects:update',
      'tasks:read', 'tasks:create', 'tasks:update',
      'professionals:read',
      'documents:read', 'documents:upload',
      'forms:read', 'forms:update',
      'reports:view',
    ],
    field_technician: [
      'customers:read',
      'projects:read',
      'tasks:read', 'tasks:update',
      'professionals:read',
      'documents:read', 'documents:upload',
      'forms:read',
    ],
    viewer: [
      'customers:read',
      'projects:read',
      'tasks:read',
      'professionals:read',
      'documents:read',
      'forms:read',
      'reports:view',
    ],
  };

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];

    if (
      userPermissions.includes('*') ||
      userPermissions.includes(permission) ||
      userPermissions.some((p) => p.endsWith(':*') && permission.startsWith(p.replace(':*', ':')))
    ) {
      return next();
    }

    return res.status(403).json({ error: 'Insufficient permissions' });
  };
};
