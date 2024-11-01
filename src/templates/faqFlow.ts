import {addKeyword, EVENTS } from '@builderbot/bot';
import iaService from '../services/aiServices';
import { config } from '../config';
import path from 'path';
import fs, { stat } from 'fs';

const pathPrompts = path.join(
    process.cwd(),
    "assets/Prompts",
    "prompt_OpenAI.txt"
);

const prompt = fs.readFileSync(pathPrompts, 'utf-8');

export const faqFlow = addKeyword(EVENTS.ACTION)
    .addAction(
        async(ctx, {state, endFlow, gotoFlow}) => {
            try {
                const AI = new iaService(config.apiKey);
                const response = await AI.chat(prompt, [{role: 'user', content: ctx.body}]);
                return endFlow(response);
            } catch (error) {
                console.log('Error en llamada a OpenAI', error);
                return endFlow('Error, Por favor intenta de nuevo');
            }
            }
    );