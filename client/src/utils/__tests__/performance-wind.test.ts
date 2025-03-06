import { calculateWindComponents, calculateTakeoffDistance, calculateLandingDistance } from '../performance';
import { PerformanceInputs } from '../performance';

describe('Wind Calculations', () => {
  const baseInputs: PerformanceInputs = {
    departure: {
      airport: 'NZOU',
      elevation: 97,
      runway: '18',
      surface: 'B',
      toda: 1283,
      lda: 1900
    },
    slope: {
      value: 0.12,
      direction: 'U'
    },
    qnh: 1019,
    temperature: 13,
    wind: {
      direction: 145,
      speed: 12,
      runwayHeading: 180
    },
    part: 61
  };

  describe('Wind Component Calculation', () => {
    it('should calculate headwind correctly', () => {
      const result = calculateWindComponents(baseInputs);
      expect(result.part61.headwind).toBeCloseTo(9.83, 2);
      expect(result.part61.tailwind).toBeNull();
      expect(result.part61.crosswind).toBeCloseTo(6.88, 2);
    });

    it('should calculate tailwind correctly', () => {
      const tailwindInputs = {
        ...baseInputs,
        wind: {
          ...baseInputs.wind,
          direction: 360 // Wind from behind
        }
      };
      const result = calculateWindComponents(tailwindInputs);
      expect(result.part61.headwind).toBeNull();
      expect(result.part61.tailwind).toBeCloseTo(12, 2);
    });

    it('should apply Part 135 adjustments correctly', () => {
      const result = calculateWindComponents({
        ...baseInputs,
        part: 135
      });
      expect(result.part135.headwind).toBeCloseTo(4.92, 2);
      expect(result.part135.tailwind).toBeNull();
      expect(result.part135.crosswind).toBeCloseTo(6.88, 2);
    });
  });

  describe('TODA/LDA Requirements', () => {
    it('should use provided TODA for takeoff calculations', async () => {
      const customToda = 1500;
      const result = await calculateTakeoffDistance({
        ...baseInputs,
        departure: {
          ...baseInputs.departure,
          toda: customToda
        }
      });
      expect(result.toda).toBe(customToda);
    });

    it('should use provided LDA for landing calculations', async () => {
      const customLda = 2000;
      const result = await calculateLandingDistance({
        ...baseInputs,
        departure: {
          ...baseInputs.departure,
          runway: '18-landing',
          lda: customLda
        }
      });
      expect(result.lda).toBe(customLda);
    });

    it('should apply Part 135 factors to TODA/LDA', async () => {
      const customToda = 1500;
      const part135Result = await calculateTakeoffDistance({
        ...baseInputs,
        part: 135,
        departure: {
          ...baseInputs.departure,
          toda: customToda
        }
      });
      expect(part135Result.toda).toBe(Math.round(customToda * 0.85));
    });
  });

  describe('Wind Corrections in Distance Calculations', () => {
    it('should apply headwind reduction correctly', async () => {
      const noWindResult = await calculateTakeoffDistance({
        ...baseInputs,
        wind: { direction: 180, speed: 0, runwayHeading: 180 }
      });
      
      const headwindResult = await calculateTakeoffDistance(baseInputs);
      
      expect(headwindResult.windCorrectedDistance).toBeLessThan(noWindResult.windCorrectedDistance);
    });

    it('should apply tailwind increase correctly', async () => {
      const noWindResult = await calculateTakeoffDistance({
        ...baseInputs,
        wind: { direction: 180, speed: 0, runwayHeading: 180 }
      });
      
      const tailwindResult = await calculateTakeoffDistance({
        ...baseInputs,
        wind: { direction: 360, speed: 12, runwayHeading: 180 }
      });
      
      expect(tailwindResult.windCorrectedDistance).toBeGreaterThan(noWindResult.windCorrectedDistance);
    });
  });
});