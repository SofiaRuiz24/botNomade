import { crearReclamo, obtenerReclamo } from '../controller/reclamoController';
import ReclamoModel from '../model/Reclamo';
import mongoose from 'mongoose';

jest.mock('../model/Reclamo');
jest.mock('../logs/logger');

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
    dateRec: '01012024',
    estado: 'Pendiente',
    usuario: 'testuser'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearReclamo', () => {
    it('should create a reclamo successfully', async () => {
      const mockSave = jest.fn().mockResolvedValue(mockReclamo);
      ReclamoModel.prototype.save = mockSave;

      const result = await crearReclamo(mockReclamo);
      expect(result).toEqual(mockReclamo);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle errors when creating reclamo', async () => {
      const mockSave = jest.fn().mockRejectedValue(new Error('DB Error'));
      ReclamoModel.prototype.save = mockSave;

      const result = await crearReclamo(mockReclamo);
      expect(result).toBeNull();
    });
  });

  describe('obtenerReclamo', () => {
    it('should find a reclamo by id', async () => {
      const mockFindOne = jest.fn().mockResolvedValue(mockReclamo);
      ReclamoModel.findOne = mockFindOne;

      const result = await obtenerReclamo('123');
      expect(result).toEqual(mockReclamo);
      expect(mockFindOne).toHaveBeenCalledWith({ id: '123' });
    });
  });
});
