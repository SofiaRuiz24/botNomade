import { addKeyword, EVENTS } from "@builderbot/bot";
//import { imageToText } from "../provider/gemini";
import { crearReclamo } from "~/controller/reclamoController";
import { completarFormularioOnline } from "~/services/autoReclamo";
import { Reclamo } from "~/model/Reclamo";
import { v4 as uuidv4 } from 'uuid';

const imageFlow = addKeyword(EVENTS.MEDIA)
    .addAnswer('Perfecto, ingrese la imagen', { capture: true }, async (ctx, ctxFn) => {
        const reclamoData: Reclamo = {
            id: uuidv4(), // Puedes asignar un ID generado o único aquí
            type: ctxFn.state.get("type"),
            name: ctxFn.state.get("name"),
            lastname: ctxFn.state.get("lastname"),
            docType: ctxFn.state.get("docType"),
            docNumber: ctxFn.state.get("docNumber"),
            phone: ctxFn.state.get("phone"),
            email: ctxFn.state.get("email"),
            address: ctxFn.state.get("address"),
            descriptionRec: ctxFn.state.get("descriptionRec"),
            dateRec: ctxFn.state.get("dateRec"),
            estado: 'Pendiente',
            usuario: ctx.from // Extrae el usuario o asigna el identificador adecuado
        };
        const localPath = await ctxFn.provider.saveFile(ctx, { path: `./assets/tmp/` })
        const resultado = await crearReclamo(reclamoData);  
        try {
            await completarFormularioOnline(reclamoData, localPath);
        } catch (error) {
            console.error("Error al completar el formulario:", error);
            console.log(reclamoData);
        }

        if (resultado) {
            return ctxFn.flowDynamic('¡Gracias por tu tiempo! Tu reclamo ha sido registrado con éxito.');
        } else {
            return ctxFn.flowDynamic('Hubo un problema al registrar tu reclamo. Por favor, intenta nuevamente más tarde.');
        }
        /*const text = await imageToText('Describe la imagen, teniendo en cuenta que el ciudadano esta realizando un reclamo a la municipalidad ', localPath)
        return ctxFn.flowDynamic(text)*/
    })

export { imageFlow };