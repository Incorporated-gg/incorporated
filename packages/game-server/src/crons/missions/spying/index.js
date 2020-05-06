import mysql from '../../../lib/mysql'
import { calcSpiesCaptured, calcInformationPercentageObtained } from './calcs'
import { getUserResearchs, getUserBuildings, getUserPersonnel, runUserMoneyUpdate } from '../../../lib/db/users'

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

  const [defensorResearchs, attackerResearchs] = await Promise.all([
    getUserResearchs(defender.id),
    getUserResearchs(attacker.id),
  ])

  const spiesSent = data.spies
  const spiesCaptured = calcSpiesCaptured({
    resLvlAttacker: attackerResearchs[1],
    resLvLDefender: defensorResearchs[1],
    spiesSent,
  })
  const spiesRemaining = spiesSent - spiesCaptured
  const informationPercentageObtained = calcInformationPercentageObtained({
    resLvlAttacker: attackerResearchs[1],
    resLvLDefender: defensorResearchs[1],
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

  // Generate report
  const intelReport = await getIntelReport({
    informationPercentageObtained,
    spiesCaptured,
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
}

async function getIntelReport({ informationPercentageObtained, spiesCaptured, defenderID, defensorResearchs }) {
  const defensorBuildings = await getUserBuildings(defenderID)
  const defensorPersonnel = await getUserPersonnel(defenderID)
  const intelReport = {
    captured_spies: spiesCaptured,
    buildings: {},
    personnel: {},
    researchs: {},
  }

  let percentageLeft = informationPercentageObtained
  const discoverables = [
    { type: 'buildings', id: 1 },
    { type: 'buildings', id: 2 },
    { type: 'buildings', id: 3 },
    { type: 'buildings', id: 4 },
    { type: 'buildings', id: 5 },
    { type: 'buildings', id: 6 },
    { type: 'personnel', id: 'sabots' },
    { type: 'personnel', id: 'spies' },
    { type: 'personnel', id: 'guards' },
    { type: 'personnel', id: 'thieves' },
    { type: 'researchs', id: 1 },
    { type: 'researchs', id: 2 },
    { type: 'researchs', id: 3 },
    { type: 'researchs', id: 4 },
    { type: 'researchs', id: 5 },
    { type: 'researchs', id: 6 },
  ]
  const iterationPercentageCost = 100 / discoverables.length 
  while (1) {
    percentageLeft -= iterationPercentageCost
    if (percentageLeft < 0 || !discoverables.length) break
    const nextDiscoverable = discoverables.shift()

    const infoObj =
      nextDiscoverable.type === 'buildings'
        ? defensorBuildings
        : nextDiscoverable.type === 'personnel'
        ? defensorPersonnel
        : nextDiscoverable.type === 'researchs'
        ? defensorResearchs
        : null
    if (!infoObj) throw new Error(`Unknown infoObj for discoverable: ${JSON.stringify(nextDiscoverable)}`)

    intelReport[nextDiscoverable.type][nextDiscoverable.id] = infoObj[nextDiscoverable.id]
  }

  return intelReport
}
