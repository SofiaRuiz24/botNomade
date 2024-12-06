import winston from 'winston';
import path from 'path';
import 'winston-daily-rotate-file'; // Importa el transporte para rotación de archivos

// Configuración de formatos personalizados
const customFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
);

// Crear el logger
const logger = winston.createLogger({
    level: 'info',
    format: customFormat,
    transports: [
        // Rotación diaria para logs de error
        new winston.transports.DailyRotateFile({
            filename: path.join('logs', 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD', // Formato del nombre del archivo
            level: 'error', // Sólo guardar errores
            maxFiles: '14d', // Conservar los últimos 14 días
        }),
        // Rotación diaria para todos los logs
        new winston.transports.DailyRotateFile({
            filename: path.join('logs', 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '5m', // Tamaño máximo de 5 MB por archivo
            maxFiles: '14d', // Conservar los últimos 14 días
        }),
        // Mostrar logs en consola (ideal para desarrollo)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            ),
        }),
    ],
});

export default logger;

