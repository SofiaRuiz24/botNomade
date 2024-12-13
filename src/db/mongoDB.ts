import mongoose from "mongoose";
import logger from "~/logs/logger";

export const conectarDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/test');
        logger.info("Conectado a MongoDB");

        // Verificar existencia de colecciones
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        
        if (!collectionNames.includes('usuarios')) {
            logger.warn("La colección 'usuarios' no existe");
        }
        if (!collectionNames.includes('reclamos')) {
            logger.warn("La colección 'reclamos' no existe");
        }
//hola a todos
    } catch (error) {
        console.error("Error de conexión a MongoDB:", error);
        logger.error("Error de conexión a MongoDB:", error);
    }
};
