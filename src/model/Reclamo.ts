import mongoose from "mongoose";

export interface Reclamo {
    id: string;
    type: string;
    name: string;
    lastname: string;
    docType: string;
    docNumber: string;
    phone: string;
    email: string;
    address: string;
    direcNum: string;
    piso: string;
    dpto: string;
    descriptionRec: string;
    dateRec: string;
    estado: string;
    usuario: string;
    imagen?: {
        data: Buffer,
        contentType: string
    };
    _id: Object;
}

const reclamoSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    docType: { type: String, required: true },
    docNumber: { type: String, required: true},
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },  
    direcNum: { type: String, required: true },
    piso: { type: String, required: true },
    dpto: { type: String, required: true },
    descriptionRec: { type: String, required: true },
    dateRec: { type: String, required: false },
    estado: { type: String, required: false },
    usuario: { type: String, required: true },
    imagen: {
        data: Buffer,
        contentType: String
    }
},{timestamps: true});// Agrega automáticamente createdAt y updatedAt

const ReclamoModel = mongoose.model<Reclamo>('Reclamo', reclamoSchema);
export default ReclamoModel;