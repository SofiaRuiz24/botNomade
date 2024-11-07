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
                const tipoReclamo = ctx.options;
                return ctxFn.flowDynamic(`Perfecto, voy a proceder a hacerte algunas preguntas sobre el reclamo: ${tipoReclamo}.`)
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
            const docNumberRegex = /"^[A-Z0-9]{6,10}$"/;   
            if (!docNumberRegex.test(ctx.body)) {
                return ctxFn.fallBack('El número de documento ingresado no es válido. Por favor, ingresalo nuevamente.')
            }
            await ctxFn.state.update({ docNumber: ctx.body })
        }
    )
    .addAnswer('Número de teléfono de contacto:', { capture: true },
        async (ctx, ctxFn) => {
            const numberRegex = /^[0-9]{9,14}$/;
            if (!numberRegex.test(ctx.body)) {
                return ctxFn.fallBack('El número de teléfono ingresado no es válido}')
            }
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
            const direccionRegex = /^[a-zA-Z0-9\s]{5,}$/;
            if (!direccionRegex.test(ctx.body)) {
                return ctxFn.fallBack('La dirección ingresada no es válida. Por favor, ingresala nuevamente.')
            }
            await ctxFn.state.update({ address: ctx.body })
        }
    )
    .addAnswer('Los datos del solicitante han sido cargados exitosamente 👏.\nAhora continuaremos con el reclamo, proporciona una descripción del mismo: ', { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ descriptionRec: ctx.body })
        })
    .addAnswer('Ingrese la fecha (unicamente con numeros) en la que ocurrió el hecho:', { capture: true },
        async (ctx, ctxFn) => {
            const dateRegex = /^[\d\-\/\.]{1,8}$/; 
            if (!dateRegex.test(ctx.body)) {
                return ctxFn.fallBack('La fecha ingresada no es válida, recuerde que solo se aceptan números. Por favor, ingresala nuevamente.')
            }
            const fecha = ctx.body.replace(/[^0-9]/g, '');
            await ctxFn.state.update({ dateRec: fecha })
            //console.log(ctxFn.state.getMyState())
            const reclamoData: Reclamo = {
                id: "estoesunid", // Puedes asignar un ID generado o único aquí
                type: ctxFn.state.get("type"),
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
            try {
                await completarFormularioOnline(reclamoData);
            } catch (error) {
                console.error("Error al completar el formulario:", error);
                console.log(reclamoData);
            }

            if (resultado) {
                return ctxFn.flowDynamic('¡Gracias por tu tiempo! Tu reclamo ha sido registrado con éxito. Si necesita puede agregar una imagen o archivo relacionado con el reclamo.');
            } else {
                return ctxFn.flowDynamic('Hubo un problema al registrar tu reclamo. Por favor, intenta nuevamente más tarde.');
            }
            
        }
    )
export { reclamoFlow };