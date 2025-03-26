import { BotContext, BotMethods } from "@builderbot/bot/dist/types"
import { getHistoryParse } from "../utils/handleHistory"
import AIClass from "../services/ai"
// import { flowContract } from "../flows/contract.flow"
import { getFullCurrentDate } from "src/utils/currentDate"
import { flowConstruct } from "../flows/construct_.flow"
import { flowRepair } from "~/flows/repair.flow"
import flowAgente from "~/flows/agent.flow"
import { flowConstructIa } from "~/flows/construc2.flow"

/**
 * Determina que flujo va a iniciarse basado en el historial que previo entre el bot y el humano
 */
export default async (_: BotContext, { state, gotoFlow, extensions }: BotMethods) => {
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    const date = getFullCurrentDate

    const prompt = `Como una inteligencia artificial avanzada, tu tarea es analizar el contexto de una conversación y determinar cuál
     de las siguientes acciones es más apropiada para realizar:
    --------------------------------------------------------
    Historial de conversación:
    {HISTORY}
    
    Posibles acciones a realizar:
    1. CONSTRUIR: Esta acción se debe realizar cuando el cliente expresa su deseo de construir de una pileta, o solicita un presupuesto para construir una pileta.
    2. HABLAR: Esta acción se debe realizar cuando el cliente tiene intención de hacer una pregunta frecuente como la dirección de la empresa o las actividaes de la empresa
    o necesita más información.
    3. REPARAR: esta acción se debe realizar si el cliente desea un presupuesto para reparar o modificarde su pileta, o simplemente modificar  la pileta, reparar la pileta . 
    4. HUMANO: es cuando el cliente tiene la clara intención de hablar con un humano.
    5. HOLA: Si el cliente escribe la palabra Hola sin importar la capitalización de las letras la accion seera HOLA 
    -----------------------------
    Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.
    CONSIDERACIONES:
    1. Si en el historial de conversación tienes una pregunta como esta 
    "decime si estas interesado en:
👉 1 o Construir para construir una pileta
👉 2 o reparar para reparar una pileta
👉 3 o agente para conectarlo con un agente" 
    y la respuesta del cliente es 1 entonces la accón es CONSTRUIR, 
    si la respuesta del cliente es 2 entonces la acción es REPARAR, Si la respuesta del cliente es 3 entonces la acción es HABLAR

    Respuesta ideal (CONSTRUIR|HABLAR|REPARAR|HUMANO|HOLA):`.replace('{HISTORY}', history)
    const text = await ai.createChat([
        {
            role: 'system',
            content: prompt
        }
    ])
    console.log( "hola esta pasando por aqui para" , text);

    if (text.includes('HABLAR')) {
        return gotoFlow(flowAgente)
    }
    if (text.includes('CONSTRUIR')) {
        return gotoFlow(flowConstructIa)
    }
    if (text.includes('REPARAR')) {
        return gotoFlow(flowRepair)
    }
    if (text.includes('HUMANO')){
        return gotoFlow(flowAgente)
    }
    if (text.includes('HOLA')){
        console.log('debe reiniciar el bot porque escribio hola ')
        // return gotoFlow(flowAgente)
    } 
}
// 04149427887