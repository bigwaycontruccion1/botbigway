import 'dotenv/config';
import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot';
import { MemoryDB as Database } from '@builderbot/bot';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import AIClass from './services/ai';
import flowAgente from './flows/agent.flow';
import { flowRepair } from './flows/repair.flow';
import { flowConstructIa } from './flows/construct.flow';
import { flowAgentConfirm } from './flows/confirmAgent.flow';
import { clearHistory } from './utils/handleHistory';
import {blackListFlow, SelfBlackListFlow} from './flows/blackList.flow';

const PORT = process.env.PORT ?? 3008;
const ai = new AIClass(process.env.OPEN_API_KEY, 'gpt-3.5-turbo-16k');

const welcomeFlow = addKeyword<Provider, Database>(['hi', 'hello', 'hola', 'buenas','buenos dias', 'buenos días', 'buenas tardes', 'buenas noches', 'buen día', 'hola buenos días', 'Hola', 'Holis', 'pileta', 'hacer', 'necesito', 'quiero'])
    .addAnswer(`🙌 Hola bienvenido al *Chatbot* de Bigway Construcción`)
   
    .addAnswer(
        [
            'Decime si estás interesado en:',
            '👉  *CONSTRUIR* para construir una pileta',
            '👉  *REPARAR* para reparar una pileta',
            '👉  *AGENTE* para hablar con uno de nuestros agentes',
            '👉  *HOLA* para reiniciar la conversación',
            // '👉  *blackList* para la lista negra',
        ].join('\n'),
        { delay: 800, capture: true },
        async (ctx, { state, fallBack, gotoFlow}) => { // Asegúrate de incluir gotoFlow aquí
            const userInput = ctx.body.toLocaleUpperCase();

            clearHistory(state);
            if (!(userInput.includes('CONSTRUIR') || userInput.includes('REPARAR') || userInput.includes('AGENTE')|| userInput.includes('HOLA')|| userInput.includes('BLACKLIST'))) {
                return fallBack('Debes escribir *CONSTRUIR, REPARAR, AGENTE, HOLA*');

            }
             console.log('deberia irse al ', userInput+ ctx.from);
            if (userInput.includes('HABLAR')) {
                return gotoFlow(flowAgentConfirm)
            }
            if (userInput.includes('CONSTRUIR')) {
                return gotoFlow(flowConstructIa)
            }
            if (userInput.includes('REPARAR')) {
                return gotoFlow(flowRepair)
            }
            if (userInput.includes('AGENTE')) {
                return gotoFlow(flowAgente)
            }
            if (userInput.includes('HOLA')){
                return gotoFlow(welcomeFlow)
            } 
            if (userInput.includes('BLACKLIST')){
                return gotoFlow(blackListFlow)
            } 
        }
    ) 
    // .addAction(conversationalLayer)
    // .addAction(mainLayer);
const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, flowAgente, flowRepair, flowConstructIa, flowAgentConfirm, blackListFlow, SelfBlackListFlow]);
    const adapterProvider = createProvider(Provider);
    const adapterDB = new Database();
console.log('userInput', );
    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    }, { extensions: { ai } });

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body;
            await bot.sendMessage(number, message, { media: urlMedia ?? null });
            return res.end('sended');
        })
    );

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body;
            await bot.dispatch('REGISTER_FLOW', { from: number, name });
            return res.end('trigger');
        })
    );

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body;
            await bot.dispatch('SAMPLES', { from: number, name });
            return res.end('trigger');
        })
    );

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body;
            if (intent === 'remove') bot.blacklist.remove(number);
            if (intent === 'add') bot.blacklist.add(number);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: 'ok', number, intent }));
        })
    );
    httpServer(+PORT);
};

main();