const mysql = require('../../lib/mysql')
const { getResearchs, sendMessage, getBuildings, getPersonnel } = require('../../lib/db/users')

module.exports = {
  doHackMissions,
}

async function doHackMissions() {
  const tsNow = Math.floor(Date.now() / 1000)
  const [
    hackMissions,
  ] = await mysql.query(
    'SELECT id, user_id, target_user, mission_type, personnel_sent, started_at, will_finish_at, completed FROM missions WHERE completed=? AND mission_type=? AND will_finish_at<=?',
    [false, 'hack', tsNow]
  )

  // Grouping by attacked user solves race conditions when many people are attacking the same user
  await Promise.all(hackMissions.map(completeHackMission))
}

async function completeHackMission(mission) {
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
  const hackersCount = parseInt(mission.personnel_sent)

  const hackingResearchLvlDiff = attackerResearchs[1] - defensorResearchs[1]

  const successRandom = Math.floor(Math.random() * 30) // [0-30], random
  const successLvlDiff = Math.min(1, Math.max(0, hackingResearchLvlDiff / 40 / 2 + 0.5)) * 50 // [0-50], 25 being equal level, 0 being -40 lvl diff
  const successTroops = Math.min(1, Math.max(0, hackersCount / 40)) * 20 // [0-20], 0 being 1 troop, 20 being 40 troops
  const successPercentage = successRandom + successLvlDiff + successTroops
  const gotCaught = successPercentage < 35

  if (gotCaught) {
    // Message defender and attacker about hack fail
    await sendMessage({
      receiverID: defender.id,
      senderID: null,
      type: 'caught_hackers',
      data: {
        attacker_id: attacker.id,
        hackers_count: hackersCount,
      },
    })
    await sendMessage({
      receiverID: attacker.id,
      senderID: null,
      type: 'hack_report',
      data: {
        defender_id: defender.id,
        hackers_count: hackersCount,
        intel_report: false,
      },
    })
  } else {
    // Return hackers to user
    await mysql.query('UPDATE users_resources SET quantity=quantity+? WHERE user_id=? AND resource_id=?', [
      hackersCount,
      attacker.id,
      'hackers',
    ])

    // Generate report
    const intelReport = {}
    intelReport.buildings = await getBuildings(defender.id)
    if (successPercentage > 45) intelReport.personnel = await getPersonnel(defender.id)
    if (successPercentage > 75) intelReport.researchs = defensorResearchs

    // Message intel report
    await sendMessage({
      receiverID: attacker.id,
      senderID: null,
      type: 'hack_report',
      data: {
        defender_id: defender.id,
        hackers_count: hackersCount,
        intel_report: intelReport,
      },
    })
  }

  // Update mission status
  await mysql.query('UPDATE missions SET completed=1 WHERE id=?', [mission.id])
}
