import mysql from '../mysql'
import { updateUserAchievements } from './achievements'

export async function increaseUserStat(userID: number, statID: string, amount: number): Promise<void> {
  const result = await mysql.query('UPDATE users_stats SET value=value+? WHERE user_id=? AND stat_id=?', [
    amount,
    userID,
    statID,
  ])
  if (result.affectedRows === 0) {
    await mysql.query('INSERT INTO users_stats (value, user_id, stat_id) VALUES (?, ?, ?)', [amount, userID, statID])
  }
  await updateUserAchievements(userID, statID)
}
