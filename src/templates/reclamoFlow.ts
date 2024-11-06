import { addKeyword, EVENTS } from "@builderbot/bot";

const reclamoFlow = addKeyword(EVENTS.ACTION)
    .addAnswer('¿Desea iniciar una solicitud para su reclamo?', { capture: true, buttons: [{body:'Sí, quiero.'}, {body:'No, por el momento.'}] },
        async (ctx, ctxFn) => {
            if(ctx.body === 'No, por el momento.'){
                return ctxFn.endFlow('La solicitud ha sido cancelado. Puede realizar un reclamo en cualquier momento.')
            } else if(ctx.body === 'Sí, quiero.'){
                return ctxFn.flowDynamic('Perfecto, voy a proceder a hacerte algunas preguntas.')
            } else {
                return ctxFn.fallBack('No entiendo tu respuesta.')
            }
        })
    .addAnswer('Nombre y apellido del solicitante:', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({name: ctx.body})
        }
    )
    .addAnswer('Tipo de Documento:', { capture: true , buttons: [{body:'DNI'}, {body:'Pasaporte'}, {body:'Cédula de Identidad'}]},
        async (ctx, ctxFn) => {
            await ctxFn.state.update({docType: ctx.body})
        }
    )
    .addAnswer('Número de Documento:', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({docNumber: ctx.body})
        }
    )
    .addAnswer('Número de teléfono de contacto:', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({phone: ctx.body})
        }
    )
    .addAnswer('Correo electrónico:', { capture: true },
        async (ctx, ctxFn) => {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if(!emailRegex.test(ctx.body)){
                return ctxFn.fallBack('El correo electrónico ingresado no es válido. Por favor, ingresalo nuevamente.')
            }
            await ctxFn.state.update({email: ctx.body})
        }
    )
    .addAnswer('Dirección del solicitante:', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({address: ctx.body})
        }
    )
    .addAnswer('Los datos del solicitante han sido cargados exitosamente. Ahora continuaremos con el reclamo, proporciona una descripción del mismo:, ', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({descriptionRec: ctx.body}) 
    })
    .addAnswer('Ingrese la fecha en la que ocurrió el reclamo:', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({dateRec: ctx.body})
            return ctxFn.flowDynamic('¡Gracias por tu tiempo! Tu reclamo ha sido registrado con éxito. Si necesita puede agregar una imagen o archivo relacionado con el reclamo.')
        }
    )
    export { reclamoFlow };