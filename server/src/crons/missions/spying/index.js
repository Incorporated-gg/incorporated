const mysql = require('../../../lib/mysql')
const { getResearchs, sendMessage, getBuildings, getPersonnel } = require('../../../lib/db/users')
const { calcSpiesCaptured, calcInformationObtained } = require('./calcs')

module.exports = {
  doSpyMissions,
}

async function doSpyMissions() {
  const tsNow = Math.floor(Date.now() / 1000)
  const [
    spyMissions,
  ] = await mysql.query(
    'SELECT id, user_id, target_user, mission_type, personnel_sent, started_at, will_finish_at, completed FROM missions WHERE completed=? AND mission_type=? AND will_finish_at<=?',
    [false, 'spy', tsNow]
  )

  // Grouping by attacked user solves race conditions when many people are attacking the same user
  await Promise.all(spyMissions.map(completeSpyMission))
}

async function completeSpyMission(mission) {
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
  const spiesSent = parseInt(mission.personnel_sent)

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

  // Update mission status
  const result = spiesCaptured > 0 ? 'caught' : 'not_caught'
  await mysql.query('UPDATE missions SET completed=1, result=? WHERE id=?', [result, mission.id])

  // Return spies to user
  if (spiesRemaining > 0) {
    await mysql.query('UPDATE users_resources SET quantity=quantity+? WHERE user_id=? AND resource_id=?', [
      spiesRemaining,
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

  // Generate report
  const intelReport = {}
  if (informationObtained.buildings) intelReport.buildings = await getBuildings(defender.id)
  if (informationObtained.personnel) intelReport.personnel = await getPersonnel(defender.id)
  if (informationObtained.research) intelReport.researchs = defensorResearchs

  // Message intel report
  await sendMessage({
    receiverID: attacker.id,
    senderID: null,
    type: 'spy_report',
    data: {
      defender_id: defender.id,
      spies_count: spiesSent,
      intel_report: intelReport,
      captured_spies: spiesCaptured,
    },
  })
}
