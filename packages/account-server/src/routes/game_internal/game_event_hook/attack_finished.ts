import { giveGoldToUser } from '../../../lib/db/users'

type EventDataAttackFinished = {
  attackerID: number
  defenderID: number
  result: string
}

const GOLD_FOR_ATTACKING = 5
const GOLD_FOR_DEFENDING_SUCCESSFULLY = 15
export default async function hookAttackFinished(data: EventDataAttackFinished): Promise<void> {
  await giveGoldToUser(data.attackerID, GOLD_FOR_ATTACKING)
  if (data.result === 'lose') {
    await giveGoldToUser(data.defenderID, GOLD_FOR_DEFENDING_SUCCESSFULLY)
  }
}
