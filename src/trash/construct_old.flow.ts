import { addKeyword, EVENTS } from "@builderbot/bot";
import AIClass from "../services/ai";
import { getHistoryParse, clearHistory } from "../utils/handleHistory";
import { generateTimer } from "../utils/generateTimer";
import { appToSheets } from "../services/calendar";

const questions = {
    "dimensiones_pileta": "1- ¿Cuáles son las dimensiones de la pileta que deseas construir? 📏",
    "elemento_especial": "2- ¿Quieres agregar algún elemento especial como jacuzzi, climatización, cascada?",
    "ubicacion_obra": "3- ¿Dónde se ubicará la obra? 📍",
    "luces": "4- ¿La pileta llevará luces? 💡",
    "revestimiento_pintada": "5- ¿La pileta será revestida o pintada? Si es revestida, ¿sabes qué tipo de revestimiento te gustaría?",
    "excavacion_maquina_mano": "6- ¿Hay espacio para que entre una máquina para excavar o la excavación debe hacerse a mano? 🚜",
    "tierra_pozo": "7- ¿La tierra del pozo quedará en el lugar o hay que retirarla del terreno? 🚧",
    "revestimiento_solarium": "8- ¿El revestimiento del solárium será de baldosones atermicos? ☀",
    "pendiente_terreno": "9- ¿El terreno tiene pendiente hacia algún lado o es totalmente plano? 🌄",
    "inicio_construccion": "10- ¿Cuándo tienes pensado iniciar la construcción de la pileta? 🗓"
};
const generateJsonParse = (info: string,  preguntas: string) => {
    const prompt = `tu tarea principal es analizar la información proporcionada en el contexto e, 
    identifica y extrae las respuestas a las siguientes preguntas: "${preguntas}".
    Si alguna respuesta no está explícita en el texto, enumera las preguntas faltantes y solicítame que ingrese la información 
    correspondiente, una por una.  Una vez que todas las respuestas estén completas, incluye una variable llamada completo con el valor true.

   
    Texto de entrada:  "${info}"
    consideraciones Importantes a tener en cuenta:
    - Las respuestas deben ser extraídas del texto proporcionado, sin modificarlas.
    - sólo se puede colocar false o true en la clave "completo".
    - si no reconoces una respuesta a una pregunta, debes marcarla como "No se proporcionó".

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

const generateJsonParse2= (info: string,  preguntas: string, respuestasTexto: string ) => {

const prompt = `# Análisis y extracción de información para construcción de piletas

# Contexto
Tu tarea es analizar información sobre requerimientos para la construcción de una pileta, extraer datos específicos y
 gestionar la recolección de información faltante.

# Definición de preguntas
{
  "dimensiones_pileta": "1- ¿Cuáles son las dimensiones de la pileta que deseas construir? 📏",
  "elemento_especial": "2- ¿Quieres agregar algún elemento especial como jacuzzi, climatización, cascada?",
  "ubicacion_obra": "3- ¿Dónde se ubicará la obra? 📍",
  "luces": "4- ¿La pileta llevará luces? 💡",
  "revestimiento_pintada": "5- ¿La pileta será revestida o pintada? Si es revestida, ¿sabes qué tipo de revestimiento te gustaría?",
  "excavacion_maquina_mano": "6- ¿Hay espacio para que entre una máquina para excavar o la excavación debe hacerse a mano? 🚜",
  "tierra_pozo": "7- ¿La tierra del pozo quedará en el lugar o hay que retirarla del terreno? 🚧",
  "revestimiento_solarium": "8- ¿El revestimiento del solárium será de baldosones atermicos? ☀",
  "pendiente_terreno": "9- ¿El terreno tiene pendiente hacia algún lado o es totalmente plano? 🌄",
  "inicio_construccion": "10- ¿Cuándo tienes pensado iniciar la construcción de la pileta? 🗓"
}

## Datos de entrada
Texto 1: "${info}"

Texto 2: "${respuestasTexto}"

# Instrucciones
1. Extrae las respuestas del Texto 1 como fuente primaria.
2. Si alguna respuesta no está en el Texto 1, búscala en el Texto 2.
3. Si hay inconsistencias entre los textos, prioriza la información del Texto 1 y señala la inconsistencia.
4. Normaliza las respuestas al formato estándar (Sí/No para respuestas binarias).
5. Si una respuesta no se encuentra en ninguno de los textos, márcala como "No se proporcionó".
6. Evalúa si todas las preguntas tienen respuestas válidas.
7. Identifica las preguntas sin respuesta o con inconsistencias para solicitar aclaración.

# Reglas de validación
- Dimensiones: Debe tener formato numérico con unidades o relación (ej. "8*8", "4x6 metros")
- Teléfono: Debe tener formato numérico completo
- Fechas: Normalizar a un formato consistente cuando sea posible

# Formato de salida
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
  "completo": boolean,
}

Después de mostrar el JSON, si hay preguntas faltantes o inconsistencias, solicita al usuario que proporcione información adicional 
para una pregunta específica a la vez, siguiendo el orden original de las preguntas.`

    // Objeto JSON a generar:`
    // console.log('contexto= ', info)
    // console.log('preguntas= ', preguntas)
    // console.log('respuestasTexto= ', respuestasTexto)
    console.log('prompt= ', prompt)
return prompt

}

 const POOL_CONSTRUCTION_PROMPT = (datosEntrada1: string,  preguntas: string, datosEntrada2: string ) => {
    const promt =     `# Análisis y extracción de información para construcción de piletas

## Contexto
Tu tarea es analizar información sobre requerimientos para la construcción de una pileta, extraer datos específicos y gestionar la recolección de información faltante.

## Definición de preguntas
{
  "dimensiones_pileta": "1- ¿Cuáles son las dimensiones de la pileta que deseas construir? 📏",
  "elemento_especial": "2- ¿Quieres agregar algún elemento especial como jacuzzi, climatización, cascada?",
  "ubicacion_obra": "3- ¿Dónde se ubicará la obra? 📍",
  "luces": "4- ¿La pileta llevará luces? 💡",
  "revestimiento_pintada": "5- ¿La pileta será revestida o pintada? Si es revestida, ¿sabes qué tipo de revestimiento te gustaría?",
  "excavacion_maquina_mano": "6- ¿Hay espacio para que entre una máquina para excavar o la excavación debe hacerse a mano? 🚜",
  "tierra_pozo": "7- ¿La tierra del pozo quedará en el lugar o hay que retirarla del terreno? 🚧",
  "revestimiento_solarium": "8- ¿El revestimiento del solárium será de baldosones atermicos? ☀",
  "pendiente_terreno": "9- ¿El terreno tiene pendiente hacia algún lado o es totalmente plano? 🌄",
  "inicio_construccion": "10- ¿Cuándo tienes pensado iniciar la construcción de la pileta? 🗓"
}

## Datos de entrada
Texto 1: "${datosEntrada1}"
Ejemplo: "Teléfono: 56949273928, Datos: la pileta no llevará luces, sin revestimiento, no hay espacio para la máquina, la tierra se deja en el terreno, con baldosones atermicos"

### Texto 1: "${datosEntrada2}"
Ejemplo:
json
{
  "telefono": "56949273928",
  "dimensiones_pileta": "8*8",
  "elemento_especial": "No se proporcionó",
  "ubicacion_obra": "Puerto Ordaz",
  "luces": "No se proporcionó",
  "revestimiento_pintada": "revestida",
  "tipo_revestimiento": "No se proporcionó",
  "excavacion_maquina_mano": "No se proporcionó",
  "tierra_pozo": "No se proporcionó",
  "revestimiento_solarium": "No se proporcionó",
  "pendiente_terreno": "No se proporcionó",
  "inicio_construccion": "la semana que viene",
  "completo": false
}


## Instrucciones
1. Extrae las respuestas de "${datosEntrada1}" como fuente primaria.
2. Si alguna respuesta no está en "${datosEntrada1}", búscala en "${datosEntrada2}".
3. Si hay inconsistencias entre los textos, prioriza la información de "${datosEntrada1}"" y señala la inconsistencia.
4. Normaliza las respuestas al formato estándar (Sí/No para respuestas binarias).
5. Si una respuesta no se encuentra en ninguno de los textos, márcala como "No se proporcionó".
6. Evalúa si todas las preguntas tienen respuestas válidas.
7. Identifica las preguntas sin respuesta o con inconsistencias para solicitar aclaración.

## Reglas de validación
- **Dimensiones:** Debe tener formato numérico con unidades o relación (ej. "8*8", "4x6 metros").
- **Teléfono:** Debe tener formato numérico completo.
- **Fechas:** Normalizar a un formato consistente cuando sea posible.

## Formato de salida
Genera un objeto JSON con la siguiente estructura:
json
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

Después de mostrar el JSON, si hay preguntas faltantes o inconsistencias, solicita al usuario que proporcione información 
adicional para una pregunta específica a la vez, siguiendo el orden original de las preguntas.`;
return promt
}
const identifyUnansweredQuestions = (jsonResponse: string, questions: Record<string, string>) => {
    const response = JSON.parse(jsonResponse);
    const unanswered = Object.keys(questions).filter(question => 
        !Object.prototype.hasOwnProperty.call(response, question) || response[question] === "No se proporcionó"
    );    
    // getQuestionValuesByKeys(questions, unanswered.toString()); 
    return { unansweredQuestions:  unanswered};
};

function updateResponses(originalStr: string, updateStr: string): string {
    try {
        // Validar y parsear los strings a objetos
        const original: Record<string, string | boolean> = originalStr ? JSON.parse(originalStr) : {};
        const update: Record<string, string | boolean> = updateStr ? JSON.parse(updateStr) : {};

        // Crear un objeto para almacenar el resultado combinado
        const resultado: Record<string, string | boolean> = { ...original };

        // Combinar la información de ambos datos
        for (const clave in update) {
            if (Object.prototype.hasOwnProperty.call(update, clave)) {
                resultado[clave] = update[clave] || resultado[clave] || "No se proporcionó";
            }
        }

        // Verificar si todas las claves tienen un valor diferente de "No se proporcionó"
        resultado.completo = Object.values(resultado).every(
            (valor) => valor !== "No se proporcionó"
        );

        // Convertir el resultado a un string JSON
        return JSON.stringify(resultado);
    } catch (error) {
        console.error("Error en updateResponses:", error.message);
        return originalStr || "{}"; // Retornar el original si ocurre un error
    }
}

let preguntas_respondidas = "";
const flowConstruct = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state }) => {
        
        try {
            // Enviar las preguntas iniciales
            for (const question of Object.values(questions)) {
                await flowDynamic(question);
                await new Promise((resolve) => setTimeout(resolve, generateTimer(150, 250)));
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

                // Obtener la instancia de IA
                const ai = extensions.ai as AIClass;

                // Función para verificar si todas las preguntas están respondidas
                const checkAllQuestionsAnswered = async () => {
                    const infoCustomer = `Teléfono: ${state.get('telefono')}, Datos: ${state.get('datos')}`;
                    // const systemContent = `Analiza las siguientes respuestas y verifica si están completas: ${infoCustomer}`;
                    const systemContent = generateJsonParse(infoCustomer, JSON.stringify(questions));

                    // Crear el chat con la IA
                    const text = await ai.createChat([
                        {
                            role: 'system',
                            content: systemContent,
                        },
                    ]);
                    console.log('flowConstruct');
                    console.log('Respuesta de la IA en flowConstruct:', text);
                    preguntas_respondidas = text;

                    // Verificar si todas las preguntas están completas
                    if (preguntas_respondidas.includes('completo: true')) {
                        await flowDynamic('Gracias! Estaré analizando las respuestas.');
                        await appToSheets(text); // Guardar en Google Sheets
                        clearHistory(state); // Limpiar el historial
                        await flowDynamic('Te estaremos conectando con uno de nuestros agentes. ¿Estás de acuerdo?');
                        return true; // Todas las preguntas están respondidas
                    } else {
                        // Si faltan preguntas, identificar cuáles son
                        const { unansweredQuestions } = identifyUnansweredQuestions(text, questions);
                        console.log('Preguntas sin responder:', unansweredQuestions);

                        if (unansweredQuestions.length > 0) {
                            await flowDynamic('Por favor, responde las siguientes preguntas:');

                            // Enviar las preguntas faltantes
                            for (const questionKey of unansweredQuestions) {
                                await flowDynamic(questions[questionKey]);
                                console.log('Pregunta:', questionKey);
                            }

                            return false; // Aún faltan preguntas por responder
                        }
                    }
                };

                // Ciclo hasta que todas las preguntas estén respondidas
                let allQuestionsAnswered = false;
                while (!allQuestionsAnswered) {
                    allQuestionsAnswered = await checkAllQuestionsAnswered();
                    if (!allQuestionsAnswered) {
                        console.log('Faltan preguntas por responder');
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

const flowForm = addKeyword(EVENTS.ACTION)
    .addAnswer(
        'Puedes responder todas estas preguntas en un sólo mensaje',
        { capture: true },
        async (ctx, { state, extensions, flowDynamic, gotoFlow }) => {
            try {
                 console.log('estoy entrando en el flowform')
                // Actualizar el estado con la respuesta del usuario
                await state.update({ resp: ctx.body });

                // Obtener la instancia de IA
                const ai = extensions.ai as AIClass;

                // Generar el contenido para la IA
                const infoCustomer = `Teléfono: ${state.get('telefono')}, Datos: ${state.get('resp')}`;
                // const systemContent = `Analiza las siguientes respuestas y verifica si están completas: ${infoCustomer}`;
                const systemContent = POOL_CONSTRUCTION_PROMPT(infoCustomer, JSON.stringify(questions), preguntas_respondidas);

                // Crear el chat con la IA
                const text = await ai.createChat([
                    {
                        role: 'system',
                        content: systemContent,
                    },
                ]);

                console.log('Respuesta de la IA en flowForm: probando ', text);
                // preguntas_respondidas = updateResponses(preguntas_respondidas, text);
                console.log('preguntas_respondidas:', text);
                // Verificar si todas las preguntas están respondidas
                // Redirigir al flujo principal para verificar si faltan preguntas
                return gotoFlow(flowConstruct);
            } catch (error) {
                console.error('Error en flowForm:', error);
                await flowDynamic('Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.');
                return gotoFlow(flowConstruct);
            }
        }
    );

export { flowConstruct, flowForm };