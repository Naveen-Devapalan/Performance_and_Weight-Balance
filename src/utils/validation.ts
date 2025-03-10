import { PerformanceInputs } from "./performance";
import { 
  WeightBalanceInputs, 
  calculateMinimumFuel,
  CG_LIMITS,
  DEFAULT_ARMS,
  validateCGLimits
} from "./weight-balance";
import {
  ValidationError as WeightBalanceValidationError,
  WeightLimitError,
  CGLimitError,
  FuelCapacityError,
  ErrorDetails
} from "./errors";

// Define recursive type for nested objects to avoid using 'any'
export type NestedObject = {
  [key: string]: string | number | boolean | null | undefined | NestedObject;
};

export interface FieldValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export function validateRequiredFields(inputs: PerformanceInputs): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  // Required fields validation
  const requiredFields = [
    { path: 'departure.airport', label: 'Airport' },
    { path: 'departure.elevation', label: 'Elevation' },
    { path: 'departure.runway', label: 'Runway' },
    { path: 'qnh', label: 'QNH' },
    { path: 'temperature', label: 'Temperature' },
    { path: 'wind.direction', label: 'Wind Direction' },
    { path: 'wind.speed', label: 'Wind Speed' },
    { path: 'wind.runwayHeading', label: 'Runway Heading' }
  ];

  requiredFields.forEach(({ path, label }) => {
    // Using a safer approach to navigate deeply nested objects
    const pathParts = path.split('.');
    let current: unknown = inputs;
    
    for (const part of pathParts) {
      if (current === undefined || current === null || typeof current !== 'object') {
        current = undefined;
        break;
      }
      current = (current as Record<string, unknown>)[part];
    }
    
    if (current === '' || current === null || current === undefined) {
      errors.push({
        field: path,
        message: `${label} is required`,
        type: 'error'
      });
    }
  });

  // ICAO code validation
  if (inputs.departure.airport && !/^[A-Z]{4}$/.test(inputs.departure.airport)) {
    errors.push({
      field: 'departure.airport',
      message: 'Must be a valid 4-letter ICAO code',
      type: 'error'
    });
  }

  // Numeric range validations
  const numericRanges = [
    { path: 'departure.elevation', min: -1000, max: 15000, label: 'Elevation', units: 'feet' },
    { path: 'qnh', min: 900, max: 1100, label: 'QNH', units: 'hPa' },
    { path: 'temperature', min: -30, max: 50, label: 'Temperature', units: '°C' },
    { path: 'wind.direction', min: 0, max: 360, label: 'Wind Direction', units: 'degrees' },
    { path: 'wind.speed', min: 0, max: 99, label: 'Wind Speed', units: 'knots' },
    { path: 'wind.runwayHeading', min: 0, max: 360, label: 'Runway Heading', units: 'degrees' },
    { path: 'slope.value', min: -5, max: 5, label: 'Slope', units: '%' }
  ];

  numericRanges.forEach(({ path, min, max, label, units }) => {
    // Using a safer approach to navigate deeply nested objects
    const pathParts = path.split('.');
    let current: unknown = inputs;
    
    for (const part of pathParts) {
      if (current === undefined || current === null || typeof current !== 'object') {
        current = undefined;
        break;
      }
      current = (current as Record<string, unknown>)[part];
    }
    
    const value = Number(current);
    if (!isNaN(value) && (value < min || value > max)) {
      errors.push({
        field: path,
        message: `${label} must be between ${min} and ${max} ${units}`,
        type: 'error'
      });
    }
  });

  // Runway format validation
  if (inputs.departure.runway && !/^\d{2}[LCR]?$/.test(inputs.departure.runway)) {
    errors.push({
      field: 'departure.runway',
      message: 'Must be valid runway designation (e.g., 18, 18L)',
      type: 'error'
    });
  }

  return errors;
}

export function formatValidationErrors(errors: FieldValidationError[]): { [key: string]: string } {
  return errors.reduce((acc, error) => {
    if (error.field) {
      acc[error.field] = error.message;
    }
    return acc;
  }, {} as { [key: string]: string });
}


export function validateWeightBalanceInputs(inputs: WeightBalanceInputs): ErrorDetails[] {
  const errors: ErrorDetails[] = [];

  // Empty weight validation
  try {
    const emptyWeight = Number(inputs.emptyWeight);
    if (!inputs.emptyWeight) {
      throw new WeightBalanceValidationError("Empty Weight is required", "emptyWeight");
    }
    if (isNaN(emptyWeight)) {
      throw new WeightBalanceValidationError("Empty Weight must be a valid number", "emptyWeight");
    }
    if (emptyWeight <= 0) {
      throw new WeightBalanceValidationError("Empty Weight must be greater than 0", "emptyWeight");
    }
    if (emptyWeight > CG_LIMITS.MAX_TAKEOFF_WEIGHT) {
      throw new WeightLimitError(`Empty Weight cannot exceed maximum takeoff weight (${CG_LIMITS.MAX_TAKEOFF_WEIGHT} kg)`);
    }
  } catch (error) {
    if (error instanceof WeightBalanceValidationError || error instanceof WeightLimitError) {
      errors.push({
        message: error.message,
        type: error.type,
        category: error.category,
        field: error.field,
        code: error.code
      });
    }
  }

  // Empty arm validation
  try {
    if (inputs.emptyArm) {
      const emptyArm = Number(inputs.emptyArm);
      if (isNaN(emptyArm)) {
        throw new WeightBalanceValidationError("Empty Arm must be a valid number", "emptyArm");
      }
      if (emptyArm < CG_LIMITS.FORWARD || emptyArm > CG_LIMITS.AFT) {
        throw new CGLimitError(`Empty Arm must be between ${CG_LIMITS.FORWARD} and ${CG_LIMITS.AFT} meters`);
      }
    }
  } catch (error) {
    if (error instanceof WeightBalanceValidationError || error instanceof CGLimitError) {
      errors.push({
        message: error.message,
        type: error.type,
        category: error.category,
        field: error.field,
        code: error.code
      });
    }
  }

  // Pilot weight validation
  try {
    const pilotWeight = Number(inputs.pilotWeight);
    if (!inputs.pilotWeight) {
      throw new WeightBalanceValidationError("Pilot Weight is required", "pilotWeight");
    }
    if (isNaN(pilotWeight)) {
      throw new WeightBalanceValidationError("Pilot Weight must be a valid number", "pilotWeight");
    }
    if (pilotWeight <= 0) {
      throw new WeightBalanceValidationError("Pilot Weight must be greater than 0", "pilotWeight");
    }
  } catch (error) {
    if (error instanceof WeightBalanceValidationError) {
      errors.push({
        message: error.message,
        type: error.type,
        category: error.category,
        field: error.field,
        code: error.code
      });
    }
  }

  // Passenger weight validation
  try {
    if (inputs.passengerWeight) {
      const passengerWeight = Number(inputs.passengerWeight);
      if (isNaN(passengerWeight)) {
        throw new WeightBalanceValidationError("Passenger Weight must be a valid number", "passengerWeight");
      }
      if (passengerWeight < 0) {
        throw new WeightBalanceValidationError("Passenger Weight cannot be negative", "passengerWeight");
      }
    }
  } catch (error) {
    if (error instanceof WeightBalanceValidationError) {
      errors.push({
        message: error.message,
        type: error.type,
        category: error.category,
        field: error.field,
        code: error.code
      });
    }
  }

  // Baggage weight validation
  try {
    const baggageWeight = Number(inputs.baggageWeight);
    if (inputs.baggageWeight && isNaN(baggageWeight)) {
      throw new WeightBalanceValidationError("Baggage Weight must be a valid number", "baggageWeight");
    }
    if (baggageWeight < 0) {
      throw new WeightBalanceValidationError("Baggage Weight cannot be negative", "baggageWeight");
    }
    if (baggageWeight > CG_LIMITS.MAX_BAGGAGE_WEIGHT) {
      throw new WeightLimitError(`Baggage Weight cannot exceed ${CG_LIMITS.MAX_BAGGAGE_WEIGHT} kg`);
    }
  } catch (error) {
    if (error instanceof WeightBalanceValidationError || error instanceof WeightLimitError) {
      errors.push({
        message: error.message,
        type: error.type,
        category: error.category,
        field: error.field,
        code: error.code
      });
    }
  }

  // Flight time validations
  const requiredFlightTimeFields: (keyof WeightBalanceInputs['flightTime'])[] = [
    'trip', 'alternate', 'reserve', 'taxi'
  ];
  
  requiredFlightTimeFields.forEach(field => {
    try {
      const value = Number(inputs.flightTime[field]);
      if (!inputs.flightTime[field]) {
        throw new WeightBalanceValidationError(
          `${field.charAt(0).toUpperCase() + field.slice(1)} time is required`,
          `flightTime.${field}`
        );
      }
      if (isNaN(value)) {
        throw new WeightBalanceValidationError(
          `${field.charAt(0).toUpperCase() + field.slice(1)} time must be a valid number`,
          `flightTime.${field}`
        );
      }
      if (value < 0) {
        throw new WeightBalanceValidationError(
          `${field.charAt(0).toUpperCase() + field.slice(1)} time cannot be negative`,
          `flightTime.${field}`
        );
      }
    } catch (error) {
      if (error instanceof WeightBalanceValidationError) {
        errors.push({
          message: error.message,
          type: error.type,
          category: error.category,
          field: error.field,
          code: error.code
        });
      }
    }
  });

  // Total weight validation
  try {
    const totalWeight = Number(inputs.emptyWeight) +
      Number(inputs.pilotWeight) +
      Number(inputs.passengerWeight) +
      Number(inputs.baggageWeight) +
      Number(inputs.fuelMass);

    if (totalWeight > CG_LIMITS.MAX_TAKEOFF_WEIGHT) {
      throw new WeightLimitError(
        `Total weight (${totalWeight.toFixed(1)} kg) exceeds maximum takeoff weight of ${CG_LIMITS.MAX_TAKEOFF_WEIGHT} kg`
      );
    }
  } catch (error) {
    if (error instanceof WeightLimitError) {
      errors.push({
        message: error.message,
        type: error.type,
        category: error.category,
        field: error.field,
        code: error.code
      });
    }
  }

  // CG validation
  try {
    const totalWeight = Number(inputs.emptyWeight) +
      Number(inputs.pilotWeight) +
      Number(inputs.passengerWeight) +
      Number(inputs.baggageWeight) +
      Number(inputs.fuelMass);

    const totalMoment = (Number(inputs.emptyWeight) * (Number(inputs.emptyArm) || DEFAULT_ARMS.emptyWeight)) +
      ((Number(inputs.pilotWeight) + Number(inputs.passengerWeight)) * DEFAULT_ARMS.pilotPassenger) +
      (Number(inputs.fuelMass) * DEFAULT_ARMS.fuel) +
      (Number(inputs.baggageWeight) * DEFAULT_ARMS.baggage);

    const cg = totalMoment / totalWeight;

    if (!validateCGLimits(cg)) {
      throw new CGLimitError(
        `Center of gravity (${cg.toFixed(3)} m) is outside allowed limits (${CG_LIMITS.FORWARD}-${CG_LIMITS.AFT} m)`
      );
    }
  } catch (error) {
    if (error instanceof CGLimitError) {
      errors.push({
        message: error.message,
        type: error.type,
        category: error.category,
        field: error.field,
        code: error.code
      });
    }
  }

  // Fuel capacity validation
  try {
    const minimumFuelRequired = calculateMinimumFuel(inputs);
    if (minimumFuelRequired > 120) {
      throw new FuelCapacityError(
        `Required fuel (${minimumFuelRequired.toFixed(1)}L) exceeds maximum fuel capacity of 120L`
      );
    }
  } catch (error) {
    if (error instanceof FuelCapacityError) {
      errors.push({
        message: error.message,
        type: error.type,
        category: error.category,
        field: error.field,
        code: error.code
      });
    }
  }

  return errors;
}

