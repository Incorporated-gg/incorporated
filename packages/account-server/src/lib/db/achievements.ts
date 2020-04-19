import mysql from '../mysql'
import { achievements } from './achievements_list'

export async function updateUserAchievements(userID: number, statID: string): Promise<void> {
  await Promise.all(
    achievements
      .filter(achievement => {
        return achievement.statDependencies.includes(statID)
      })
      .map(async achievement => {
        const alreadyHas = await mysql.selectOne(
          'SELECT 1 FROM users_achievements WHERE user_id=? AND achievement_id=?',
          [userID, achievement.id]
        )
        if (alreadyHas) return

        const passesCheck = await achievement.check(userID)
        if (!passesCheck) return

        await mysql.query('INSERT INTO users_achievements (user_id, achievement_id) VALUES (?, ?)', [
          userID,
          achievement.id,
        ])
      })
  )
}
