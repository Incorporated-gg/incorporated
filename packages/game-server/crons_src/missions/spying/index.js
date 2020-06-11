import mysql from '../../../src/lib/mysql'
import { calcSpiesCaptured, calcInformationPercentageObtained } from './calcs'
import {
  getUserResearchs,
  getUserBuildings,
  getUserPersonnel,
  runUserMoneyUpdate,
  getUserTodaysMissionsLimits,
} from '../../../src/lib/db/users'
import { getUserResearchBonusFromHoods } from '../../../src/lib/db/hoods'
import { getAllianceResearchBonusFromBuffs, getUserAllianceID } from '../../../src/lib/db/alliances'
import { logUserActivity } from '../../../src/lib/accountInternalApi'
import { ActivityTrailType } from 'shared-lib/activityTrailUtils'

export async function doSpyMissions() {
  const tsNow = Math.floor(Date.now() / 1000)
  const spyMissions = await mysql.query(
    'SELECT id, user_id, data, target_user, mission_type, started_at, will_finish_at, completed FROM missions WHERE completed=? AND mission_type=? AND will_finish_at<=?',
    [false, 'spy', tsNow]
  )

  // Grouping by attacked user solves race conditions when many people are attacking the same user
  await Promise.all(spyMissions.map(completeSpyMission))
}

async function completeSpyMission(mission) {
  const data = JSON.parse(mission.data)
  // Complete the mission
  const [[defender], [attacker]] = await Promise.all([
    mysql.query('SELECT id FROM users WHERE id=?', [mission.target_user]),
    mysql.query('SELECT id FROM users WHERE id=?', [mission.user_id]),
  ])
  if (!defender || !attacker) {
    // Either the defender or attacker do not exist anymore
    await mysql.query('UPDATE missions SET completed=1 WHERE id=?', [mission.id])
    return
  }

  const defenderAllianceID = await getUserAllianceID(defender.id)
  const attackerAllianceID = await getUserAllianceID(attacker.id)

  const [defensorResearchs, attackerResearchs, defensorBonusesFromHoods, attackerBonusesFromHoods] = await Promise.all([
    getUserResearchs(defender.id),
    getUserResearchs(attacker.id),
    getUserResearchBonusFromHoods(defenderAllianceID),
    getUserResearchBonusFromHoods(attackerAllianceID),
  ])

  const spiesSent = data.spies
  const attackerEspionageLvl = attackerResearchs[1] + attackerBonusesFromHoods.espionage
  const defensorEspionageLvl = defensorResearchs[1] + defensorBonusesFromHoods.espionage

  const spiesCaptured = calcSpiesCaptured({
    resLvlAttacker: attackerEspionageLvl,
    resLvLDefender: defensorEspionageLvl,
    spiesSent,
  })
  const spiesRemaining = spiesSent - spiesCaptured
  const informationPercentageObtained = calcInformationPercentageObtained({
    resLvlAttacker: attackerEspionageLvl,
    resLvLDefender: defensorEspionageLvl,
    spiesRemaining,
  })

  // Reduce spies if some were captured
  if (spiesCaptured > 0) {
    await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? AND resource_id=?', [
      spiesCaptured,
      attacker.id,
      'spies',
    ])
  }

  // Run money update for defender, so buildings money info is correct
  await runUserMoneyUpdate(defender.id)

  // Add bonuses
  const allianceBonuses = await getAllianceResearchBonusFromBuffs(defenderAllianceID)
  defensorResearchs[1] = defensorResearchs[1] + defensorBonusesFromHoods.espionage
  defensorResearchs[2] = defensorResearchs[2] + allianceBonuses.attack
  defensorResearchs[3] = defensorResearchs[3] + allianceBonuses.defense + defensorBonusesFromHoods.defense
  defensorResearchs[6] = defensorResearchs[6] + defensorBonusesFromHoods.security

  // Generate report
  const intelReport = await getIntelReport({
    informationPercentageObtained,
    spiesCaptured,
    attackerID: attacker.id,
    defenderID: defender.id,
    defensorResearchs,
  })

  // Update mission status
  const result = spiesCaptured > 0 ? 'caught' : 'not_caught'
  const newData = JSON.stringify({
    ...data,
    report: intelReport,
  })
  await mysql.query('UPDATE missions SET completed=1, result=?, data=? WHERE id=?', [result, newData, mission.id])

  logUserActivity({
    userId: attacker.id,
    date: Date.now(),
    ip: 'internal',
    message: '',
    type: ActivityTrailType.SPY_FINISH,
    extra: {
      sourceUserId: attacker.id,
      targetUserId: defender.id,
      result,
    },
  })
}

async function getIntelReport({
  informationPercentageObtained,
  spiesCaptured,
  attackerID,
  defenderID,
  defensorResearchs,
}) {
  // building upon last report, if any
  const minWillFinishAt = Math.floor(Date.now() / 1000) - 60 * 30
  const recentSpyReport = await mysql.selectOne(
    'SELECT id, data FROM missions WHERE completed=1 AND mission_type=? AND user_id=? AND target_user=? AND will_finish_at>=? ORDER BY will_finish_at DESC LIMIT 1',
    ['spy', attackerID, defenderID, minWillFinishAt]
  )
  if (recentSpyReport) {
    const missionData = JSON.parse(recentSpyReport.data)
    if (missionData.report.obtainedInfo < 100) {
      await mysql.query('DELETE FROM missions WHERE id=?', [recentSpyReport.id])
      informationPercentageObtained = Math.min(100, informationPercentageObtained + missionData.report.obtainedInfo)
    }
  }

  const defensorBuildings = await getUserBuildings(defenderID)
  const defensorPersonnel = await getUserPersonnel(defenderID)
  const missionLimits = await getUserTodaysMissionsLimits(defenderID)
  const intelReport = {
    obtainedInfo: Math.floor(informationPercentageObtained),
    captured_spies: spiesCaptured,
    buildings: {},
    personnel: {},
    researchs: {},
    dailyLimits: {
      maxDefenses: missionLimits.maxDefenses,
    },
  }

  let percentageLeft = informationPercentageObtained
  const discoverables = [
    { type: 'buildings', info: defensorBuildings[1], id: 1 },
    { type: 'buildings', info: defensorBuildings[2], id: 2 },
    { type: 'buildings', info: defensorBuildings[3], id: 3 },
    { type: 'buildings', info: defensorBuildings[4], id: 4 },
    { type: 'buildings', info: defensorBuildings[5], id: 5 },
    { type: 'buildings', info: defensorBuildings[6], id: 6 },
    { type: 'personnel', info: defensorPersonnel.sabots, id: 'sabots' },
    { type: 'personnel', info: defensorPersonnel.spies, id: 'spies' },
    { type: 'personnel', info: defensorPersonnel.guards, id: 'guards' },
    { type: 'personnel', info: defensorPersonnel.thieves, id: 'thieves' },
    { type: 'researchs', info: defensorResearchs[1], id: 1 },
    { type: 'researchs', info: defensorResearchs[2], id: 2 },
    { type: 'researchs', info: defensorResearchs[3], id: 3 },
    { type: 'researchs', info: defensorResearchs[4], id: 4 },
    { type: 'researchs', info: defensorResearchs[5], id: 5 },
    { type: 'researchs', info: defensorResearchs[6], id: 6 },
    { type: 'dailyLimits', info: missionLimits.attacksLeft, id: 'attacksLeft' },
    { type: 'dailyLimits', info: missionLimits.receivedToday, id: 'receivedToday' },
  ]
  const iterationPercentageCost = 100 / discoverables.length
  while (1) {
    percentageLeft -= iterationPercentageCost
    if (percentageLeft < -0.01 || !discoverables.length) break // -0.01 to account for rounding errors
    const nextDiscoverable = discoverables.shift()

    intelReport[nextDiscoverable.type][nextDiscoverable.id] = nextDiscoverable.info
  }

  return intelReport
}
