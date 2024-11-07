import { addKeyword, EVENTS } from '@builderbot/bot';
import { faqFlow } from './faqFlow';
import sheetsService from '~/services/sheetsService';
import { registerFlow } from './registerFlow';

const mainFlow = addKeyword(EVENTS.WELCOME)
    /*.addAnswer("Hola, soy el chatbot de la municipalidad de Ushuaia. ¿En qué puedo ayudarte?", {capture: true })*/
    .addAction(async (ctx, ctxFn) => {
        const isUser = await sheetsService.userExists(ctx.from)
        console.log(isUser)
        if(!isUser){
            return ctxFn.gotoFlow(registerFlow)
        }else{
            return ctxFn.gotoFlow(faqFlow)
        }    
    });
    
export { mainFlow }; 