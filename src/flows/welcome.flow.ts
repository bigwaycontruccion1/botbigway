import { EVENTS, addKeyword } from "@builderbot/bot";
import conversationalLayer from "../layers/conversational.layer";
import mainLayer from "../layers/main.layer";

/**
 * Este flow responde a cualquier palabra que escriban
 */
export default addKeyword(EVENTS.WELCOME)
.addAction(async (_, { flowDynamic }) => {
    await flowDynamic("Hola, soy el asistente virtual de Bigway Construcción. ¿En qué puedo ayudarte hoy?");    
}
)
// .addAction(conversationalLayer)
// .addAction(mainLayer)
