import {
  cn,
  formatDate,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatKWh,
  formatKW,
  truncate,
  capitalize,
  getInitials,
  formatPhoneNumber,
  isValidEmail,
  isValidIsraeliPhone,
  isValidIsraeliId,
  getStatusColor,
  getPriorityColor,
  isLicenseExpiring,
  isLicenseExpired,
  groupBy,
} from '../lib/utils';

describe('Utility Functions', () => {
  describe('cn (class names)', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should handle undefined values', () => {
      expect(cn('foo', undefined, 'bar')).toBe('foo bar');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = '2024-01-15';
      const result = formatDate(date, 'en');
      expect(result).toBe('15/01/2024');
    });
  });

  describe('formatNumber', () => {
    it('should format number with locale', () => {
      expect(formatNumber(1234567, 'en-US')).toBe('1,234,567');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = formatCurrency(100, 'ILS', 'he-IL');
      expect(result).toContain('100');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with default decimals', () => {
      expect(formatPercentage(85.567)).toBe('85.6%');
    });

    it('should format percentage with custom decimals', () => {
      expect(formatPercentage(85.567, 2)).toBe('85.57%');
    });
  });

  describe('formatKWh', () => {
    it('should format small values in kWh', () => {
      expect(formatKWh(500)).toBe('500.00 kWh');
    });

    it('should format medium values in MWh', () => {
      expect(formatKWh(5000)).toBe('5.00 MWh');
    });

    it('should format large values in GWh', () => {
      expect(formatKWh(5000000)).toBe('5.00 GWh');
    });
  });

  describe('formatKW', () => {
    it('should format small values in kW', () => {
      expect(formatKW(50)).toBe('50.00 kW');
    });

    it('should format large values in MW', () => {
      expect(formatKW(5000)).toBe('5.00 MW');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
    });

    it('should not truncate short strings', () => {
      expect(truncate('Hi', 5)).toBe('Hi');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should lowercase rest of string', () => {
      expect(capitalize('HELLO')).toBe('Hello');
    });
  });

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should limit to 2 characters', () => {
      expect(getInitials('John Michael Doe')).toBe('JM');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10 digit Israeli mobile', () => {
      expect(formatPhoneNumber('0501234567')).toBe('050-123-4567');
    });

    it('should format 9 digit Israeli landline', () => {
      expect(formatPhoneNumber('031234567')).toBe('003-123-4567');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('isValidIsraeliPhone', () => {
    it('should validate 10 digit mobile', () => {
      expect(isValidIsraeliPhone('0501234567')).toBe(true);
    });

    it('should validate 9 digit landline', () => {
      expect(isValidIsraeliPhone('031234567')).toBe(true);
    });

    it('should reject invalid phone', () => {
      expect(isValidIsraeliPhone('123')).toBe(false);
    });
  });

  describe('isValidIsraeliId', () => {
    it('should validate correct ID', () => {
      // 000000018 is a valid Israeli ID
      expect(isValidIsraeliId('000000018')).toBe(true);
    });

    it('should reject invalid ID', () => {
      expect(isValidIsraeliId('123456789')).toBe(false);
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for pending status', () => {
      expect(getStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800');
    });

    it('should return correct color for completed status', () => {
      expect(getStatusColor('completed')).toBe('bg-green-100 text-green-800');
    });

    it('should return default color for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('getPriorityColor', () => {
    it('should return correct color for urgent priority', () => {
      expect(getPriorityColor('urgent')).toBe('border-l-red-500');
    });

    it('should return correct color for high priority', () => {
      expect(getPriorityColor('high')).toBe('border-l-orange-400');
    });

    it('should return default color for unknown priority', () => {
      expect(getPriorityColor('unknown')).toBe('border-l-gray-400');
    });
  });

  describe('isLicenseExpiring', () => {
    it('should return true for license expiring within threshold', () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 15); // 15 days from now
      expect(isLicenseExpiring(expiryDate, 30)).toBe(true);
    });

    it('should return false for license not expiring soon', () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 60); // 60 days from now
      expect(isLicenseExpiring(expiryDate, 30)).toBe(false);
    });
  });

  describe('isLicenseExpired', () => {
    it('should return true for expired license', () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - 1); // yesterday
      expect(isLicenseExpired(expiryDate)).toBe(true);
    });

    it('should return false for valid license', () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now
      expect(isLicenseExpired(expiryDate)).toBe(false);
    });
  });

  describe('groupBy', () => {
    it('should group array by key', () => {
      const items = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
      ];
      const grouped = groupBy(items, 'category');
      expect(grouped).toEqual({
        A: [{ category: 'A', value: 1 }, { category: 'A', value: 3 }],
        B: [{ category: 'B', value: 2 }],
      });
    });
  });
});
