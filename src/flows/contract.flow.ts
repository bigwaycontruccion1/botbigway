import { addKeyword, EVENTS } from "@builderbot/bot";
import AIClass from "../services/ai";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import { generateTimer } from "../utils/generateTimer";
// import { getCurrentCalendar } from "../services/calendar";
import { getFullCurrentDate } from "src/utils/currentDate";
import { BotState } from "@builderbot/bot/dist/types"

const PROMPT_CONTRACT = `Eres un asistente virtual especializado en ayudar a clientes interesados en construir una piscina. 
Tu objetivo es guiar al cliente a través de una serie de preguntas para recopilar información esencial y perfilarlo como cliente potencial.
Mantén un tono amigable, profesional y servicial en todo momento. Asegúrate de explicar brevemente por qué necesitas cada dato y cómo será utilizado.

Fecha de hoy: {CURRENT_DAY}

Historial de Conversacion:
-----------------------------------
{HISTORIAL_CONVERSACION}

INSTRUCCIONES:
- NO saludes
- Respuestas cortas ideales para enviar por whatsapp con emojis
-----------------------------
Respuesta útil en primera persona:`

const generateSchedulePrompt = (summary: string, history: string) => {
    const nowDate = getFullCurrentDate()
    const mainPrompt = PROMPT_CONTRACT
        .replace('{HISTORIAL_CONVERSACION}', history)
        .replace('{CURRENT_DAY}', nowDate)

    return mainPrompt
}

/**
 * Hable sobre todo lo referente a agendar citas, revisar historial saber si existe huecos disponibles
 */
const flowContract = addKeyword(EVENTS.ACTION).addAction(async (ctx, { extensions, state, flowDynamic }) => {
    await flowDynamic('Perfecto, ahora necesitare hacerte algunas preguntas para generarte un presupuesto.')
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    // const list = await getCurrentCalendar()
    const list= ''
;    const promptSchedule = generateSchedulePrompt(list?.length ? list : 'ninguna', history)

    const text = await ai.createChat([
        {
            role: 'system',
            content: promptSchedule
        },
        {
            role: 'user',
            content: `Cliente pregunta: ${ctx.body}`
        }
    ], 'gpt-4')

    await handleHistory({ content: text, role: 'assistant' }, state)

    const chunks = text.split(/(?<!\d)\.\s+/g);
    for (const chunk of chunks) {
        await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
    }

})

export { flowContract }