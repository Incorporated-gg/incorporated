import { giveGoldToUser, giveXPToUser } from '../../../lib/db/users'

type EventDataTaskFinished = {
  userID: number
  taskID: number
}

export default async function taskFinished(data: EventDataTaskFinished): Promise<void> {
  const reward = 1 + Math.floor(data.taskID / 7)
  await giveGoldToUser(data.userID, reward)
  await giveXPToUser(data.userID, reward)
}
