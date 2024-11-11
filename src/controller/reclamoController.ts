import ReclamoModel, { Reclamo } from "~/model/Reclamo";
import fs from 'fs/promises';

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

        // Si se guardó la imagen en el sistema de archivos, podemos borrarla
        if (imagePath) {
            await fs.unlink(imagePath).catch(err => 
                console.error("Error al eliminar archivo temporal:", err)
            );
        }

        return resultado;
    } catch (error) {
        console.error("Error al crear el reclamo:", error);
        return null;
    }
};