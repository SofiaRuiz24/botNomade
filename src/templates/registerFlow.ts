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
    .addAnswer('¿Cuál es tu nombre?', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.flowDynamic('Perfecto,' + ctx.body )
            await ctxFn.state.update({name: ctx.body})
        }
    )
    .addAnswer('Por ultimo, ¿cuál es tu correo electrónico?', { capture: true },
        async (ctx, ctxFn) => {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if(!emailRegex.test(ctx.body)){
                return ctxFn.fallBack('El correo electrónico ingresado no es válido. Por favor, ingresalo nuevamente.')
            }
            const state = ctxFn.state.getMyState()
            await sheetsService.createUser(ctx.from, state.name, ctx.body)
            await ctxFn.flowDynamic('¡Gracias por registrarte! Tus datos han sido guardados con éxito.')
    })

    export { registerFlow };