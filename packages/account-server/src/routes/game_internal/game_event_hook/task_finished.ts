import { giveGoldToUser, giveXPToUser } from '../../../lib/db/users'

type EventDataTaskFinished = {
  userID: number
}

export default async function taskFinished(data: EventDataTaskFinished): Promise<void> {
  await giveGoldToUser(data.userID, 1)
  await giveXPToUser(data.userID, 1)
}
