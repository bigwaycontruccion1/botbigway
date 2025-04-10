import { addKeyword, EVENTS } from "@builderbot/bot";
import flowAgente from "./agent.flow";
import welcomeFlow from "./welcome.flow";
import { SelfBlackListFlow } from "./blackList.flow";


/**
 * solicitando confirmación para contactar con un agente 
 */
const flowAgentConfirm = addKeyword(EVENTS.ACTION).addAction(async (_, { flowDynamic }) => {
    await flowDynamic("Te estaremos conectando con uno de nuestros agentes. Por favor, confirma si deseas continuar escribiendo 'si' o 'no'.");
}).addAction({ capture: true }, async (ctx, { state, gotoFlow, endFlow, flowDynamic }) => {
    await state.update({ confirmation: ctx.body })
    if (state.get('confirmation').toLowerCase() === 'si') {
        return gotoFlow(SelfBlackListFlow)
        // return gotoFlow(flowAgente)
    } else {
        await flowDynamic("Entiendo, si necesitas algo más, no dudes en preguntar.")
        return gotoFlow(welcomeFlow)
    }
})

export { flowAgentConfirm }