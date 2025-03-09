import { formatValidationErrors, validateRequiredFields } from '../../utils/validation';
import { PerformanceInputs } from '../../utils/performance';

describe('Validation Utility', () => {
  describe('formatValidationErrors', () => {
    it('should convert ValidationError array to object format', () => {
      const errors = [
        { field: 'qnh', message: 'QNH is required' },
        { field: 'temperature', message: 'Temperature must be between -30 and 50 °C' }
      ];
      
      const formattedErrors = formatValidationErrors(errors);
      
      expect(formattedErrors).toEqual({
        'qnh': 'QNH is required',
        'temperature': 'Temperature must be between -30 and 50 °C'
      });
    });
    
    it('should return empty object when no errors', () => {
      const formattedErrors = formatValidationErrors([]);
      expect(formattedErrors).toEqual({});
    });
  });
  
  describe('validateRequiredFields', () => {
    it('should detect missing required fields', () => {
      const incompleteInputs: PerformanceInputs = {
        departure: {
          airport: '',
          elevation: '',
          runway: '18',
          surface: 'B',
          toda: 1500,
          lda: 1500
        },
        qnh: 1013,
        temperature: 25,
        wind: {
          direction: 180,
          speed: 10,
          runwayHeading: 180
        },
        slope: {
          value: 0,
          direction: 'U'
        },
        part: 61
      };
      
      const errors = validateRequiredFields(incompleteInputs);
      
      // Should catch the empty airport field
      expect(errors.some(e => e.field === 'departure.airport')).toBe(true);
      // Should catch the empty elevation field
      expect(errors.some(e => e.field === 'departure.elevation')).toBe(true);
    });
    
    it('should validate ICAO airport code format', () => {
      const inputsWithBadAirport: PerformanceInputs = {
        departure: {
          airport: 'ABC', // Not a 4-letter ICAO code
          elevation: 500,
          runway: '18',
          surface: 'B',
          toda: 1500,
          lda: 1500
        },
        qnh: 1013,
        temperature: 25,
        wind: {
          direction: 180,
          speed: 10,
          runwayHeading: 180
        },
        slope: {
          value: 0,
          direction: 'U'
        },
        part: 61
      };
      
      const errors = validateRequiredFields(inputsWithBadAirport);
      
      // Should catch the invalid airport code
      expect(errors.some(e => e.field === 'departure.airport')).toBe(true);
    });
  });
});