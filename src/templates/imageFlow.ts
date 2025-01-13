import { addKeyword, EVENTS } from "@builderbot/bot";
import { crearReclamo } from "~/controller/reclamoController";
import { completarFormularioOnline } from "~/services/autoReclamo";
import { Reclamo } from "~/model/Reclamo";
import { v4 as uuidv4 } from 'uuid';

const imageFlow = addKeyword(EVENTS.MEDIA)
    .addAnswer('Perfecto, ingrese la imagen', { capture: true }, async (ctx, ctxFn) => {
        const reclamoData: Reclamo = {
            id: uuidv4(),
            type: ctxFn.state.get("type"),
            name: ctxFn.state.get("name"),
            lastname: ctxFn.state.get("lastname"),
            docType: ctxFn.state.get("docType"),
            docNumber: ctxFn.state.get("docNumber"),
            phone: ctxFn.state.get("phone"),
            email: ctxFn.state.get("email"),
            address: ctxFn.state.get("address"),
            direcNum: ctxFn.state.get("direcNum"),
            piso: ctxFn.state.get("piso"),
            dpto: ctxFn.state.get("dpto"),
            descriptionRec: ctxFn.state.get("descriptionRec"),
            dateRec: ctxFn.state.get("dateRec"),
            estado: 'Pendiente',
            usuario: ctx.from
        };

        const localPath = await ctxFn.provider.saveFile(ctx, { path: `./assets/tmp/` });
        
        try {
            ctxFn.flowDynamic('Por favor aguarde un momento. Estamos procesando su solicitud...');
            
             // Después guardamos en MongoDB
             const resultado = await crearReclamo(reclamoData, localPath);
             await new Promise(resolve => setTimeout(resolve, 10000));
             try {
                 await completarFormularioOnline(reclamoData.id , localPath); 
             } catch (error) {
                 console.error("Error al completar el formulario:", error);
                 console.log(reclamoData);
             }


            if (resultado) {
                return ctxFn.flowDynamic('¡Gracias por tu tiempo! Hemos registrado tu reclamo con éxito, y pronto será procesado por nuestro equipo municipal. En breve recibirás un correo de confirmación con los detalles de tu solicitud. Cualquier duda, aquí estamos para ayudarte.');
            } else {
                return ctxFn.flowDynamic('Hubo un problema al registrar tu reclamo. Por favor, intenta nuevamente más tarde.');
            }
        } catch (error) {
            console.error("Error en el proceso:", error);
            return ctxFn.flowDynamic('Hubo un error al procesar tu reclamo. Por favor, intenta nuevamente más tarde.');
        }
    })

export { imageFlow };
