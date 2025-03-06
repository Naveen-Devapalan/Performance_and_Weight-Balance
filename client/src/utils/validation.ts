import { PerformanceInputs } from "./performance";

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