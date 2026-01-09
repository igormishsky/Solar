import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

// Tailwind class merging
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Date formatting with locale support
export const getDateLocale = (lang: string) => {
  return lang === 'he' ? he : enUS;
};

export const formatDate = (date: string | Date, lang: string = 'he'): string => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: getDateLocale(lang) });
};

export const formatDateTime = (date: string | Date, lang: string = 'he'): string => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: getDateLocale(lang) });
};

export const formatTimeAgo = (date: string | Date, lang: string = 'he'): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: getDateLocale(lang) });
};

export const formatDateShort = (date: string | Date, lang: string = 'he'): string => {
  return format(new Date(date), 'dd MMM', { locale: getDateLocale(lang) });
};

// Number formatting
export const formatNumber = (num: number, locale: string = 'he-IL'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

export const formatCurrency = (amount: number, currency: string = 'ILS', locale: string = 'he-IL'): string => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatKWh = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)} GWh`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} MWh`;
  }
  return `${value.toFixed(2)} kWh`;
};

export const formatKW = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} MW`;
  }
  return `${value.toFixed(2)} kW`;
};

// String utilities
export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatPhoneNumber = (phone: string): string => {
  // Israeli phone format
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 9) {
    return `0${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
};

// Validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidIsraeliPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  // Israeli mobile: 05X-XXX-XXXX (10 digits)
  // Israeli landline: 0X-XXX-XXXX (9 digits)
  return cleaned.length === 10 || cleaned.length === 9;
};

export const isValidIsraeliId = (id: string): boolean => {
  // Israeli ID validation (Luhn-like algorithm)
  const cleaned = id.replace(/\D/g, '').padStart(9, '0');
  if (cleaned.length !== 9) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(cleaned[i]) * ((i % 2) + 1);
    if (digit > 9) digit -= 9;
    sum += digit;
  }
  return sum % 10 === 0;
};

// Local storage helpers
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const saveToLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Status colors for UI
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    // Project statuses
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    on_hold: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    // Task priorities
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
    // Form statuses
    draft: 'bg-gray-100 text-gray-800',
    review: 'bg-yellow-100 text-yellow-800',
    signature_pending: 'bg-purple-100 text-purple-800',
    submitted: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    // General
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: 'border-l-gray-400',
    medium: 'border-l-blue-400',
    high: 'border-l-orange-400',
    urgent: 'border-l-red-500',
  };
  return colors[priority] || 'border-l-gray-400';
};

// License expiry helpers
export const isLicenseExpiring = (expiryDate: string | Date, daysThreshold: number = 30): boolean => {
  const expiry = new Date(expiryDate);
  const threshold = addDays(new Date(), daysThreshold);
  return isBefore(expiry, threshold) && isAfter(expiry, new Date());
};

export const isLicenseExpired = (expiryDate: string | Date): boolean => {
  return isBefore(new Date(expiryDate), new Date());
};

// Generate unique ID
export const generateId = (): string => {
  return crypto.randomUUID();
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Group array by key
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};
