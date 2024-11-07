import exp from "constants";
import mongoose from "mongoose";

export interface Reclamo {
    id: string;
    name: string;
    docType: string;
    docNumber: string;
    phone: string;
    email: string;
    adress: string;
    descriptionRec: string;
    dateRec: string;
    estado: string;
    usuario: string;
}

const reclamoSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    docType: { type: String, required: true },
    docNumber: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    adress: { type: String, required: true },
    descriptionRec: { type: String, required: true },
    dateRec: { type: String, required: false },
    estado: { type: String, required: false },
    usuario: { type: String, required: true },
});

const ReclamoModel = mongoose.model<Reclamo>('Reclamo', reclamoSchema);
export default ReclamoModel;