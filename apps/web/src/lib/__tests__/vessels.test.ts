import { describe, it, expect } from 'vitest';
import {
  mapMaerskVesselToVessel,
  mapMaerskVesselToVesselBrief,
  validateVesselSearchParams,
  type MaerskVessel
} from '../types/vessels';

describe('Vessels Functions', () => {
  describe('mapMaerskVesselToVessel', () => {
    it('должен маппить Maersk судно в наш тип Vessel', () => {
      const mockMaerskVessel: MaerskVessel = {
        vesselIMONumber: 1234567,
        carrierVesselCode: 'MAEU',
        vesselShortName: 'MAERSK SEVILLE',
        vesselLongName: 'MAERSK SEVILLE',
        vesselFlagCode: 'DK',
        vesselBuiltYear: 2018,
        vesselCallSign: 'OYGR2',
        vesselCapacityTEU: 15000
      };

      const result = mapMaerskVesselToVessel(mockMaerskVessel);

      expect(result).toEqual({
        imoNumber: '1234567',
        name: 'MAERSK SEVILLE',
        carrierCode: 'MAEU',
        capacity: 15000,
        builtYear: 2018,
        flag: 'DK'
      });
    });

    it('должен обрабатывать отсутствующие поля', () => {
      const mockMaerskVessel: MaerskVessel = {
        vesselIMONumber: 1234567,
        carrierVesselCode: 'MAEU',
        vesselShortName: 'MAERSK SEVILLE',
        vesselLongName: '',
        vesselFlagCode: undefined,
        vesselBuiltYear: undefined,
        vesselCallSign: undefined,
        vesselCapacityTEU: undefined
      };

      const result = mapMaerskVesselToVessel(mockMaerskVessel);

      expect(result).toEqual({
        imoNumber: '1234567',
        name: 'MAERSK SEVILLE', // Использует vesselShortName
        carrierCode: 'MAEU',
        capacity: 0,
        builtYear: 0,
        flag: 'Unknown'
      });
    });
  });

  describe('mapMaerskVesselToVesselBrief', () => {
    it('должен маппить Maersk судно в VesselBrief', () => {
      const mockMaerskVessel: MaerskVessel = {
        vesselIMONumber: 1234567,
        carrierVesselCode: 'MAEU',
        vesselShortName: 'MAERSK SEVILLE',
        vesselLongName: 'MAERSK SEVILLE',
        vesselFlagCode: 'DK',
        vesselBuiltYear: 2018,
        vesselCallSign: 'OYGR2',
        vesselCapacityTEU: 15000
      };

      const result = mapMaerskVesselToVesselBrief(mockMaerskVessel);

      expect(result).toEqual({
        imo: '1234567',
        name: 'MAERSK SEVILLE',
        operator: 'MAEU',
        size: 15000,
        flag: 'DK',
        builtYear: 2018
      });
    });

    it('должен обрабатывать отсутствующие поля в VesselBrief', () => {
      const mockMaerskVessel: MaerskVessel = {
        vesselIMONumber: 1234567,
        carrierVesselCode: 'MAEU',
        vesselShortName: 'MAERSK SEVILLE',
        vesselLongName: '',
        vesselFlagCode: undefined,
        vesselBuiltYear: undefined,
        vesselCallSign: undefined,
        vesselCapacityTEU: undefined
      };

      const result = mapMaerskVesselToVesselBrief(mockMaerskVessel);

      expect(result).toEqual({
        imo: '1234567',
        name: 'MAERSK SEVILLE',
        operator: 'MAEU',
        size: 0,
        flag: undefined,
        builtYear: undefined
      });
    });
  });

  describe('validateVesselSearchParams', () => {
    it('должен валидировать корректные параметры', () => {
      const params = {
        vesselIMONumbers: [1234567],
        carrierVesselCodes: ['MAE'],
        vesselNames: ['MAERSK'],
        vesselFlagCodes: ['DK'],
        limit: 10
      };

      const errors = validateVesselSearchParams(params);
      expect(errors).toHaveLength(0);
    });

    it('должен возвращать ошибки для неверного IMO', () => {
      const params = {
        vesselIMONumbers: [123456] // 6 цифр вместо 7
      };

      const errors = validateVesselSearchParams(params);
      expect(errors).toContain('vesselIMONumbers must be 7-digit integers');
    });

    it('должен возвращать ошибки для неверного кода перевозчика', () => {
      const params = {
        carrierVesselCodes: ['MAE'] // 3 символа - корректно
      };

      const errors = validateVesselSearchParams(params);
      expect(errors).toHaveLength(0);

      const invalidParams = {
        carrierVesselCodes: ['MA'] // 2 символа - неверно
      };

      const invalidErrors = validateVesselSearchParams(invalidParams);
      expect(invalidErrors).toContain('carrierVesselCodes must be 3-character strings');
    });

    it('должен возвращать ошибки для неверного названия судна', () => {
      const params = {
        vesselNames: ['M'] // 1 символ - неверно
      };

      const errors = validateVesselSearchParams(params);
      expect(errors).toContain('vesselNames must be strings with at least 2 characters');
    });

    it('должен возвращать ошибки для неверного кода флага', () => {
      const params = {
        vesselFlagCodes: ['D'] // 1 символ - неверно
      };

      const errors = validateVesselSearchParams(params);
      expect(errors).toContain('vesselFlagCodes must be 2-character strings');
    });

    it('должен возвращать ошибки для неверного лимита', () => {
      const params = {
        limit: 0 // Неверно
      };

      const errors = validateVesselSearchParams(params);
      expect(errors).toContain('limit must be between 1 and 100');
    });

    it('должен возвращать ошибки для превышения лимита массивов', () => {
      const params = {
        vesselIMONumbers: Array.from({ length: 51 }, (_, i) => 1000000 + i)
      };

      const errors = validateVesselSearchParams(params);
      expect(errors).toContain('vesselIMONumbers cannot exceed 50 items');
    });
  });
});
