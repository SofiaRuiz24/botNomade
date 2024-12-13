import { crearReclamo, obtenerReclamo } from '../controller/reclamoController';
import ReclamoModel from '../model/Reclamo';
import fs from 'fs/promises';
import logger from '../logs/logger';
import { Model } from 'mongoose';
import { Reclamo } from '../model/Reclamo';

// Mock dependencies
jest.mock('../model/Reclamo');
jest.mock('fs/promises');
jest.mock('../logs/logger');

describe('reclamoController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearReclamo', () => {
    const mockReclamo = {
      id: '123',
      type: 'test',
      name: 'Test User',
      lastname: 'Test Last',
      docType: 'DNI',
      docNumber: '12345678',
      phone: '123456789',
      email: 'test@test.com',
      address: 'Test Address',
      direcNum: '123',
      piso: '1',
      dpto: 'A',
      descriptionRec: 'Test description',
      dateRec: '2024-01-01',
      estado: 'Pendiente',
      usuario: 'testuser',
      _id: '123'
    };

    it('should create a reclamo without image', async () => {
      const mockSave = jest.fn().mockResolvedValue(mockReclamo);
      (ReclamoModel as jest.MockedClass<typeof Model>).mockImplementation(() => ({
        save: mockSave
      } as any));

      const result = await crearReclamo(mockReclamo);

      expect(result).toEqual(mockReclamo);
      expect(ReclamoModel).toHaveBeenCalledWith({
        ...mockReclamo,
        imagen: undefined
      });
      expect(mockSave).toHaveBeenCalled();
    });

    it('should create a reclamo with image', async () => {
      const mockImageBuffer = Buffer.from('test');
      (fs.readFile as jest.Mock).mockResolvedValue(mockImageBuffer);
      const mockSave = jest.fn().mockResolvedValue(mockReclamo);
      (ReclamoModel as jest.MockedClass<typeof Model>).mockImplementation(() => ({
        save: mockSave
      } as any));

      const result = await crearReclamo(mockReclamo, 'test/path.jpg');

      expect(result).toEqual(mockReclamo);
      expect(ReclamoModel).toHaveBeenCalledWith({
        ...mockReclamo,
        imagen: {
          data: mockImageBuffer,
          contentType: 'image/jpeg'
        }
      });
      expect(fs.unlink).toHaveBeenCalledWith('test/path.jpg');
    });

    it('should handle errors and return null', async () => {
      (ReclamoModel as jest.MockedClass<typeof Model>).mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Test error'))
      } as any));

      const result = await crearReclamo(mockReclamo);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
