import {addKeyword, EVENTS } from '@builderbot/bot';
import iaService from '../services/aiServices';
import { config } from '../config';
import path from 'path';
import fs, { stat } from 'fs';
import { reclamoFlow } from './reclamoFlow';
import logger from '../logs/logger';
import {agregarConversacion, obtenerConversacion, limpiarHistorial } from '../controller/usuarioController';

const pathPrompts = path.join(
    process.cwd(),
    "assets/Prompts",
    "prompt_OpenAI.txt"
);

const prompt = fs.readFileSync(pathPrompts, 'utf-8');

export const faqFlow = addKeyword(EVENTS.ACTION)
    .addAction({capture: true},
        async(ctx, ctxFn) => {
            try {
                const AI = new iaService(config.apiKey);
                const history = await agregarConversacion(ctx.from, {
                    role: 'user',
                    content: ctx.body,
                    date: new Date()
                });

                const userHistory = await obtenerConversacion(ctx.from);
                logger.info('Historial:', userHistory);
                let response = await AI.chat(prompt, userHistory);
                
                
               if(response.includes('RECLAMO IDENTIFICADO')){
                    //console.log(response);
                    logger.info(response);
                    //lo que se guardará en type, debe incluir el reclamo, pero lo decidimos hardcodeado 
                    response = response.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    response.includes('arboles') ? response = 'Reclamo: Poda de arboles' : response;
                    response.includes('alumbrado') ? response = 'Reclamo: Alumbrado publico' : response;
                    response.includes('obras') ? response = 'Reclamo: Obras publicas inconclusas' : response;
                    response.includes('veredas') ? response = 'Reclamo: Veredas en mal estado' : response;
                    response.includes('ruidos') ? response = 'Reclamo: Ruidos Molestos' : response;
                    response.includes('transporte') ? response = 'Reclamo: Transporte publico' : response;
                    response.includes('residuos') ? response = 'Reclamo: Recoleccion de residuos' : response;
                    response.includes('agua') ? response = 'Reclamo: Problemas de agua' : response;
                    response.includes('gas') ? response = 'Reclamo: Fuga de gas' : response;
                    response.includes('ruta') ? response = 'Reclamo: Rutas deteriorada' : response;
                    response.includes('animales') ? response = 'Reclamo: Animales Sueltos' : response;
                    //console.log('Nuevo ', response);
                    logger.info('Nuevo ', response);
                    await ctxFn.state.update({type: response});
                    return ctxFn.gotoFlow(reclamoFlow);
               }else{
                    return ctxFn.fallBack(response);
               }

               await limpiarHistorial(ctx.from);
            } catch (error) {
                //console.log('Error en llamada a OpenAI', error);
                logger.error('Error en llamada a OpenAI', error);
                return ctxFn.endFlow('Error, Por favor intenta de nuevo');
            }
            }
    );