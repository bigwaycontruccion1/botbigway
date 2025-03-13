import { addKeyword, EVENTS } from "@builderbot/bot";
import AIClass from "../services/ai";
import { getHistoryParse, handleHistory,clearHistory } from "../utils/handleHistory";
import { generateTimer } from "../utils/generateTimer";
import { getCurrentCalendar, appToSheets } from "../services/calendar";
import { getFullCurrentDate } from "src/utils/currentDate";
 import delay from "~/utils/delay";
import flowAgente from "./agent.flow";
import { TFlow } from "@builderbot/bot/dist/types";

const PROMPT_CONSTRUCT = `Eres un asistente virtual  de la empresa "AquaDreams" especializado en ayudar a clientes interesados en construir O reparar una piscina o pileta. 
Tu objetivo es guiar al cliente a través de una serie de preguntas para recopilar información esencial y perfilarlo como cliente potencial.
Mantén un tono amigable, profesional y servicial en todo momento. Asegúrate de explicar brevemente por qué necesitas cada dato y cómo será utilizado.

INFORMACIÓN DE LA EMPRESA:
La empresa AquaDreams es una empresa familiar de buenos aires argentina encargada de diseñar, reparar y construir piletas para casas y edificios con mas de 
20 años de experiencia en el mercado argentino y con una reconocida trayectoria .

las preguntas que se le enviará al cliente son las siguientes: 
Nombre y apellido:
1- dimensiones de la pileta:
2- Tiene jacuzzi, climatización, cascada, algo en particular que se quiera agregar?
3- ubicación de la obra:
4- Lleva luces?
5- La pileta es revestida o pintada? En caso de ser revestida, sabe que revestimiento colocaría?
6- Hay lugar para que entre maquina para excavar o debe hacerse la excavación a mano?
7- La tierra del pozo queda en el lugar o hay que sacarla del terreno?
8- el revestimiento del solárium es de baldosones atermicos?
9- El terreno tiene pendiente hacia algún lago o es totalmente plano?
10- Cuando tiene pensado iniciar la construcción de la pileta?

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
    const mainPrompt = PROMPT_CONSTRUCT
        // .replace('{AGENDA_ACTUAL}', summary)
        .replace('{HISTORIAL_CONVERSACION}', history)
        .replace('{CURRENT_DAY}', nowDate)

    return mainPrompt
}

const generateJsonParse = (info: string) => {
    const prompt = `tu tarea principal es analizar la información proporcionada en el contexto y generar un objeto 
    JSON que se adhiera a la estructura especificada a continuación. 
    Contexto: "${info}"
    
    {
        "telefono": "5410021445"
        "name": "Elvira Mckensee",
        "dimensiones":" 20x30 m" ,
        "particularidad": "rocas en el foncdo", 
        "ubicacion":"Buenos aires",
        "luces": "si",
        "revestimiento_pileta": "pintura" ,
        "excavacion": "maquina",
        "tierra":  "queda en el lugar",
        "revestimiento_solarium": "baldosones termicos", 
        "pendiente":"no tiene pendiente el terreno", 
        "fecha_inicio": "2024/02/15 00:00:00"
    }
    
    Objeto JSON a generar:`
//   console.log('prompt= ',prompt)
    return prompt
}
/**
 */
const flowConstruct = addKeyword(EVENTS.ACTION).addAction(async (ctx, { extensions, state, flowDynamic }) => {
    await flowDynamic('Perfecto, voy a enviarte unas preguntas con la informacion que necesitamos para ajustarte al máximo el presupuesto.')
    await flowDynamic('1- ¿Cuáles son las dimensiones de la pileta que deseas construir? 📏 Esto nos ayudará a entender el tamaño y la forma de la pileta que tienes en mente')
    await flowDynamic('2- ¿Quieres agregar algún elemento especial como jacuzzi, climatización, cascada? ')
    await flowDynamic('3- ¿Dónde se ubicará la obra? 📍 Esto nos permitirá conocer las condiciones del lugar y planificar la logística')
    await flowDynamic('4- ¿La pileta llevará luces? 💡 5- ¿La pileta será revestida o pintada? Si es revestida, ¿sabes qué tipo de revestimiento te gustaría? ')
    await flowDynamic('6- ¿Hay espacio para que entre una máquina para excavar o la excavación debe hacerse a mano? 🚜')
    await flowDynamic('7- ¿La tierra del pozo quedará en el lugar o hay que retirarla del terreno? 🚧')
    await flowDynamic('8- ¿El revestimiento del solárium será de baldosones atermicos? ☀')
    await flowDynamic('9- ¿El terreno tiene pendiente hacia algún lado o es totalmente plano? 🌄')
    await flowDynamic('10- ¿Cuándo tenes pensado iniciar la construcción de la pileta? 🗓')
})
//  delay(2000)
.addAnswer(`puedes responder todas estas preguntas en un sólo mensaje`, { capture: true }, async (ctx, { state, extensions, flowDynamic }) => {
    await state.update({datos:ctx.body})
    await state.update({telefono:ctx.from})
    
    // gotoflow(flowAgente)
    // const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    console.log('estoy en el flowconstruct')
    const infoCustomer = `telefono: ${state.get('telefono')}, datos: ${state.get('datos')}`   
    const ai = extensions.ai as AIClass
    const text = await ai.createChat([
       {
           role: 'system',
           content: generateJsonParse(infoCustomer)
       }
    ])
    await appToSheets(text)
    clearHistory(state)
    await flowDynamic('Gracias! estaré analizando las respuestas. ')
    
})
 
.addAnswer('te estamos conectando con uno de nuestros agentes', { capture: false }, async (ctx, { state, gotoFlow }) => {
    return gotoFlow(flowAgente);
});
export { flowConstruct }
