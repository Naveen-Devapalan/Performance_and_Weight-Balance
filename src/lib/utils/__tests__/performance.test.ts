import { calculateTakeoffDistance, calculateLandingDistance, PerformanceInputs } from '../performance';

describe('Performance Calculations', () => {
  describe('calculateTakeoffDistance', () => {
    it('should calculate takeoff distance with standard inputs', () => {
      const inputs: PerformanceInputs = {
        departure: {
          airport: 'KSFO',
          elevation: 13,
          runway: '28R',
          surface: 'B' // Paved
        },
        slope: {
          value: 0,
          direction: 'U'
        },
        qnh: 1013,
        temperature: 20,
        wind: {
          direction: 280,
          speed: 5,
          runwayHeading: 280
        },
        part: 61
      };

      const result = calculateTakeoffDistance(inputs);
      expect(result.takeoffDistance50ft).toBeGreaterThan(0);
    });

    it('should handle extreme weather conditions', () => {
      const inputs: PerformanceInputs = {
        departure: {
          airport: 'KDEN',
          elevation: 5000,
          runway: '28R',
          surface: 'B' // Paved
        },
        slope: {
          value: 0,
          direction: 'U'
        },
        qnh: 1013,
        temperature: 35,
        wind: {
          direction: 280,
          speed: 15,
          runwayHeading: 280
        },
        part: 61
      };

      const result = calculateTakeoffDistance(inputs);
      expect(result.takeoffDistance50ft).toBeGreaterThan(0);
    });
  });

  describe('calculateLandingDistance', () => {
    it('should calculate landing distance with standard inputs', () => {
      const inputs: PerformanceInputs = {
        departure: {
          airport: 'KSFO',
          elevation: 13,
          runway: '28R',
          surface: 'B' // Paved
        },
        slope: {
          value: 0,
          direction: 'U'
        },
        qnh: 1013,
        temperature: 20,
        wind: {
          direction: 280,
          speed: 5,
          runwayHeading: 280
        },
        part: 61
      };

      const result = calculateLandingDistance(inputs);
      expect(result.landingDistance50ft).toBeGreaterThan(0);
    });
  });
});
