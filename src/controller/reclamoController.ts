import ReclamoModel, { Reclamo } from "~/model/Reclamo";

export const crearReclamo = async (data: Reclamo): Promise<Reclamo | null> => {
    try {
        const nuevoReclamo = new ReclamoModel({
            ...data,
            //dateRec: data.dateRec || new Date(), // Asigna la fecha actual si no se proporciona
            estado: data.estado || 'Pendiente'   // Estado predeterminado
        });

        const resultado = await nuevoReclamo.save();
        console.log("Reclamo creado con éxito:", resultado);
        return resultado;
    } catch (error) {
        console.error("Error al crear el reclamo:", error);
        return null;
    }
};