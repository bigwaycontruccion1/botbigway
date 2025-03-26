import { addKeyword } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { numberClean } from '../utils/numberClean'

const ADMIN_NUMBER = process.env.ADMIN_NUMBER 

const blackListFlow = addKeyword<Provider, Database>('mute')
    .addAction(async (ctx, { blacklist, flowDynamic }) => {
        if (ctx.from === ADMIN_NUMBER) {
            const toMute = numberClean(ctx.body) //Mute +34000000 message incoming
            const check = blacklist.checkIf(toMute)
            if (!check) {
                blacklist.add(toMute)
                await flowDynamic(`❌ ${toMute} muted`)
                return
            }
            blacklist.remove(toMute)
            await flowDynamic(`🆗 ${toMute} unmuted`)
            return
        }
})
 export default blackListFlow;
