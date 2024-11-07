import mongoose from "mongoose";

export const conectarDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/test');
        console.log("Conectado a MongoDB");
    } catch (error) {
        console.error("Error de conexión a MongoDB:", error);
    }
};
