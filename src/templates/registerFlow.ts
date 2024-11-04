import { addKeyword, EVENTS } from "@builderbot/bot";
import sheetsService from "~/services/sheetsService";

const registerFlow = addKeyword(EVENTS.ACTION)
    .addAnswer('Para comenzar te solicitaremos algunos datos personales.', { capture: true, buttons: [{body:'Si,quiero!'}, {body: 'No, gracias!'}]},
        async (ctx, ctxFn) => {
            if(ctx.body === 'No, gracias!'){
                return ctxFn.endFlow('El registro ha sido cancelado. Puede retomar la conversación en cualquier momento para registrarte.')

            } else if(ctx.body === 'Si,quiero!'){
                return ctxFn.flowDynamic('Perfecto, voy a proceder a hacerte algunas preguntas.')
            } else {
                return ctxFn.fallBack('No entiendo tu respuesta.')
            }
        }) 
    