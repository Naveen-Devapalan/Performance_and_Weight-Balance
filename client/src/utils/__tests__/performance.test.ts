import { Database } from 'sqlite3';
import {
  calculatePressureAltitude,
  calculateWindComponents,
  calculateTakeoffDistance,
  calculateLandingDistance,
  PerformanceInputs
} from '../performance';

// Mock sqlite3 Database
jest.mock('sqlite3', () => ({
  Database: jest.fn(() => ({
    all: jest.fn((query: string, params: any[], callback: Function) => {
      if (query.includes('SELECT DISTINCT pressure_altitude')) {
        callback(null, [
          { pressure_altitude: 200 },
          { pressure_altitude: 400 }
        ]);
      } else if (query.includes('takeoff_distance')) {
        const rows = [
          { pressure_altitude: 200, condition: 'Ground Roll', lower_temp: 300, upper_temp: 400 },
          { pressure_altitude: 400, condition: 'Ground Roll', lower_temp: 330, upper_temp: 440 },
          { pressure_altitude: 200, condition: 'Distance 50ft', lower_temp: 600, upper_temp: 800 },
          { pressure_altitude: 400, condition: 'Distance 50ft', lower_temp: 660, upper_temp: 880 }
        ];
        callback(null, rows);
      } else if (query.includes('landing_distance')) {
        const rows = [
          { pressure_altitude: 200, condition: 'Ground Roll', lower_temp: 250, upper_temp: 350 },
          { pressure_altitude: 400, condition: 'Ground Roll', lower_temp: 275, upper_temp: 385 },
          { pressure_altitude: 200, condition: 'Distance 50ft', lower_temp: 500, upper_temp: 700 },
          { pressure_altitude: 400, condition: 'Distance 50ft', lower_temp: 550, upper_temp: 770 }
        ];
        callback(null, rows);
      }
    })
  }))
}));

describe('Performance Calculations', () => {
  const sampleInput: PerformanceInputs = {
    departure: {
      airport: 'EGKR',
      elevation: 222,
      runway: '07',
      surface: 'B'
    },
    slope: {
      value: 1,
      direction: 'U'
    },
    qnh: 1013,
    temperature: 15,
    wind: {
      direction: 360,
      speed: 10,
      runwayHeading: 70
    },
    part: 61
  };

  describe('calculatePressureAltitude', () => {
    it('should calculate pressure altitude correctly', () => {
      const result = calculatePressureAltitude(1013, 222);
      expect(result.result).toBe(222);
      expect(result.calculation).toBe('(1013 - 1013) x 30 = 0 FT + 222 FT (ELEVATION) = 222 FT (PRESSURE ALTITUDE)');
    });

    it('should handle pressure differences', () => {
      const result = calculatePressureAltitude(1000, 222);
      expect(result.result).toBe(612);
      expect(result.calculation).toBe('(1013 - 1000) x 30 = 390 FT + 222 FT (ELEVATION) = 612 FT (PRESSURE ALTITUDE)');
    });
  });

  describe('calculateWindComponents', () => {
    it('should calculate wind components correctly for Part 61', () => {
      const result = calculateWindComponents(sampleInput);
      expect(result.part61.headwind).toBeDefined();
      expect(result.part61.crosswind).toBeDefined();
      // Verify the headwind and crosswind calculations based on the 290-degree angle difference
      expect(result.part61.tailwind).toBeNull();
    });

    it('should apply Part 135 wind corrections', () => {
      const part135Input: PerformanceInputs = { ...sampleInput, part: 135 as 61 | 135 };
      const result = calculateWindComponents(part135Input);
      expect(result.part135.headwind).toBeDefined();
      expect(result.part135.crosswind).toBeDefined();
      // Part 135 applies more conservative factors
      expect(result.part135.tailwind).toBeNull();
    });
  });

  describe('calculateTakeoffDistance', () => {
    it('should calculate takeoff performance', async () => {
      const result = await calculateTakeoffDistance(sampleInput);
      expect(result.groundRoll).toBeGreaterThan(0);
      expect(result.takeoffDistance50ft).toBeGreaterThan(result.groundRoll);
      expect(result.finalTakeoffDistance).toBeGreaterThan(0);
      expect(result.isFeasible).toBeDefined();
    });

    it('should apply surface corrections for paved runway', async () => {
      const result = await calculateTakeoffDistance(sampleInput);
      expect(result.surfaceCorrectedDistance).toBeLessThan(result.windCorrectedDistance);
    });

    it('should apply slope corrections for uphill', async () => {
      const result = await calculateTakeoffDistance(sampleInput);
      // Uphill slope increases takeoff distance
      expect(result.slopeCorrectedDistance).toBeGreaterThan(result.surfaceCorrectedDistance);
    });
  });

  describe('calculateLandingDistance', () => {
    it('should calculate landing performance', async () => {
      const result = await calculateLandingDistance(sampleInput);
      expect(result.groundRoll).toBeGreaterThan(0);
      expect(result.landingDistance50ft).toBeGreaterThan(result.groundRoll);
      expect(result.finalLandingDistance).toBeGreaterThan(0);
      expect(result.isFeasible).toBeDefined();
    });

    it('should apply surface corrections for paved runway', async () => {
      const result = await calculateLandingDistance(sampleInput);
      expect(result.surfaceCorrectedDistance).toBeLessThan(result.windCorrectedDistance);
    });

    it('should apply slope corrections for uphill', async () => {
      const result = await calculateLandingDistance(sampleInput);
      // Uphill slope decreases landing distance
      expect(result.slopeCorrectedDistance).toBeLessThan(result.surfaceCorrectedDistance);
    });
  });
});