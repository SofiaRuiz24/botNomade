import { addKeyword, EVENTS } from "@builderbot/bot";
import { crearReclamo } from "~/controller/reclamoController";
import { Reclamo } from "~/model/Reclamo";
import { completarFormularioOnline } from "~/services/recArboles";

const reclamoFlow = addKeyword(EVENTS.ACTION)
    .addAnswer('¿Desea iniciar una solicitud para su reclamo?', { capture: true, buttons: [{ body: 'Sí, quiero.' }, { body: 'No, por ahora.' }] },
        async (ctx, ctxFn) => {
            if (ctx.body === 'No, por ahora.') {
                return ctxFn.endFlow('La solicitud ha sido cancelado. Puede realizar un reclamo en cualquier momento.')
            } else if (ctx.body === 'Sí, quiero.') {
                return ctxFn.flowDynamic('Perfecto, voy a proceder a hacerte algunas preguntas.')
            } else {
                return ctxFn.fallBack('No entiendo tu respuesta.')
            }
        })
    .addAnswer('Nombre y apellido del solicitante:', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ name: ctx.body })
        }
    )
    .addAnswer('Tipo de Documento:', { capture: true, buttons: [{ body: 'DNI' }, { body: 'Pasaporte' }, { body: 'Cédula de Identidad' }] },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ docType: ctx.body })
        }
    )
    .addAnswer('Número de Documento:', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ docNumber: ctx.body })
        }
    )
    .addAnswer('Número de teléfono de contacto:', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ phone: ctx.body })
        }
    )
    .addAnswer('Correo electrónico:', { capture: true },
        async (ctx, ctxFn) => {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if (!emailRegex.test(ctx.body)) {
                return ctxFn.fallBack('El correo electrónico ingresado no es válido. Por favor, ingresalo nuevamente.')
            }
            await ctxFn.state.update({ email: ctx.body })
        }
    )
    .addAnswer('Dirección del solicitante:', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ address: ctx.body })
        }
    )
    .addAnswer('Los datos del solicitante han sido cargados exitosamente 👏.\n Ahora continuaremos con el reclamo, proporciona una descripción del mismo: ', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ descriptionRec: ctx.body })
        })
    .addAnswer('Ingrese la fecha en la que ocurrió el hecho:', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ dateRec: ctx.body })
            //console.log(ctxFn.state.getMyState())
            const reclamoData: Reclamo = {
                id: "estoesunid", // Puedes asignar un ID generado o único aquí
                name: ctxFn.state.get("name"),
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

            const resultado = await crearReclamo(reclamoData);
            if (resultado) {
                return ctxFn.flowDynamic('¡Gracias por tu tiempo! Tu reclamo ha sido registrado con éxito. Si necesita puede agregar una imagen o archivo relacionado con el reclamo.');
            } else {
                return ctxFn.flowDynamic('Hubo un problema al registrar tu reclamo. Por favor, intenta nuevamente más tarde.');
            }
            try {
                completarFormularioOnline(reclamoData);
            } catch (error) {
                console.error("Error al completar el formulario:", error);
                console.log(reclamoData);
            }
        }
    )
export { reclamoFlow };