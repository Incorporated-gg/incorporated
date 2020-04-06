import { giveGoldToUser, giveXPToUser } from '../../../lib/db/users'

type EventDataAttackFinished = {
  attackerID: number
  defenderID: number
  result: string
  isHoodAttack: boolean
}

const GOLD_FOR_ATTACKING = 5
const GOLD_FOR_DEFENDING_SUCCESSFULLY = 15
export default async function attackFinished(data: EventDataAttackFinished): Promise<void> {
  if (data.isHoodAttack) return // For now, no gold or XP for hood attacks

  await giveGoldToUser(data.attackerID, GOLD_FOR_ATTACKING)
  await giveXPToUser(data.attackerID, 2)
  if (data.result === 'lose') {
    await giveGoldToUser(data.defenderID, GOLD_FOR_DEFENDING_SUCCESSFULLY)
    await giveXPToUser(data.defenderID, 6)
  }
}
