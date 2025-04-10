import { BotContext, BotMethods } from "@builderbot/bot/dist/types"
import { getHistoryParse } from "../utils/handleHistory"
import AIClass from "../services/ai"
import { getFullCurrentDate } from "src/utils/currentDate"
import { flowRepair } from "~/flows/repair.flow"
import flowAgente from "~/flows/agent.flow"
import { flowConstructIa } from "~/flows/construct.flow"
import welcomeFlow from "~/flows/welcome.flow"
import { flowAgentConfirm } from "~/flows/confirmAgent.flow"

/**
 * Determina que flujo va a iniciarse basado en el historial que previo entre el bot y el humano
 */
export default async (_: BotContext, { state, gotoFlow, extensions }: BotMethods) => {
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    const date = getFullCurrentDate

const prompt = `Clasifica con precisión la intención del cliente en WhatsApp sobre construcción/reparación de piscinas.

Historial de conversación:
{HISTORY}

Reglas de clasificación:
CONSTRUIR → "1", "construir", "presupuesto pileta"
REPARAR → "2", "reparar", "arreglar pileta"
HABLAR → "3", "info", "horarios", "dirección"
HOLA → "4", "hola", "reiniciar", "reset"
AGENTE → "5", "humano", "asesor", "agente", "contactar", "hablar con un humano", "hablar con un agente", "hablar con un asesor"

Proceso:
Prioriza coincidencias exactas.
Usa sinónimos si no hay coincidencia exacta.
Si el mensaje es ambiguo, responde HOLA.

Salida:
Responde solo con una de estas palabras en mayúsculas:
CONSTRUIR | REPARAR | HABLAR | AGENTE | HOLA | REINICIAR.`

    const text = await ai.createChat([
        {
            role: 'system',
            content: prompt
        }
    ])
    console.log( "prompt" , prompt);
    console.log( "hola esta pasando por aqui para" , text);

    if (text.includes('HABLAR')) {
        return gotoFlow(flowAgentConfirm)
    }
    if (text.includes('CONSTRUIR')) {
        return gotoFlow(flowConstructIa)
    }
    if (text.includes('REPARAR')) {
        return gotoFlow(flowRepair)
    }
    if (text.includes('AGENTE')) {
        return gotoFlow(flowAgente)
    }
    if (text.includes('HOLA')){
        return gotoFlow(welcomeFlow)
    } 
}
// 04149427887