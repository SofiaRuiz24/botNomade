import UsuarioModel, { Usuario } from "~/model/Usuario";
import fs from 'fs/promises';
import logger from '../logs/logger';

export const crearUsuario = async (data: Usuario): Promise<Usuario | null> => {
    try {
        const nuevoUsuario = new UsuarioModel(data);
        const resultado = await nuevoUsuario.save();
        console.log("Usuario creado con éxito:", resultado);
        logger.info("Usuario creado con éxito:", resultado);
        return resultado;
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        logger.error("Error al crear el usuario:", error);
        return null;
    }
};