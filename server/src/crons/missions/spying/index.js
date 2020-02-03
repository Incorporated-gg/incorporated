const mysql = require('../../../lib/mysql')
const { getResearchs, sendMessage, getBuildings, getPersonnel, runUserMoneyUpdate } = require('../../../lib/db/users')
const { calcSpiesCaptured, calcInformationObtained } = require('./calcs')

module.exports = {
  doSpyMissions,
}

async function doSpyMissions() {
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
  const [[[defender]], [[attacker]]] = await Promise.all([
    mysql.query('SELECT id FROM users WHERE id=?', [mission.target_user]),
    mysql.query('SELECT id FROM users WHERE id=?', [mission.user_id]),
  ])
  if (!defender || !attacker) {
    // Either the defender or attacker do not exist anymore
    await mysql.query('UPDATE missions SET completed=1 WHERE id=?', [mission.id])
    return
  }

  const [defensorResearchs, attackerResearchs] = await Promise.all([
    getResearchs(defender.id),
    getResearchs(attacker.id),
  ])

  const spiesSent = data.spies
  const spiesCaptured = calcSpiesCaptured({
    resLvlAttacker: attackerResearchs[1],
    resLvLDefender: defensorResearchs[1],
    spiesSent,
  })
  const spiesRemaining = spiesSent - spiesCaptured
  const informationObtained = calcInformationObtained({
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

  // Message defender about espionage
  if (spiesCaptured > 0) {
    await sendMessage({
      receiverID: defender.id,
      senderID: null,
      type: 'caught_spies',
      data: {
        attacker_id: attacker.id,
        captured_spies: spiesCaptured,
      },
    })
  }

  // Run money update for defender, so buildings money info is correct
  await runUserMoneyUpdate(defender.id)

  // Generate report
  const intelReport = {
    captured_spies: spiesCaptured,
  }
  if (informationObtained.buildings) intelReport.buildings = await getBuildings(defender.id)
  if (informationObtained.personnel) intelReport.personnel = await getPersonnel(defender.id)
  if (informationObtained.research) intelReport.researchs = defensorResearchs

  // Update mission status
  const result = spiesCaptured > 0 ? 'caught' : 'not_caught'
  const newData = JSON.stringify({
    ...data,
    report: intelReport,
  })
  await mysql.query('UPDATE missions SET completed=1, result=?, data=? WHERE id=?', [result, newData, mission.id])

  // Message intel report
  await sendMessage({
    receiverID: attacker.id,
    senderID: null,
    type: 'spy_report',
    data: {
      mission_id: mission.id,
    },
  })
}
