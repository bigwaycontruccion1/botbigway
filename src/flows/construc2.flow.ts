import { addKeyword, EVENTS } from "@builderbot/bot";
import AIClass from "../services/ai";
import { getHistoryParse, clearHistory } from "../utils/handleHistory";
import { generateTimer } from "../utils/generateTimer";
import { appToSheets } from "../services/calendar";
// import flowAgente from "./agent.flow";
import { flowAgentConfirm } from "./confirmAgent.flow";

// Definición de tipos para mayor seguridad
type QuestionsType = {
    dimensiones_pileta?: string;
    elemento_especial?: string;
    ubicacion_obra?: string;
    luces?: string;
    revestimiento_pintada?: string;
    excavacion_maquina_mano?: string;
    tierra_pozo?: string;
    revestimiento_solarium?: string;
    pendiente_terreno?: string;
    inicio_construccion?: string;
};

// Preguntas predefinidas
const questions: QuestionsType = {
    dimensiones_pileta: "1- ¿Cuáles son las dimensiones de la pileta que deseas construir? 📏",
    elemento_especial: "2- ¿Quieres agregar algún elemento especial como jacuzzi, climatización, cascada?",
    ubicacion_obra: "3- ¿Dónde se ubicará la obra? 📍",
    luces: "4- ¿La pileta llevará luces? 💡",
    revestimiento_pintada: "5- ¿La pileta será revestida o pintada? Si es revestida, ¿sabes qué tipo de revestimiento te gustaría?",
    excavacion_maquina_mano: "6- ¿Hay espacio para que entre una máquina para excavar o la excavación debe hacerse a mano? 🚜",
    tierra_pozo: "7- ¿La tierra del pozo quedará en el lugar o hay que retirarla del terreno? 🚧",
    revestimiento_solarium: "8- ¿El revestimiento del solarium será de baldosones atérmicos? ☀",
    pendiente_terreno: "9- ¿El terreno tiene pendiente hacia algún lado o es totalmente plano? 🌄",
    inicio_construccion: "10- ¿Cuándo tienes pensado iniciar la construcción de la pileta? 🗓"
};

// Preguntas sin respuesta
let unansweredQuestions: QuestionsType = {}; 

// Función para obtener preguntas no respondidas
function obtenerPreguntasNoRespondidas(keys: string[], preguntasObj: QuestionsType): QuestionsType {
    return keys.reduce((acc, key) => {
        if (key in preguntasObj) {
            acc[key as keyof QuestionsType] = preguntasObj[key as keyof QuestionsType];
        }
        return acc;
    }, {} as QuestionsType);
}

// Función que genera el prompt
const POOL_CONSTRUCTION_PROMPT = (datosEntrada1: string, preguntas: QuestionsType, datosEntrada2:QuestionsType): string => {
     const prompt =` Contexto
Tu tarea es analizar información sobre requerimientos para la construcción de una pileta, extraer datos específicos y extraer 
respuestas para las siguientes preguntas: ${JSON.stringify(preguntas, null, 2)}

Datos de entrada:
Texto 1: ${datosEntrada1}
Texto 2: ${JSON.stringify(datosEntrada2,null, 2)}

CONSIDERACIONES IMPORTANTES:
- inicia con las respuestas del texto2, si hay una respuesta en texto 1 y texto 2 para la misma pregunta, se debe considerar la respuesta del texto 1. 
- Las respuestas deben ser extraídas del texto proporcionado, sin modificarlas.
- si no reconoces una respuesta a una pregunta, debes marcarla como "No se proporcionó".
- si todas las respuestas están completas, incluye una variable completo con el valor true, sino el valor es false.
- sólo se puede colocar false o true en la clave "completo".
- Si faltan respuestas, enumera las preguntas faltantes una por una.
- Comprueba si todas las preguntas fueron respondidas correctamente y tienen una valor distinto a "No se proporcionó" si es así, marca la clave "completo" como true.
- Devuelve **SOLO** un JSON válido con la siguiente estructura y **nada más**:
{
    "telefono": "56949273928",
    "dimensiones_pileta": "8x24",
    "elemento_especial": "No",
    "ubicacion_obra": "Puerto Ordaz",
    "luces": "luces en toda la piscina",
    "revestimiento_pintada": "Revestida",
    "excavacion_maquina_mano": "A mano",
    "tierra_pozo": "Se deja en el terreno",
    "revestimiento_solarium": "No se proporcionó",
    "pendiente_terreno": "Plano",
    "inicio_construccion": "la semana que viene",
    "completo": false
}`;
console.log("prompt", prompt);
return prompt;
 
};

// Función para identificar preguntas sin responder
const identifyUnansweredQuestions = (jsonResponse: string, questions: QuestionsType) :QuestionsType=> {
    try {
        const response = JSON.parse(jsonResponse);
        const unanswered = Object.keys(questions).filter(
            question => !response[question] || response[question] === "No se proporcionó"
        );
        return obtenerPreguntasNoRespondidas(unanswered, questions);
    } catch (error) {
        console.error("Error al parsear jsonResponse:", error);
        return {};
    }
};

const identifyAnsweredQuestions = (jsonResponse: string, questions: QuestionsType): Partial<QuestionsType> => {
    try {
        const response = JSON.parse(jsonResponse); // Convierte el JSON string en un objeto
        const answered: Partial<QuestionsType> = {}; // Objeto donde almacenaremos las preguntas respondidas

        Object.keys(questions).forEach(question => {
            if (response[question] && response[question] !== "No se proporcionó") {
                answered[question as keyof QuestionsType] = response[question]; 
            }
        });

        return answered;
    } catch (error) {
        console.error("Error al parsear jsonResponse:", error);
        return {}; // Retorna un objeto vacío en caso de error
    }
};

let preguntas = questions;
let AnswerwedQuestions ={};
// Inicialización del flujo
const flowConstructIa = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state }) => {
        // console.log("Preguntas iniciales:", questions);
         
        try {
            for (const question of Object.values(preguntas)) {
                await flowDynamic(question);
                await new Promise(resolve => setTimeout(resolve, generateTimer(150, 250)));
            }
        } catch (error) {
            console.error("Error al enviar preguntas:", error);
            await flowDynamic("Ocurrió un error al enviar las preguntas. Intenta nuevamente.");
        }
    })
    .addAnswer(
        "Puedes responder todas estas preguntas en un solo mensaje",
        { capture: true },
        async (ctx, { state, extensions, flowDynamic, gotoFlow, endFlow }) => {
            try {
                await state.update({ datos: ctx.body || "No proporcionado", telefono: ctx.from });

                const ai = extensions.ai as AIClass;
                const history = getHistoryParse(state);
                const infoCustomer = `Teléfono: ${state.get("telefono")}, Datos: ${state.get("datos")}`;
                // console.log("infoCustomer", infoCustomer);
                // console.log("AnswerwedQuestions", AnswerwedQuestions);  
                const systemContent = POOL_CONSTRUCTION_PROMPT(infoCustomer, preguntas, AnswerwedQuestions);

                let text;
                try {
                    text = await ai.createChat([{ role: "system", content: systemContent }]);
                    console.log("Respuesta de IA:", text);
                    // await flowDynamic(`Respuesta de IA: ${text}`);

                } catch (error) {
                    console.error("Error en AI:", error);
                    return await flowDynamic("Hubo un problema al procesar tu respuesta. Intenta nuevamente.");
                }

                let response;
                try {
                    // console.log("Texto de respuesta:", text);
                    response = JSON.parse(text);
                } catch (error) {
                    console.error("Error al parsear la respuesta de la IA:", error);
                    return await flowDynamic("La respuesta no es válida. Intenta nuevamente.");
                }
                // console.log("response de IA:", response);

                unansweredQuestions = identifyUnansweredQuestions(text, questions) as QuestionsType;
                // console.log("Preguntas sin responder:", unansweredQuestions);
                if (response.completo === true || Object.keys(unansweredQuestions).length === 0) {
                    await flowDynamic("Gracias! Estaré analizando las respuestas.");
                    await appToSheets(text);
                    clearHistory(state);
                    // await flowDynamic("Te estaremos conectando con uno de nuestros agentes. ¿Estás de acuerdo?");
                    return gotoFlow(flowAgentConfirm);
                    // return endFlow();
                } else {

                    if (Object.keys(unansweredQuestions).length > 0) {
                        AnswerwedQuestions=identifyAnsweredQuestions(text, questions) as QuestionsType;
                        preguntas= unansweredQuestions as QuestionsType
                        return gotoFlow(flowConstructIa);
                    } else {
                        return endFlow();
                    }
                }
            } catch (error) {
                console.error("Error en flowConstruct:", error);
                await flowDynamic("Ocurrió un error al procesar tus respuestas. Intenta nuevamente.");
            }
        }
    );

export { flowConstructIa };
