import { PerformanceInputs } from "./performance";
import { 
  WeightBalanceInputs, 
  CONVERSION_FACTORS, 
  calculateMinimumFuel,
  CG_LIMITS
} from "./weight-balance";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRequiredFields(inputs: PerformanceInputs): ValidationError[] {
  const errors: ValidationError[] = [];

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
    const value = path.split('.').reduce((obj: any, key) => obj?.[key], inputs);
    if (value === '' || value === null || value === undefined) {
      errors.push({
        field: path,
        message: `${label} is required`
      });
    }
  });

  // ICAO code validation
  if (inputs.departure.airport && !/^[A-Z]{4}$/.test(inputs.departure.airport)) {
    errors.push({
      field: 'departure.airport',
      message: 'Must be a valid 4-letter ICAO code'
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
    const value = Number(path.split('.').reduce((obj: any, key) => obj?.[key], inputs));
    if (!isNaN(value) && (value < min || value > max)) {
      errors.push({
        field: path,
        message: `${label} must be between ${min} and ${max} ${units}`
      });
    }
  });

  // Runway format validation
  if (inputs.departure.runway && !/^\d{2}[LCR]?$/.test(inputs.departure.runway)) {
    errors.push({
      field: 'departure.runway',
      message: 'Must be valid runway designation (e.g., 18, 18L)'
    });
  }

  return errors;
}

export function formatValidationErrors(errors: ValidationError[]): { [key: string]: string } {
  return errors.reduce((acc, { field, message }) => ({
    ...acc,
    [field]: message
  }), {});
}

// Start writing validations for weight and balance from here.

export function validateWeightBalanceInputs(inputs: WeightBalanceInputs): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Mandatory field validation with NaN and non-negative check
  if (inputs.emptyWeight == null || isNaN(inputs.emptyWeight)) {
    errors.push({ field: "emptyWeight", message: "Empty Weight is required" });
  } else if (inputs.emptyWeight < 0) {
    errors.push({ field: "emptyWeight", message: "Empty Weight must be zero or positive" });
  }
  if (inputs.pilotWeight == null || isNaN(inputs.pilotWeight)) {
    errors.push({ field: "pilotWeight", message: "Pilot Weight is required" });
  } else if (inputs.pilotWeight < 0) {
    errors.push({ field: "pilotWeight", message: "Pilot Weight must be zero or positive" });
  }
  if (inputs.passengerWeight == null || isNaN(inputs.passengerWeight)) {
    errors.push({ field: "passengerWeight", message: "Passenger Weight is required" });
  } else if (inputs.passengerWeight < 0) {
    errors.push({ field: "passengerWeight", message: "Passenger Weight must be zero or positive" });
  }
  if (inputs.baggageWeight == null || isNaN(inputs.baggageWeight)) {
    errors.push({ field: "baggageWeight", message: "Baggage Weight is required" });
  } else if (inputs.baggageWeight < 0) {
    errors.push({ field: "baggageWeight", message: "Baggage Weight must be zero or positive" });
  }
  if (inputs.fuelMass == null || isNaN(inputs.fuelMass)) {
    errors.push({ field: "fuelMass", message: "Fuel Mass is required" });
  } else if (inputs.fuelMass < 0) {
    errors.push({ field: "fuelMass", message: "Fuel Mass must be zero or positive" });
  }
  
  const flightTimeFields: (keyof WeightBalanceInputs["flightTime"])[] = ["trip", "alternate", "other", "reserve", "taxi"];
  flightTimeFields.forEach(field => {
    if (inputs.flightTime[field] == null || isNaN(inputs.flightTime[field])) {
      errors.push({ field: `flightTime.${field}`, message: `Flight Time ${field} is required` });
    } else if (inputs.flightTime[field] < 0) {
      errors.push({ field: `flightTime.${field}`, message: `Flight Time ${field} must be zero or positive` });
    }
  });
  
  // Maximum baggage weight check
  if (inputs.baggageWeight > 20) {
    errors.push({ field: "baggageWeight", message: "Baggage Weight cannot exceed 20 kg" });
  }
  
  // Calculate takeoff weight with proper precision
  const takeoffWeight = Number((
    inputs.emptyWeight + 
    inputs.pilotWeight + 
    inputs.passengerWeight + 
    inputs.fuelMass + 
    inputs.baggageWeight
  ).toFixed(2));

  // Add small tolerance (0.01) to account for floating-point precision
  if (takeoffWeight > (CG_LIMITS.MAX_TAKEOFF_WEIGHT + 0.01)) {
    errors.push({ 
      field: "takeoffWeight", 
      message: `Takeoff Weight (${takeoffWeight} kg) cannot exceed ${CG_LIMITS.MAX_TAKEOFF_WEIGHT} kg` 
    });
  }
  
  // Fuel capacity check (total fuel in litres should not exceed 120 L)
  const totalFuelLitres = calculateMinimumFuel(inputs);
  if (totalFuelLitres > 120) {
    errors.push({ field: "fuelMass", message: "Fuel capacity cannot exceed 120 L" });
  }
  
  return errors;
}

