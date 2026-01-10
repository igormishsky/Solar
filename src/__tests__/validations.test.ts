import {
  loginSchema,
  signUpSchema,
  changePasswordSchema,
} from '../lib/validations/auth';
import { customerSchema } from '../lib/validations/customer';
import { projectSchema } from '../lib/validations/project';
import { taskSchema } from '../lib/validations/task';

describe('Auth Validations', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '1234567',
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('signUpSchema', () => {
    it('should validate correct signup data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        fullName: 'John Doe',
      };
      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password',
        fullName: 'John Doe',
      };
      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password456',
        fullName: 'John Doe',
      };
      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate correct password change data', () => {
      const validData = {
        currentPassword: 'oldPassword123',
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      };
      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty current password', () => {
      const invalidData = {
        currentPassword: '',
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      };
      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched new passwords', () => {
      const invalidData = {
        currentPassword: 'oldPassword123',
        password: 'NewPassword123',
        confirmPassword: 'DifferentPassword123',
      };
      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Customer Validations', () => {
  describe('customerSchema', () => {
    it('should validate correct customer data', () => {
      const validData = {
        first_name: 'John',
        last_name: 'Doe',
        phone_primary: '0501234567',
        customer_type: 'private',
      };
      const result = customerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        first_name: 'John',
        // missing last_name and phone_primary
      };
      const result = customerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate customer with optional fields', () => {
      const validData = {
        first_name: 'Jane',
        last_name: 'Smith',
        phone_primary: '0521234567',
        customer_type: 'business',
        email: 'jane@company.com',
        residential_city: 'Tel Aviv',
        notes: 'VIP customer',
      };
      const result = customerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Project Validations', () => {
  describe('projectSchema', () => {
    it('should validate correct project data', () => {
      const validData = {
        name: 'Solar Installation Project',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'pending',
        current_stage: 'request_opened',
      };
      const result = projectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const invalidData = {
        name: 'Solar Installation Project',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'invalid_status',
        current_stage: 'request_opened',
      };
      const result = projectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate project with system specs', () => {
      const validData = {
        name: 'Residential Solar',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'in_progress',
        current_stage: 'payment_processed',
        system_size_kw: 10.5,
        panel_count: 20,
        inverter_model: 'SolarEdge SE10000H',
        estimated_annual_production: 15000,
      };
      const result = projectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Task Validations', () => {
  describe('taskSchema', () => {
    it('should validate correct task data', () => {
      const validData = {
        title: 'Complete site survey',
        priority: 'high',
        status: 'pending',
      };
      const result = taskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        priority: 'medium',
        status: 'pending',
      };
      const result = taskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid priority', () => {
      const invalidData = {
        title: 'Some task',
        priority: 'super_urgent',
        status: 'pending',
      };
      const result = taskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate task with all fields', () => {
      const validData = {
        title: 'Install panels',
        description: 'Install 20 solar panels on the roof',
        priority: 'urgent',
        status: 'in_progress',
        project_id: '123e4567-e89b-12d3-a456-426614174000',
        due_date: '2024-12-31',
      };
      const result = taskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
