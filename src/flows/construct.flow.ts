import { addKeyword, EVENTS} from "@builderbot/bot";
import AIClass from "../services/ai";
import { getHistoryParse, handleHistory,clearHistory } from "../utils/handleHistory";
import { generateTimer } from "../utils/generateTimer";
import { getCurrentCalendar, appToSheets } from "../services/calendar";
import { getFullCurrentDate } from "src/utils/currentDate";
import flowAgente from "./agent.flow";
// import flowValidation from "./validation.flow";
// import { TFlow } from "@builderbot/bot/dist/types";


const generateSchedulePrompt = (summary: string, history: string) => {
    const nowDate = getFullCurrentDate()
    const mainPrompt = PROMPT_CONSTRUCT
        .replace('{HISTORIAL_CONVERSACION}', history)
        .replace('{CURRENT_DAY}', nowDate)

    return mainPrompt
}


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


const generateJsonParse = (info: string,  preguntas: string) => {
    const prompt = `tu tarea principal es analizar la información proporcionada en el contexto e, 
    identifica y extrae las respuestas a las siguientes preguntas: "${preguntas}".
    Si alguna respuesta no está explícita en el texto, enumera las preguntas faltantes y solicítame que ingrese la información 
    correspondiente, una por una.  Una vez que todas las respuestas estén completas, incluye una variable llamada completo con el valor true.

   
    Texto de entrada:  "${info}"
    consideraciones Importantes a tener en cuenta:
    - Las respuestas deben ser extraídas del texto proporcionado, sin modificarlas.
    - sólo se puede colocar false o true en la clave "completo".

    Formato de salida esperado:
    Proporciona las respuestas identificadas en formato JSON.
    Si faltan respuestas, enumera las preguntas faltantes y solicítame que ingrese la información correspondiente, una por una.
    Si todas las respuestas están completas, incluye una variable completo con el valor true."
    Ejemplo de texto de entrada:
    "Quiero construir una pileta de 8 metros de largo por 4 de ancho. Me gustaría que tenga luces y un jacuzzi. La obra se ubicará en el jardín trasero. No estoy seguro sobre el revestimiento, pero prefiero que sea revestida. El terreno es plano y planeo iniciar la construcción en dos meses."
    
    Ejemplo de salida esperada (respuestas incompletas):
    json
    {
    "telefono": "584123456789", 
    "dimensiones_pileta": "8 metros de largo por 4 de ancho",
    "elemento_especial": "jacuzzi",
    "ubicacion_obra": "jardín trasero",
    "luces": "Sí",
    "revestimiento_pintada": "revestida",
    "tipo_revestimiento": "No se proporcionó",
    "excavacion_maquina_mano": "No se proporcionó",
    "tierra_pozo": "No se proporcionó",
    "revestimiento_solarium": "No se proporcionó",
    "pendiente_terreno": "plano",
    "inicio_construccion": "en dos meses",
    "completo": false
    }
    Preguntas faltantes:

    ¿Sabes qué tipo de revestimiento te gustaría para la pileta?
    ¿Hay espacio para que entre una máquina para excavar o la excavación debe hacerse a mano?
    ¿La tierra del pozo quedará en el lugar o hay que retirarla del terreno?
    ¿El revestimiento del solárium será de baldosones atermicos?
    Por favor, ingresa la información para la pregunta: ¿Sabes qué tipo de revestimiento te gustaría para la pileta?
    Ejemplo de salida esperada (respuestas completas):
    json
    {
    "telefono": "584123456789",
    "dimensiones_pileta": "8 metros de largo por 4 de ancho",
    "elemento_especial": "jacuzzi",
    "ubicacion_obra": "jardín trasero",
    "luces": "Sí",
    "revestimiento_pintada": "revestida",
    "tipo_revestimiento": "mosaico azul",
    "excavacion_maquina_mano": "Sí, hay espacio para una máquina",
    "tierra_pozo": "Debe retirarse del terreno",
    "revestimiento_solarium": "Sí, baldosones atermicos",
    "pendiente_terreno": "plano",
    "inicio_construccion": "en dos meses",
    "completo": true
    }`
    
    // Objeto JSON a generar:`
    console.log('contexto= ', info)
    return prompt
}

const questions = {
    "dimensiones_pileta": "1-¿Cuáles son las dimensiones de la pileta que deseas construir? ",
    "elemento_especial": "2-¿Quieres agregar algún elemento especial como jacuzzi, climatización, cascada?",
    "ubicacion_obra":" 3-¿Dónde se ubicará la obra? 📍 Esto nos permitirá conocer las condiciones del lugar y planificar la logística",
    "luces":" 4-¿La pileta llevará luces?",
    "revestimiento_pintada":"5-¿La pileta será revestida o pintada? Si es revestida",
    "tipo_revestimiento":" ¿sabes qué tipo de revestimiento te gustaría?",
    "excavacion_maquina_mano":"6-¿Hay espacio para que entre una máquina para excavar o la excavación debe hacerse a mano? 🚜 ",
    "tierra_pozo":"7-¿La tierra del pozo quedará en el lugar o hay que retirarla del terreno? 🚧 ",
    "revestimiento_solarium":"8-¿El revestimiento del solárium será de baldosones atermicos? ☀ ",
    "pendiente_terreno":"9-¿El terreno tiene pendiente hacia algún lado o es totalmente plano? 🌄",
    "inicio_construccion":" 10-¿Cuándo tenes pensado iniciar la construcción de la pileta? 🗓"
}

function getQuestionValuesByKeys(questions, keysString) {
    // Dividir la cadena de claves en un array
    const keys = keysString.split(',');

    // Crear un array para almacenar los valores de las preguntas
    const values = [];

    // Iterar sobre las claves y buscar los valores correspondientes
    keys.forEach(key => {
        const trimmedKey = key.trim(); // Eliminar espacios en blanco
        if (Object.prototype.hasOwnProperty.call(questions, trimmedKey)) {
            values.push(questions[trimmedKey]); // Agregar el valor al array
        } else {
            console.warn(`La clave "${trimmedKey}" no existe en el objeto questions.`);
        }
    });

    // Unir los valores con comas y devolver la cadena resultante
    return values.join(', ');
}

const identifyUnansweredQuestions = (jsonResponse: string, questions: Record<string, string>) => {
    const response = JSON.parse(jsonResponse);
    const unanswered = Object.keys(questions).filter(question => 
        !Object.prototype.hasOwnProperty.call(response, question) || response[question] === "No se proporcionó"
    );    
    // getQuestionValuesByKeys(questions, unanswered.toString()); 
    return { unansweredQuestions:  unanswered};
};


const updateResponses = (original: string, updates: string): string => {
    try {
        // Convertir las cadenas JSON a objetos
        const originalObj = JSON.parse(original || '{}');
        const updatesObj = JSON.parse(updates || '{}');

        // Actualizar los valores del objeto original con los del objeto de actualizaciones
        const updatedObj = { ...originalObj, ...updatesObj };

        // Convertir el objeto actualizado de nuevo a una cadena JSON
        return JSON.stringify(updatedObj, null, 2);
    } catch (error) {
        console.error('Error al procesar las respuestas:', error);
        return original; // En caso de error, devolver el original sin cambios
    }
};
let resp_correctas = ''
let resp_faltantes = ""
/**
 */
const flowConstruct = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic }) => {
        try {
            // Enviar mensajes iniciales con las preguntas
            const questions = [
                '1- ¿Cuáles son las dimensiones de la pileta que deseas construir? 📏 Esto nos ayudará a entender el tamaño y la forma de la pileta que tienes en mente.',
                '2- ¿Quieres agregar algún elemento especial como jacuzzi, climatización, cascada?',
                '3- ¿Dónde se ubicará la obra? 📍 Esto nos permitirá conocer las condiciones del lugar y planificar la logística.',
                '4- ¿La pileta llevará luces? 💡',
                '5- ¿La pileta será revestida o pintada? Si es revestida, ¿sabes qué tipo de revestimiento te gustaría?',
                '6- ¿Hay espacio para que entre una máquina para excavar o la excavación debe hacerse a mano? 🚜',
                '7- ¿La tierra del pozo quedará en el lugar o hay que retirarla del terreno? 🚧',
                '8- ¿El revestimiento del solárium será de baldosones atermicos? ☀',
                '9- ¿El terreno tiene pendiente hacia algún lado o es totalmente plano? 🌄',
                '10- ¿Cuándo tienes pensado iniciar la construcción de la pileta? 🗓',
            ];

            // Enviar las preguntas con un retraso entre ellas
            for (const question of questions) {
                await flowDynamic(question);
                await new Promise((resolve) => setTimeout(resolve, generateTimer(150, 250))); // Retraso entre preguntas
            }
        } catch (error) {
            console.error('Error al enviar preguntas:', error);
            await flowDynamic('Ocurrió un error al enviar las preguntas. Por favor, intenta nuevamente.');
        }
    })
    .addAnswer(
        'Perfecto, voy a enviarte unas preguntas con la información que necesitamos para ajustarte al máximo el presupuesto.',
        { capture: true },
        async (ctx, { state, extensions, flowDynamic, gotoFlow }) => {
            try {
                // Actualizar el estado con los datos del usuario
                await state.update({ datos: ctx.body, telefono: ctx.from });

                // Obtener el historial y la información del cliente
                const history = getHistoryParse(state);
                const infoCustomer = `Teléfono: ${state.get('telefono')}, Datos: ${state.get('datos')}`;

                console.log('Estoy en el flowConstruct');

                // Obtener la instancia de IA
                const ai = extensions.ai as AIClass;

                // Generar el contenido para la IA
                const systemContent = generateJsonParse(infoCustomer, JSON.stringify(questions));

                // Crear el chat con la IA
                const text = await ai.createChat([
                    {
                        role: 'system',
                        content: systemContent,
                    },
                ]);

                console.log('Respuesta de la IA:', text);

                // Verificar si todas las preguntas están completas
                if (text.includes('completo: true')) {
                    await flowDynamic('Gracias! Estaré analizando las respuestas.');
                    await appToSheets(text); // Guardar en Google Sheets
                    clearHistory(state); // Limpiar el historial
                    await flowDynamic('Te estaremos conectando con uno de nuestros agentes. ¿Estás de acuerdo?');
                } else {
                    // Si faltan preguntas, identificar cuáles son
                    const { unansweredQuestions } = identifyUnansweredQuestions(text, questions);
                    resp_faltantes = unansweredQuestions.toString();

                    console.log('Preguntas sin responder:', unansweredQuestions.toString());

                    if (unansweredQuestions.length > 0) {
                        await flowDynamic('Por favor, responde las siguientes preguntas:');

                        // Dividir las preguntas en chunks y enviarlas con retraso
                        // const chunks = unansweredQuestions.toString().split(/(?<!\d)[.?]\s+|,\d+-¿/g);
                         const chunks=    getQuestionValuesByKeys(questions, unansweredQuestions.toString()).split(/(?<!\d)[.?]\s+|,\d+-¿/g);

                        for (const chunk of chunks) {
                            await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
                        }

                        // Redirigir al flujo de formulario para capturar las respuestas faltantes
                        return gotoFlow(flowForm);
                    }
                }
            } catch (error) {
                console.error('Error en flowConstruct:', error);
                await flowDynamic('Ocurrió un error al procesar tus respuestas. Por favor, intenta nuevamente.');
            }
        }
    );

export { flowConstruct };


const flowForm = addKeyword(EVENTS.ACTION).addAnswer(
    'Puedes responder todas estas preguntas en un sólo mensaje',
    { capture: true },
    async (ctx, { extensions, state, flowDynamic, endFlow }) => {
        try {
            // Actualizar el estado con la respuesta del usuario
            await state.update({ resp: ctx.body });

            // Obtener información del cliente
            const telefono = state.get('telefono');
            const resp = state.get('resp');
            const infoCustomer = `Teléfono: ${telefono}, Datos: ${resp}`;

            console.log('Info del cliente:', infoCustomer);
            console.log('Preguntas faltantes:', resp_faltantes);

            // Obtener la instancia de IA
            const ai = extensions.ai as AIClass;

            // Generar el contenido para la IA
            const systemContent = generateJsonParse(infoCustomer, resp_faltantes);

            // Crear el chat con la IA
            const text = await ai.createChat([
                {
                    role: 'system',
                    content: systemContent
                }
            ]);

            console.log('Respuestas correctas antes de actualizar:', resp_correctas);

            // Actualizar las respuestas correctas
            resp_correctas = updateResponses(resp_correctas, text);

            console.log('Respuestas correctas después de actualizar:', resp_correctas);
            console.log('Respuesta de la IA:', text);

            // Enviar la respuesta al usuario
            await flowDynamic(`El usuario dijo: ${ctx.body}`);

            console.log('Entra en flowForm');

            // Finalizar el flujo
           return  endFlow();
        } catch (error) {
            console.error('Error en flowForm:', error);
            await flowDynamic('Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.');
           return  endFlow();
        }
    }
);


export {  flowForm  }
