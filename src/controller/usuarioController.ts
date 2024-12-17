import ReclamoModel from '~/model/Reclamo';
import UsuarioModel, { Usuario, UsuarioInput } from '../model/Usuario';

// Función para crear o actualizar un usuario
export const crearOActualizarUsuario = async (usuarioData: UsuarioInput): Promise<Usuario | null> => {
    try {
        const { phone } = usuarioData;

        // Buscar si el usuario ya existe
        const usuarioExistente = await UsuarioModel.findOne({ phone });

        if (usuarioExistente) {
            // Si existe, actualizar el usuario
            usuarioExistente.name = usuarioData.name;
            usuarioExistente.mail = usuarioData.mail;
            return await usuarioExistente.save();
        } else {
            // Si no existe, crear un nuevo usuario
            const nuevoUsuario = new UsuarioModel(usuarioData);
            return await nuevoUsuario.save();
        }
    } catch (error) {
        console.error('Error al crear o actualizar el usuario:', error);
        return null;
    }
};

// Función para verificar si existe un usuario
export const existeUsuario = async (phone: string): Promise<boolean> => {
    try {
        const usuario = await UsuarioModel.findOne({ phone });
        return !!usuario;
    } catch (error) {
        console.error('Error al verificar usuario:', error);
        return false;
    }
};
//TO DO : SIMPLIFICAR ESTAS DOS FUNCIONES EN UNA SOLA.
// Función para obtener un usuario por su número de teléfono
export const obtenerUsuario = async (phone: string): Promise<Usuario | null> => {
    try {
        return await UsuarioModel.findOne({ phone });
    } catch (error) {
        console.error('Error al obtener usuario: ', error);
        return null;
    }
};  

// Función para obtener el historial de un usuario
export const obtenerHistorialUsuario = async (phone: string): Promise<any[]> => {
    try {
        const usuario = await UsuarioModel.findOne({ phone });
        if (usuario) {
            return usuario.history;
        }
        return [];
    } catch (error) {
        console.error('Error al obtener el historial del usuario:', error);
        return [];
    }
};

// Función para agregar una conversación al historial
export const agregarConversacion = async (
    phone: string, 
    conversation: { 
        role: string, 
        content: string, 
        date: Date 
    }
): Promise<any[]> => {
    try {
        const usuario = await UsuarioModel.findOne({ phone });
        if (usuario) {
            usuario.history.push(conversation);
            await usuario.save();
            return usuario.history;
        }
        return [];
    } catch (error) {
        console.error('Error al agregar conversación:', error);
        return [];
    }
};

// Función para agregar reclamo
export const agregarReclamo = async (
    phone: string, 
    reclamo: {
        tipo: string,
        descripcion: string,
        fecha: Date,
        estado: string
    }
): Promise<boolean> => {
    try {
        const usuario = await UsuarioModel.findOne({ phone });
        if (usuario) {
            usuario.reclamos.push(reclamo);
            await usuario.save();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error al agregar reclamo:', error);
        return false;
    }
};
//HACER LO MISMO QUE EN LA FUNCION ANTERIOR
// Función para obtener los reclamos de un usuario
export const obtenerReclamos = async (phone: string): Promise<any[]> => {
    try {
        const usuario = await UsuarioModel.findOne({ phone });
        if (usuario && usuario.reclamos) {
            const reclamos = await Promise.all(usuario.reclamos.map(async (reclamo) => ReclamoModel.findOne({ id: reclamo })));
            // Filtrar cualquier resultado nulo o indefinido
            return reclamos.filter((reclamo) => reclamo !== null);   
        }
        return [];
    } catch (error) {
        console.error('Error al obtener reclamos:', error);
        return [];
    }
};
function each(arg0: boolean) {
    throw new Error('Function not implemented.');
}

