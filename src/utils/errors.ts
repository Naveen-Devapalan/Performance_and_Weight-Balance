// Custom error classes for better error handling

export type ErrorType = 'error' | 'warning' | 'info';
export type ErrorCategory = 'validation' | 'calculation' | 'weight' | 'cg' | 'fuel' | 'system';

export interface ErrorDetails {
  message: string;
  type: ErrorType;
  category: ErrorCategory;
  field?: string;
  code?: string;
}

// Base error class
export class WeightBalanceError extends Error {
  public type: ErrorType;
  public category: ErrorCategory;
  public field?: string;
  public code?: string;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'WeightBalanceError';
    this.type = details.type;
    this.category = details.category;
    this.field = details.field;
    this.code = details.code;
  }
}

export class ValidationError extends WeightBalanceError {
  constructor(message: string, field?: string) {
    super({
      message,
      type: 'error',
      category: 'validation',
      field,
      code: 'VALIDATION_ERROR'
    });
    this.name = 'ValidationError';
  }
}

export class CalculationError extends WeightBalanceError {
  constructor(message: string, field?: string) {
    super({
      message,
      type: 'error',
      category: 'calculation',
      field,
      code: 'CALCULATION_ERROR'
    });
    this.name = 'CalculationError';
  }
}

export class WeightLimitError extends WeightBalanceError {
  constructor(message: string) {
    super({
      message,
      type: 'error',
      category: 'weight',
      code: 'WEIGHT_LIMIT_ERROR'
    });
    this.name = 'WeightLimitError';
  }
}

export class CGLimitError extends WeightBalanceError {
  constructor(message: string) {
    super({
      message,
      type: 'error',
      category: 'cg',
      code: 'CG_LIMIT_ERROR'
    });
    this.name = 'CGLimitError';
  }
}

export class FuelCapacityError extends WeightBalanceError {
  constructor(message: string) {
    super({
      message,
      type: 'error',
      category: 'fuel',
      code: 'FUEL_CAPACITY_ERROR'
    });
    this.name = 'FuelCapacityError';
  }
}

// Helper functions for error handling
export function createValidationError(message: string, field?: string): ValidationError {
  return new ValidationError(message, field);
}

export function createCalculationError(message: string, field?: string): CalculationError {
  return new CalculationError(message, field);
}

export function createWeightLimitError(message: string): WeightLimitError {
  return new WeightLimitError(message);
}

export function createCGLimitError(message: string): CGLimitError {
  return new CGLimitError(message);
}

export function createFuelCapacityError(message: string): FuelCapacityError {
  return new FuelCapacityError(message);
}

export function isWeightBalanceError(error: unknown): error is WeightBalanceError {
  return error instanceof WeightBalanceError;
}

export function formatError(error: unknown): ErrorDetails {
  if (isWeightBalanceError(error)) {
    return {
      message: error.message,
      type: error.type,
      category: error.category,
      field: error.field,
      code: error.code
    };
  }

  // Handle unknown errors
  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    type: 'error',
    category: 'system',
    code: 'UNKNOWN_ERROR'
  };
}