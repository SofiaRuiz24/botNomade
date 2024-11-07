import {addKeyword, EVENTS } from '@builderbot/bot';
import iaService from '../services/aiServices';
import sheetsService from '~/services/sheetsService';
import { config } from '../config';
import path from 'path';
import fs, { stat } from 'fs';
import { reclamoFlow } from './reclamoFlow';

const pathPrompts = path.join(
    process.cwd(),
    "assets/Prompts",
    "prompt_OpenAI.txt"
);

const prompt = fs.readFileSync(pathPrompts, 'utf-8');

export const faqFlow = addKeyword(EVENTS.ACTION)
    .addAction(
        async(ctx, {state, endFlow, gotoFlow}) => {
            const history = await sheetsService.getUserConv(ctx.from);
            history.push({role: 'user', content: ctx.body});
            console.log('Historial:', history);
            try {
                const AI = new iaService(config.apiKey);
                const response = await AI.chat(prompt, history);
                await sheetsService.addConvertoUser(ctx.from, [{role: 'user', content: ctx.body}, {role: 'assistant', content: response}]);
               if(response.includes('RECLAMO IDENTIFICADO')){
                    return gotoFlow(reclamoFlow);
               }else{
                    return endFlow(response);
               }
            } catch (error) {
                console.log('Error en llamada a OpenAI', error);
                return endFlow('Error, Por favor intenta de nuevo');
            }
            }
    );