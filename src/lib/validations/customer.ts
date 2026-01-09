import { z } from 'zod';
import { field, enums } from './builders';

export const customerSchema = z.object({
  // Personal Information
  first_name: field.required('First name', 50),
  last_name: field.required('Last name', 50),
  id_number: field.idNumber(),
  email: field.email(),
  phone_primary: field.phone(9, 15),
  phone_secondary: field.phoneOptional(15),
  customer_type: enums.customerType.default('private'),
  billing_method: field.optional(50),

  // Residential Address
  residential_city: field.optional(100),
  residential_street: field.optional(100),
  residential_number: field.optional(20),
  residential_apartment: field.optional(20),
  residential_postal_code: field.optional(10),

  // Property Address
  property_city: field.optional(100),
  property_street: field.optional(100),
  property_number: field.optional(20),
  property_apartment: field.optional(20),
  property_postal_code: field.optional(10),
  property_block: field.optional(20),
  property_parcel: field.optional(20),
  property_sub_parcel: field.optional(20),
  property_lot: field.optional(20),

  // IEC Information
  iec_contract_number: field.optional(50),
  iec_order_number: field.optional(50),
  iec_meter_number: field.optional(50),
  iec_network_division: field.optional(50),

  // Notes
  notes: field.notes(1000),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export const customerSearchSchema = z.object({
  query: field.query(),
  customer_type: enums.customerType.optional(),
  city: field.optional(100),
});

export type CustomerSearchParams = z.infer<typeof customerSearchSchema>;
