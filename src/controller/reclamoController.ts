import ReclamoModel, { Reclamo } from "~/model/Reclamo";
import fs from 'fs/promises';
import logger from '../logs/logger';

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
        console.log("Reclamo creado con éxito:", resultado);
        logger.info("Reclamo creado con éxito:", resultado);

        // Si se guardó la imagen en el sistema de archivos, podemos borrarla
        if (imagePath) {
            await fs.unlink(imagePath).catch(err => 
                logger.error("Error al eliminar archivo temporal:", err)
            );
        }
        return resultado;
    } catch (error) {
        console.error("Error al crear el reclamo:", error);
        logger.error("Error al crear el reclamo:", error);
        return null;
    }
};

export const obtenerReclamo = async (id: Object): Promise<Reclamo | null> => {
    try {
        //buscar por campo nombre
        const reclamo = await ReclamoModel.findOne({ id }); // Encuentra el reclamo por su id (campo único)
        //const reclamo = await ReclamoModel.findById(id);
        return reclamo;
    } catch (error) {
        console.error("Error al obtener el reclamo:", error);
        logger.error("Error al obtener el reclamo:", error);
        return null;
    }
};