import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para el historial de conversaciones
interface Conversation {
    role: string;
    content: string;
    date: Date;
}

// Interfaz para los reclamos
interface Reclamo {
    _id: string;
    tipo: string;
    descripcion: string;
    fecha: Date;
    estado: string;
}

// Interfaz principal del Usuario
export interface Usuario extends Document {
    name: string;
    mail: string;
    phone: string;
    history: Conversation[];
    reclamos: Reclamo[];
}

// Agregar esta interfaz
export interface UsuarioInput {
    name: string;
    phone: string;
    mail: string;
    history: any[];
    reclamos: any[];
}

// Schema de MongoDB para Usuario
const UsuarioSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true, 
        unique: true 
    },
    mail: { 
        type: String, 
        required: true 
    },
    history: [{
        role: String,
        content: String,
        date: { 
            type: Date, 
            default: Date.now 
        }
    }],
    reclamos: [{
        tipo: String,
        descripcion: String,
        fecha: { 
            type: Date, 
            default: Date.now 
        },
        estado: { 
            type: String, 
            default: 'pendiente' 
        }
    }]
});

// Crear y exportar el modelo
export default mongoose.model<Usuario>('Usuario', UsuarioSchema);
