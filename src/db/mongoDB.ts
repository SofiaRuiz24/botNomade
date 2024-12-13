import mongoose from "mongoose";
import logger from "~/logs/logger";

export const conectarDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/test');
        logger.info("Conectado a MongoDB");
        
        // Verificar conexión
        const collections = await mongoose.connection.db.listCollections().toArray();
        logger.info("Colecciones disponibles:", collections.map(c => c.name));
        
    } catch (error) {
        console.error("Error de conexión a MongoDB:", error);
        logger.error("Error de conexión a MongoDB:", error);
        process.exit(1); // Detener la aplicación si no hay conexión
    }
};
