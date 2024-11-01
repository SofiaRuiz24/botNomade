import { addKeyword, EVENTS } from '@builderbot/bot'

const mainFlow = addKeyword(EVENTS.WELCOME)
    .addAnswer(`Hola, soy el chatbot de la municipalidad de Ushuaia. ¿En qué puedo ayudarte?`)
    
export { mainFlow }; 