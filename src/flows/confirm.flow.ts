import { addKeyword, EVENTS } from "@builderbot/bot";
import AIClass from "../services/ai";
import { clearHistory, handleHistory, getHistoryParse } from "../utils/handleHistory";
import { getFullCurrentDate } from "../utils/currentDate";
import { appToSheets } from "../services/calendar";

const generatePromptToFormatDate = (history: string) => {
    const prompt = `Fecha de Hoy:${getFullCurrentDate()}, Basado en el Historial de conversacion: 
    ${history}
    ----------------
    Fecha ideal:...dd / mm hh:mm`

    return prompt
}

const generateJsonParse = (info: string) => {
    const prompt = `tu tarea principal es analizar la información proporcionada en el contexto y generar un objeto JSON que se adhiera a la estructura especificada a continuación. 

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
  console.log('prompt= ',prompt)
    return prompt
}

/**
 * Encargado de pedir los datos necesarios para registrar el evento en el calendario
 */
const flowConfirm = addKeyword(EVENTS.ACTION).addAction(async (_, { flowDynamic }) => {
    await flowDynamic('Ok, voy a pedirte unos datos que me permitiran tener una idea de lo que necesitas')
    await flowDynamic('¿Cual es tu nombre y apellido?')
}).addAction({ capture: true }, async (ctx, { state, flowDynamic, extensions }) => {
    await state.update({ name: ctx.body })
    const nombre = ` ${state.get('nombre')}`
})

.addAnswer(`¿Qué dimensiones tiene la pileta?`, { capture: true }, async (ctx, { state }) => {
    await state.update({ dimensiones: ctx.body })
})

.addAnswer('¿Tiene Jacuzzi, climatización, cascada, algo en particular que se quiera agregar ?', { capture: true }, async (ctx, { state }) => {
    await state.update({ particularidad: ctx.body })
})

.addAnswer('¿Cúal es la ubicación de la Obra?', { capture: true }, async (ctx, { state }) => {
    await state.update({ ubicacion: ctx.body })
})

.addAnswer('¿Te gustaria agregar luces a la pileta?', { capture: true }, async (ctx, { state }) => {
    await state.update({ luces: ctx.body })
})

.addAnswer(`La pileta es revestida o pintada? En caso de ser revestida, sabe que revestimiento colocaría?`, {capture:true }, async (ctx,{state})=>{
    await state.update({revestimiento_pileta:ctx.body})
})

.addAnswer(`¿Hay lugar para que entre maquina para excavar o debe hacerse la excavación manual?`, {capture: true }, async(ctx,{state})=>{
    await state.update({excavacion:ctx.body})
})

.addAnswer(`¿La tierra del pozo queda en el lugar o hay que sacarla del terreno?`, {capture:true }, async (ctx,{state})=>{
    await state.update({tierra:ctx.body})
})

.addAnswer(`¿El revestimiento del solárium es de baldosones atermicos?`, {capture:true}, async (ctx,{state})=>{
    await state.update({revestimiento_solarium: ctx.body})
 })

.addAnswer(`¿El terreno tiene pendiente hacia algún lago o es totalmente plano?`, {capture:true}, async (ctx,{state})=>{
    await state.update({pendiente: ctx.body})
 })

 .addAnswer(`¿Cuando tienen pensado iniciar la construcción de la pileta?`,{ capture: true }, async (ctx, { state}) => {
    await state.update({fecha_inicio:ctx.body})
})
 .addAnswer(`Ultima pregunta ¿Cual es tu email?`, { capture: true }, async (ctx, { state, extensions, flowDynamic }) => {
    await state.update({email:ctx.body})
    await state.update({telefono:ctx.from})
    const infoCustomer = `telefono: ${state.get('telefono')}, name: ${state.get('name')}, dimensiones : ${state.get('dimensiones')},  
    particularidad: ${state.get('particularidad')}, ubicacion: ${state.get('ubicacion')}, luces: ${state.get('luces')}, 
    revestimiento_pileta: ${state.get('revestimiento_pileta')}, excavacion: ${state.get('excavacion')}, tierra: ${state.get('tierra')},
    revestimiento_solarium: ${state.get('revestimiento_solarium')}, pendiente: ${state.get('pendiente')}, 
    fecha_inicio: ${state.get('fecha_inicio')}, email: ${state.get('email')}`
    console.log('inforCustomer', infoCustomer)
    const ai = extensions.ai as AIClass

   const text = await ai.createChat([
       {
           role: 'system',
           content: generateJsonParse(infoCustomer)
       }

   ])

   await appToSheets(text)
   clearHistory(state)
   await flowDynamic('Listo! agendado, en dos días hábiles le haré llegar un presupuesto más detallado ')
})


export { flowConfirm }