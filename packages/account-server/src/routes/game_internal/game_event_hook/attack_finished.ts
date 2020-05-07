import { giveXPToUser } from '../../../lib/db/users'
import { increaseUserStat } from '../../../lib/db/stats'

type EventDataAttackFinished = {
  attackerID: number
  defenderID: number
  result: string
  isHoodAttack: boolean
  robbedMoney?: number
}

const XP_FOR_ATTACKING = 2
const XP_FOR_DEFENDING_SUCCESSFULLY = 6
export default async function attackFinished(data: EventDataAttackFinished): Promise<void> {
  if (data.isHoodAttack) return // For now, no gold or XP for hood attacks

  switch (data.result) {
    case 'win': {
      await giveXPToUser(data.attackerID, XP_FOR_ATTACKING)
      await increaseUserStat(data.attackerID, 'attacks_win', 1)
      await increaseUserStat(data.defenderID, 'defenses_lose', 1)
      break
    }
    case 'lose': {
      await giveXPToUser(data.defenderID, XP_FOR_DEFENDING_SUCCESSFULLY)
      await increaseUserStat(data.attackerID, 'attacks_lose', 1)
      await increaseUserStat(data.defenderID, 'defenses_win', 1)
      break
    }
    case 'draw': {
      await increaseUserStat(data.attackerID, 'attacks_draw', 1)
      await increaseUserStat(data.defenderID, 'defenses_draw', 1)
      break
    }
    default: {
      throw new Error(`Unknown result ${data.result}`)
    }
  }

  if (data.robbedMoney) {
    await increaseUserStat(data.attackerID, 'robbed_money', data.robbedMoney)
  }
}
