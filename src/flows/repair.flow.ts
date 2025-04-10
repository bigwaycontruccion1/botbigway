import { addKeyword, EVENTS } from "@builderbot/bot";
import AIClass from "../services/ai";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import { generateTimer } from "../utils/generateTimer";
// import { getCurrentCalendar } from "../services/calendar";
import { getFullCurrentDate } from "src/utils/currentDate";
// import { BotState } from "@builderbot/bot/dist/types"
import flowAgente from "./agent.flow";
import { SelfBlackListFlow } from "./blackList.flow";

const PROMPT_REPAIR = `Eres un asistente virtual especializado en ayudar a clientes interesados en reparar o modificar o cambiar el revestimiento 
de su pileta, como por ejemplo filtraciones de agua.

Fecha de hoy: {CURRENT_DAY}

Historial de Conversacion:
-----------------------------------
{HISTORIAL_CONVERSACION}

INSTRUCCIONES:
- NO saludes
- Respuestas cortas ideales para enviar por whatsapp con emojis
- preguntas como: estas interasado en hacer una remodelación o una reparacuión de tu pileta?
-----------------------------
Respuesta útil en primera persona:`

const generateSchedulePrompt = (summary: string, history: string) => {
    const nowDate = getFullCurrentDate()
    const mainPrompt = PROMPT_REPAIR
        .replace('{HISTORIAL_CONVERSACION}', history)
        .replace('{CURRENT_DAY}', nowDate)

    return mainPrompt
}

/**
 * Hable sobre todo lo referente a agendar citas, revisar historial saber si existe huecos disponibles
 */
const flowRepair = addKeyword(EVENTS.ACTION).addAction(async (ctx, { extensions, state, flowDynamic }) => {
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    const list= '';
    const promptSchedule = generateSchedulePrompt(list?.length ? list : 'ninguna', history)

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
.addAnswer(``, { capture: true }, async (ctx, { state, extensions, gotoFlow, flowDynamic }) => {
    await state.update({datos:ctx.body})
    await state.update({telefono:ctx.from})
    const history = getHistoryParse(state)
    const infoCustomer = `telefono: ${state.get('telefono')}, datos: ${state.get('datos')}`   
    const ai = extensions.ai as AIClass
    await flowDynamic(`Un momento por favor ...`)
    await flowDynamic(`pronto te contactará un agente`)
    return gotoFlow(SelfBlackListFlow)

    // return gotoFlow(flowAgente)
}) 

export { flowRepair }