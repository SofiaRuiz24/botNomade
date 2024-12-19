import ReclamoModel, { Reclamo } from "~/model/Reclamo";
import fs from 'fs/promises';
import logger from '../logs/logger';
import UsuarioModel from '../model/Usuario';
import { actualizarReclamo } from "./usuarioController";

export const crearReclamo = async (data: Reclamo, imagePath?: string): Promise<Reclamo | null> => {
    try {
        let imagenData;
        if (imagePath) {
            // Leer el archivo de imagen
            const imageBuffer = await fs.readFile(imagePath);
            imagenData = {
                data: imageBuffer,
                contentType: 'image/jpeg' // Ajusta según el tipo de imagen
            };
        }

        const nuevoReclamo = new ReclamoModel({
            ...data,
            imagen: imagenData
        });

        const resultado = await nuevoReclamo.save();
        logger.info("Reclamo creado con éxito:", resultado);
        logger.info('Telefono: ',data.phone);
        //midleware agregar reclamo a usuario
        await actualizarReclamo(data.phone, resultado);

        // Si se guardó la imagen en el sistema de archivos, podemos borrarla
        if (imagePath) {
            await fs.unlink(imagePath).catch(err => 
                logger.error("Error al eliminar archivo temporal:", err)
            );
        }
        return resultado;
    } catch (error) {
        logger.error("Error al crear el reclamo:", error);
        return null;
    }
};

export const obtenerReclamo = async (id: Object): Promise<Reclamo | null> => {
    try {
        //buscar por campo nombre
        const reclamo = await ReclamoModel.findOne({ id });
        // Encuentra el reclamo por su id (campo único)
        //const reclamo = await ReclamoModel.findById(id);
        return reclamo;
    } catch (error) {
        logger.error("Error al obtener el reclamo:", error);
        return null;
    }
};