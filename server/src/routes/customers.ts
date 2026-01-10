import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { supabase } from '../lib';

const router = Router();

// Validation schemas
const customerSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone_primary: z.string().min(1),
  email: z.string().email().optional().nullable(),
  customer_type: z.enum(['private', 'business', 'institutional']).default('private'),
  id_number: z.string().optional().nullable(),
  phone_secondary: z.string().optional().nullable(),
  billing_method: z.string().optional().nullable(),
  residential_city: z.string().optional().nullable(),
  residential_street: z.string().optional().nullable(),
  residential_number: z.string().optional().nullable(),
  residential_apartment: z.string().optional().nullable(),
  residential_postal_code: z.string().optional().nullable(),
  property_city: z.string().optional().nullable(),
  property_street: z.string().optional().nullable(),
  property_number: z.string().optional().nullable(),
  property_apartment: z.string().optional().nullable(),
  property_postal_code: z.string().optional().nullable(),
  property_block: z.string().optional().nullable(),
  property_parcel: z.string().optional().nullable(),
  property_sub_parcel: z.string().optional().nullable(),
  property_lot: z.string().optional().nullable(),
  iec_contract_number: z.string().optional().nullable(),
  iec_order_number: z.string().optional().nullable(),
  iec_meter_number: z.string().optional().nullable(),
  iec_network_division: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// GET /api/customers - List all customers
router.get(
  '/',
  requirePermission('customers:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { customer_type, city, query, page = 1, limit = 50 } = req.query;

    let dbQuery = supabase.from('customers').select('*', { count: 'exact' });

    if (customer_type) {
      dbQuery = dbQuery.eq('customer_type', customer_type);
    }

    if (city) {
      dbQuery = dbQuery.or(
        `residential_city.ilike.%${city}%,property_city.ilike.%${city}%`
      );
    }

    if (query) {
      dbQuery = dbQuery.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone_primary.ilike.%${query}%,email.ilike.%${query}%`
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

// GET /api/customers/:id - Get single customer
router.get(
  '/:id',
  requirePermission('customers:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError('Customer not found', 404);

    res.json(data);
  })
);

// POST /api/customers - Create customer
router.post(
  '/',
  requirePermission('customers:create'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const validatedData = customerSchema.parse(req.body);

    const { data, error } = await supabase
      .from('customers')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    res.status(201).json(data);
  })
);

// PUT /api/customers/:id - Update customer
router.put(
  '/:id',
  requirePermission('customers:update'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const validatedData = customerSchema.partial().parse(req.body);

    const { data, error } = await supabase
      .from('customers')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    res.json(data);
  })
);

// DELETE /api/customers/:id - Delete customer
router.delete(
  '/:id',
  requirePermission('customers:delete'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    const { error } = await supabase.from('customers').delete().eq('id', id);

    if (error) throw new AppError(error.message, 500);

    res.status(204).send();
  })
);

export default router;
