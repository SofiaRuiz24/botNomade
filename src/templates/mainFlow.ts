import { addKeyword, EVENTS } from '@builderbot/bot';
import { faqFlow } from './faqFlow';

const mainFlow = addKeyword(EVENTS.WELCOME)
    //.addAnswer(`Hola, soy el chatbot de la municipalidad de Ushuaia. ¿En qué puedo ayudarte?`),
    .addAction(async (ctx, ctxFn) => {
        return ctxFn.gotoFlow(faqFlow);
    });
    
export { mainFlow }; 