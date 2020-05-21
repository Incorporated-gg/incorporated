import { completeUserAttackMission } from './completeUserAttackMission'
import mysql from '../../../src/lib/mysql'
import { completeHoodAttackMission } from './completeHoodAttackMission'

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

export async function doAttackMissions() {
  const tsNow = Math.floor(Date.now() / 1000)
  const attackMissions = await mysql.query(
    'SELECT id, user_id, target_user, data, mission_type, started_at, will_finish_at, completed FROM missions WHERE completed=? AND mission_type=? AND will_finish_at<=?',
    [false, 'attack', tsNow]
  )

  // Grouping by attacked user solves race conditions when many people are attacking the same user
  const attackedUsers = attackMissions.map(mission => mission.target_user).filter(onlyUnique)
  await Promise.all(
    attackedUsers.map(async attackedUserID => {
      const userMissions = attackMissions.filter(mission => mission.target_user === attackedUserID)
      for (const mission of userMissions) {
        const isAttackingHood = attackedUserID === 0
        if (isAttackingHood) {
          await completeHoodAttackMission(mission)
        } else {
          await completeUserAttackMission(mission)
        }
      }
    })
  )
}
