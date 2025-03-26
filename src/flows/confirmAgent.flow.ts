import { addKeyword, EVENTS } from "@builderbot/bot";
import flowAgente from "./agent.flow";


/**
 * solicitando confirmación para contactar con un agente 
 */
const flowAgentConfirm = addKeyword(EVENTS.ACTION).addAction(async (_, { flowDynamic }) => {
    await flowDynamic("Te estaremos conectando con uno de nuestros agentes. ¿Estás de acuerdo?");
}).addAction({ capture: true }, async (ctx, { state, gotoFlow, endFlow }) => {
    await state.update({ confirmation: ctx.body })
    if (state.get('confirmation') === 'si') {
        return gotoFlow(flowAgente)
    } else {
        return endFlow()
    }
})

export { flowAgentConfirm }