import { z } from 'zod';

export const customerSchema = z.object({
  // Personal Information
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less'),
  id_number: z
    .string()
    .regex(/^\d{9}$/, 'ID number must be 9 digits')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  phone_primary: z
    .string()
    .min(9, 'Phone number must be at least 9 digits')
    .max(15, 'Phone number must be 15 characters or less'),
  phone_secondary: z
    .string()
    .max(15, 'Phone number must be 15 characters or less')
    .optional()
    .or(z.literal('')),
  customer_type: z.enum(['private', 'business', 'institutional']).default('private'),
  billing_method: z.string().optional(),

  // Residential Address
  residential_city: z.string().optional(),
  residential_street: z.string().optional(),
  residential_number: z.string().optional(),
  residential_apartment: z.string().optional(),
  residential_postal_code: z.string().optional(),

  // Property Address
  property_city: z.string().optional(),
  property_street: z.string().optional(),
  property_number: z.string().optional(),
  property_apartment: z.string().optional(),
  property_postal_code: z.string().optional(),
  property_block: z.string().optional(),
  property_parcel: z.string().optional(),
  property_sub_parcel: z.string().optional(),
  property_lot: z.string().optional(),

  // IEC Information
  iec_contract_number: z.string().optional(),
  iec_order_number: z.string().optional(),
  iec_meter_number: z.string().optional(),
  iec_network_division: z.string().optional(),

  // Notes
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export const customerSearchSchema = z.object({
  query: z.string().optional(),
  customer_type: z.enum(['private', 'business', 'institutional']).optional(),
  city: z.string().optional(),
});

export type CustomerSearchParams = z.infer<typeof customerSearchSchema>;
