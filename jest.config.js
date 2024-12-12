// jest.config.js
export default {
  preset: 'ts-jest/presets/default-esm', // Usa el preset ESM para TypeScript
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }], // Configuración de ts-jest para ESM
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1', // Mapea ~ a la carpeta src
    // Añade otros alias si es necesario
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      // Elimina configuraciones globales deprecated
    },
  },
  testEnvironment: 'node',
};


