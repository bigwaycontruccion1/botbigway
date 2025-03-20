
import { addAnswer, addKeyword } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { numberClean } from '../utils/numberClean'

// const PORT = process.env.PORT ?? 3008
const ADMIN_NUMBER = process.env.ADMIN_NUMBER 

// const validationFlow = addKeyword<Provider, Database>('mute')
//     .addAction(async (ctx, { blacklist, flowDynamic }) => {
      
//             return
//         }
// })
//  export default validationFlow;
// const fullSamplesFlow = addKeyword<Provider, Database>(['samples', utils.setEvent('SAMPLES')])
//     .addAnswer(`💪 I'll send you a lot files...`)

const validator = async (info: JSON) => {
    const validationFlow = addKeyword<Provider, Database>('mute')
    .addAction(async (ctx, { gotoFlow, flowDynamic }) =>  {
        const info = ctx.body
        console.log(info)
        return
    })
}



const validationFlow = addKeyword<Provider, Database>('mute')
.addAction(async (ctx, { blacklist, flowDynamic }) => { 
        console.log('entrando al validationflow')
        return
    })
 export default validationFlow;


// ¿Cuáles son las dimensiones de la pileta que deseas construir?
// ¿Quieres agregar algún elemento especial como jacuzzi, climatización, cascada?
// ¿Dónde se ubicará la obra?
// ¿La pileta llevará luces?
// ¿La pileta será revestida o pintada? Si es revestida, ¿sabes qué tipo de revestimiento te gustaría?
// ¿Hay espacio para que entre una máquina para excavar o la excavación debe hacerse a mano? 
// ¿La tierra del pozo quedará en el lugar o hay que retirarla del terreno? 
// ¿El revestimiento del solárium será de baldosones atermicos? 
// ¿El terreno tiene pendiente hacia algún lado o es totalmente plano? 
// ¿Cuándo tenes pensado iniciar la construcción de la pileta?