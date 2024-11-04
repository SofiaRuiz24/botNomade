import { addKeyword, EVENTS } from '@builderbot/bot';
import { faqFlow } from './faqFlow';
import sheetsService from '~/services/sheetsService';

const mainFlow = addKeyword(EVENTS.WELCOME)
    //.addAnswer(`Hola, soy el chatbot de la municipalidad de Ushuaia. ¿En qué puedo ayudarte?`),
    .addAction(async (ctx, ctxFn) => {
        const isUser = await sheetsService.userExists(ctx.from)
        console.log(isUser)
        //return ctxFn.gotoFlow(faqFlow);
    });
    
export { mainFlow }; 