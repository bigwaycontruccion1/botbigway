import 'dotenv/config';
import { addKeyword } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'

const ADMIN_NUMBER = process.env.WHATSAPP_ADMIN 

function extractOnlyNumbers(input: string): string {
  // Elimina todo lo que no sea dígito numérico
  return input.replace(/\D/g, '');
}
const blackListFlow = addKeyword<Provider, Database>('mute')
    .addAction(async (ctx, { blacklist, flowDynamic }) => {
        //  await flowDynamic(`admin_number = ${extractOnlyNumbers(ADMIN_NUMBER)} `)
        //  await flowDynamic(`entrando en el blackListFlow ${ctx.from},   ${ctx.body}`)
         if (ctx.from === extractOnlyNumbers(ADMIN_NUMBER)) {
            const toMute = extractOnlyNumbers(ctx.body) //Mute +34000000 message incoming
            // flowDynamic(`ha entrado con el numero administrador y bloquearemos al numero ${toMute}`)
            const check = blacklist.checkIf(toMute)
            if (!check) {
                console.log ('agregando a la blacklist el  numero ', check )
                blacklist.add(toMute)
                await flowDynamic(`❌ ${toMute} muted`)
                return
            }
            await flowDynamic( `eliminando de la blacklist el numero :  ${toMute}`)
            console.log ('eliminando de la  blacklist el  numero: ', check )

            blacklist.remove(toMute)
            await flowDynamic(`🆗 ${toMute} unmuted`)
            return
        }
})

const SelfBlackListFlow = addKeyword<Provider, Database>('mute')
.addAction(async (ctx, { blacklist, flowDynamic }) => {
    const toMute = extractOnlyNumbers(ctx.from) //Mute +34000000 message incoming
    const check = blacklist.checkIf(toMute)
    if (!check) {
        console.log ('agregando a la blacklist el  numero ', toMute )
        blacklist.add(toMute)
        // await flowDynamic(`❌ ${toMute} muted`)
        return
    }
        
})

 export {blackListFlow, SelfBlackListFlow};
