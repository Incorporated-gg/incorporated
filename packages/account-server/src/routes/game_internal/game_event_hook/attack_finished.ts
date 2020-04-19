import { giveGoldToUser, giveXPToUser } from '../../../lib/db/users'
import { increaseUserStat } from '../../../lib/db/stats'

type EventDataAttackFinished = {
  attackerID: number
  defenderID: number
  result: string
  isHoodAttack: boolean
  robbedMoney?: number
}

const GOLD_FOR_ATTACKING = 5
const GOLD_FOR_DEFENDING_SUCCESSFULLY = 15
export default async function attackFinished(data: EventDataAttackFinished): Promise<void> {
  if (data.isHoodAttack) return // For now, no gold or XP for hood attacks

  switch (data.result) {
    case 'win': {
      await giveGoldToUser(data.attackerID, GOLD_FOR_ATTACKING)
      await giveXPToUser(data.attackerID, 2)
      await increaseUserStat(data.attackerID, 'attacks_win', 1)
      await increaseUserStat(data.defenderID, 'defenses_lose', 1)
      break
    }
    case 'lose': {
      await giveGoldToUser(data.defenderID, GOLD_FOR_DEFENDING_SUCCESSFULLY)
      await giveXPToUser(data.defenderID, 6)
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
