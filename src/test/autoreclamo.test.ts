
import { completarFormularioOnline } from '../services/autoReclamo';
import puppeteer, { Browser, Page } from 'puppeteer';
import { obtenerReclamo } from '../controller/reclamoController';
import type { Reclamo } from '../model/Reclamo';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
// Mock modules
jest.mock('puppeteer', () => ({
  launch: jest.fn(() => ({
    newPage: jest.fn(() => ({
      goto: jest.fn(),
      type: jest.fn(),
      click: jest.fn(),
      waitForSelector: jest.fn(),
    })),
    close: jest.fn(),
  })),
}));

jest.mock('../logs/logger');
jest.mock('../controller/reclamoController', () => ({
// __esModule: true, // Si usas ESModules
  obtenerReclamo: jest.fn(), // Mock explícito del método exportado
}));

//jest.mock('obtenerReclamo');

describe('completarFormularioOnline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    (obtenerReclamo as jest.MockedFunction<typeof obtenerReclamo>).mockResolvedValue(mockReclamo);  
  });

  const mockReclamo: Reclamo = {
    id: '123',
    _id: '123',
    type: 'Reclamo: Poda de arboles',
    name: 'Juan',
    lastname: 'Pérez',
    docType: 'DNI',
    docNumber: '12345678',
    phone: '123456789',
    email: 'test@test.com',
    address: 'Calle Test',
    direcNum: '123',
    descriptionRec: 'Descripción de prueba',
    dateRec: '2024-01-01',
    estado: 'Pendiente',
    usuario: '123456789',
    piso: '',
    dpto: ''
  };

  it('debería procesar un reclamo válido correctamente', async () => {
    const mockPage = {
      goto: jest.fn(),
      type: jest.fn(),
      select: jest.fn(),
      click: jest.fn(),
      waitForNavigation: jest.fn(),
      waitForSelector: jest.fn(),
      $: jest.fn(),
      $eval: jest.fn()
    } as unknown as Page;

    const mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage as never),
      close: jest.fn()
    } as unknown as Browser;

    (puppeteer.launch as jest.MockedFunction<typeof puppeteer.launch>)
      .mockResolvedValue(mockBrowser);

    await completarFormularioOnline('123', '');

    expect(obtenerReclamo).toHaveBeenCalledWith('123');
    expect(puppeteer.launch).toHaveBeenCalled();
    expect(mockBrowser.newPage).toHaveBeenCalled();
  });

  it('debería manejar un reclamo no encontrado', async () => {
    (obtenerReclamo as jest.MockedFunction<typeof obtenerReclamo>).mockResolvedValue(null);

    await completarFormularioOnline('456', '');

    expect(obtenerReclamo).toHaveBeenCalledWith('456');
    expect(puppeteer.launch).not.toHaveBeenCalled();
  });
});
