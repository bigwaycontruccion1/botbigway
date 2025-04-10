import { addKeyword, EVENTS } from "@builderbot/bot";
import AIClass from "../services/ai";
import { getHistoryParse, clearHistory } from "../utils/handleHistory";
import { generateTimer } from "../utils/generateTimer";
import { appToSheets } from "../services/calendar";
// import { flowAgentConfirm } from "./confirmAgent.flow";
import welcomeFlow from "./welcome.flow";
import { blackListFlow, SelfBlackListFlow } from "./blackList.flow";
import { numberClean } from "~/utils/numberClean";

// Define types for better type safety
type QuestionsType = Record<string, string>;

// Predefined questions
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

// Helper function to filter unanswered questions
const filterQuestions = (keys: string[], questionsObj: QuestionsType): QuestionsType =>
    keys.reduce((acc, key) => {
        if (key in questionsObj) acc[key] = questionsObj[key];
        return acc;
    }, {} as QuestionsType);

// Generate the AI prompt
const generatePrompt = (inputText: string, questions: QuestionsType, answeredQuestions: QuestionsType): string => `
Contexto:
Tu tarea es analizar información sobre requerimientos para la construcción de una pileta, extraer datos específicos y responder las siguientes preguntas: 
${JSON.stringify(questions, null, 2)}

Datos de entrada:
Texto 1: ${inputText}
Texto 2: ${JSON.stringify(answeredQuestions, null, 2)}

CONSIDERACIONES IMPORTANTES:
- Usa las respuestas del Texto 2 como base. Si hay conflicto, prioriza las respuestas del Texto 1.
- Marca como "No se proporcionó" si no encuentras una respuesta.
- Incluye una clave "completo" con valor true si todas las respuestas están completas, de lo contrario, false.
- Devuelve **SOLO** un JSON válido con la estructura esperada.

ejemplo de respuesta:
Genera un objeto JSON con la siguiente estructura:
{
  "telefono": "string",
  "dimensiones_pileta": "string",
  "elemento_especial": "string",
  "ubicacion_obra": "string",
  "luces": "string",
  "revestimiento_pintada": "string",
  "tipo_revestimiento": "string",
  "excavacion_maquina_mano": "string",
  "tierra_pozo": "string",
  "revestimiento_solarium": "string",
  "pendiente_terreno": "string",
  "inicio_construccion": "string",
  "completo": boolean
}
`;

// Identify unanswered questions
const identifyUnansweredQuestions = (jsonResponse: string, questions: QuestionsType): QuestionsType => {
    try {
        const response = JSON.parse(jsonResponse);
        const unansweredKeys = Object.keys(questions).filter(
            key => !response[key] || response[key] === "No se proporcionó"
        );
        return filterQuestions(unansweredKeys, questions);
    } catch (error) {
        console.error("Error parsing JSON response:", error);
        return {};
    }
};

// Identify answered questions
const identifyAnsweredQuestions = (jsonResponse: string, questions: QuestionsType): QuestionsType => {
    try {
        const response = JSON.parse(jsonResponse);
        return Object.keys(questions).reduce((acc, key) => {
            if (response[key] && response[key] !== "No se proporcionó") acc[key] = response[key];
            return acc;
        }, {} as QuestionsType);
    } catch (error) {
        console.error("Error parsing JSON response:", error);
        return {};
    }
};

// Initialize flow
let unansweredQuestions = questions;
let answeredQuestions: QuestionsType = {};
const restartOptions = [ 'hola', 'cancelar', 'reiniciar', 'reset' ];
const flowConstructIa = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic }) => {
        try {
            for (const question of Object.values(unansweredQuestions)) {
                await flowDynamic(question);
                await new Promise(resolve => setTimeout(resolve, generateTimer(100, 150)));
            }
        } catch (error) {
            console.error("Error sending questions:", error);
            await flowDynamic("Ocurrió un error al enviar las preguntas. Intenta nuevamente.");
        }
    })
    .addAnswer(
        "Puedes responder todas estas preguntas en un solo mensaje",
        { capture: true },
        async (ctx, { state, extensions, flowDynamic, gotoFlow, endFlow, blacklist }) => {
            try {
                await state.update({ datos: ctx.body || "No proporcionado", telefono: ctx.from });
                if (restartOptions.includes(ctx.body.trim().toLowerCase())) {
                    console.log("Reiniciando flujo por solicitud del usuario.", ctx.from);
                    // await flowDynamic("Reiniciando flujo...");
                    unansweredQuestions = questions;
                    answeredQuestions = {};
                    await flowDynamic("Si deseas reiniciar la conversación, por favor vuelve a escribir 'hola'."); 
                    clearHistory(state);
                    return gotoFlow(welcomeFlow);
                }
                const ai = extensions.ai as AIClass;
                const inputText = `Teléfono: ${state.get("telefono")}, Datos: ${state.get("datos")}`;
                const prompt = generatePrompt(inputText, unansweredQuestions, answeredQuestions);

                let aiResponse;
                try {
                    aiResponse = await ai.createChat([{ role: "system", content: prompt }]);
                    console.log("AI Response:", aiResponse);
                } catch (error) {
                    console.error("AI Error:", error);
                    return await flowDynamic("Hubo un problema al procesar tu respuesta. Intenta nuevamente.");
                }

                let parsedResponse;
                try {
                    parsedResponse = JSON.parse(aiResponse);
                } catch (error) {
                    console.error("Error parsing AI response:", error);
                    return await flowDynamic("La respuesta no es válida. Intenta nuevamente.");
                }

                unansweredQuestions = identifyUnansweredQuestions(aiResponse, questions);
                answeredQuestions = { ...answeredQuestions, ...identifyAnsweredQuestions(aiResponse, questions) };

                if (parsedResponse.completo === true || Object.keys(unansweredQuestions).length === 0) {
                    await flowDynamic("Gracias! Estaré analizando las respuestas.");
                    await appToSheets(aiResponse);
                    clearHistory(state);
                    unansweredQuestions = questions;
                    answeredQuestions = {};
                    await flowDynamic('Un momento por favor ...')
                    return gotoFlow(SelfBlackListFlow)
                } else if (Object.keys(unansweredQuestions).length > 0) {
                    return gotoFlow(flowConstructIa);
                } else {
                    return endFlow();
                }
            } catch (error) {
                console.error("Error in flowConstruct:", error);
                await flowDynamic("Ocurrió un error al procesar tus respuestas. Intenta nuevamente.");
            }
        }
    );

export { flowConstructIa };
