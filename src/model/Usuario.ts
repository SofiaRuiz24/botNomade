import mongoose from "mongoose";

export interface Usuario {
    name: string;
    mail: string;
    phone: string;
    history:[{ role: string, content: string , date: Date}];
    reclamos:[{reclamoId: string}];
}

const usuarioSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mail: { type: String, required: true },
    phone: { type: String, required: true },
    history: [{ role: String, content: String , date: Date}],
    reclamos: [{reclamoId: String}]
},{timestamps: true});
const UsuarioModel = mongoose.model<Usuario>('Usuario', usuarioSchema);

export default UsuarioModel;
