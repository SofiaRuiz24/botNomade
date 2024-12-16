import { crearReclamo } from '../controller/reclamoController';
import ReclamoModel from '../model/Reclamo';
import fs from 'fs/promises';
import { Model } from 'mongoose';
import { Reclamo } from '../model/Reclamo';

// Mock dependencies
jest.mock('../model/Reclamo');
jest.mock('fs/promises');
jest.mock('../logs/logger', () => ({
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    http: jest.fn(),
    debug: jest.fn()
  }
}));

describe('reclamoController', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearReclamo', () => {
    it('should create a reclamo without image', async () => {
      const mockSave = jest.fn().mockResolvedValue(mockReclamo);
      (ReclamoModel as jest.MockedClass<typeof Model>).mockImplementation(() => ({
        save: mockSave
      } as any));

      const result = await crearReclamo(mockReclamo);

      expect(result).toEqual(mockReclamo);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should create a reclamo with image', async () => {
      const mockImageBuffer = Buffer.from('test');
      const mockReclamoWithImage = {
        ...mockReclamo,
        imagen: {
          data: mockImageBuffer,
          contentType: 'image/jpeg'
        }
      };

      // Mock fs.readFile
      (fs.readFile as jest.Mock).mockResolvedValue(mockImageBuffer);
      
      // Mock fs.unlink
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      // Mock ReclamoModel.save
      const mockSave = jest.fn().mockResolvedValue(mockReclamoWithImage);
      (ReclamoModel as jest.MockedClass<typeof Model>).mockImplementation(() => ({
        save: mockSave
      } as any));

      const result = await crearReclamo(mockReclamo, 'test/path.jpg');

      expect(result).toEqual(mockReclamoWithImage);
      expect(fs.readFile).toHaveBeenCalledWith('test/path.jpg');
      expect(fs.unlink).toHaveBeenCalledWith('test/path.jpg');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle errors and return null', async () => {
      (ReclamoModel as jest.MockedClass<typeof Model>).mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Test error'))
      } as any));

      const result = await crearReclamo(mockReclamo);

      expect(result).toBeNull();
    });
  });
});
