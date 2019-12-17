const mysql = require('../../lib/mysql')
const { getResearchs, sendMessage, getBuildings, getPersonnel } = require('../../lib/db/users')

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
  await mysql.query('UPDATE missions SET completed=1 WHERE id=?', [mission.id])

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

function calcSpiesCaptured({ resLvlAttacker, resLvLDefender, spiesSent }) {
  const sendableSpies = Math.ceil(3 * Math.pow(Math.E, 0.11 * resLvlAttacker))
  const sentSpiesPercentage = spiesSent / sendableSpies
  const valueDiff =
    resLvLDefender < resLvlAttacker
      ? (0.18 * resLvLDefender) / Math.pow(resLvlAttacker - resLvLDefender, 1.3)
      : 0.18 * resLvLDefender * Math.pow(resLvLDefender - resLvlAttacker, 1.3)
  const spiesProbability =
    sentSpiesPercentage > 1
      ? 0.1 + Math.pow(1.03, resLvlAttacker) * Math.pow(sentSpiesPercentage - 1, 2)
      : sentSpiesPercentage / 10
  const lvlProbability = valueDiff / 100
  const failProbability = spiesProbability + lvlProbability

  const randomNum = Math.random()
  const caught = randomNum < failProbability
  let spiesCaptured = 0
  if (caught) {
    const randomPart = Math.random() * 0.75 + 0.25
    spiesCaptured = Math.ceil(randomPart * failProbability * spiesSent)
    spiesCaptured = Math.min(spiesSent, spiesCaptured)
  }

  return spiesCaptured
}

function calcInformationObtained({ resLvLDefender, spiesRemaining }) {
  const neededSpies = Math.ceil(3 * Math.pow(Math.E, 0.11 * resLvLDefender))
  const sentSpiesPercentage = spiesRemaining / neededSpies

  const MINIMUM_FOR_RESEARCH = 1
  const MINIMUM_FOR_PERSONNEL = 0.66
  const MINIMUM_FOR_BUILDINGS = 0.33

  const spiesSectionRelation =
    sentSpiesPercentage < MINIMUM_FOR_BUILDINGS
      ? sentSpiesPercentage / MINIMUM_FOR_BUILDINGS
      : sentSpiesPercentage < MINIMUM_FOR_PERSONNEL
      ? (sentSpiesPercentage - MINIMUM_FOR_BUILDINGS) / MINIMUM_FOR_BUILDINGS
      : sentSpiesPercentage < MINIMUM_FOR_RESEARCH
      ? (sentSpiesPercentage - MINIMUM_FOR_PERSONNEL) / MINIMUM_FOR_BUILDINGS
      : MINIMUM_FOR_RESEARCH

  const maxInfo =
    sentSpiesPercentage < MINIMUM_FOR_BUILDINGS
      ? 'buildings'
      : sentSpiesPercentage < MINIMUM_FOR_PERSONNEL
      ? 'personnel'
      : 'research'
  const minInfo =
    sentSpiesPercentage < MINIMUM_FOR_BUILDINGS
      ? 'nothing'
      : sentSpiesPercentage < MINIMUM_FOR_PERSONNEL
      ? 'buildings'
      : 'personnel'

  const maxInfoProb = spiesSectionRelation

  const randomNum = Math.random()
  const infoObtained = randomNum < maxInfoProb ? maxInfo : minInfo
  return {
    buildings: infoObtained === 'buildings' || infoObtained === 'personnel' || infoObtained === 'research',
    personnel: infoObtained === 'personnel' || infoObtained === 'research',
    research: infoObtained === 'research',
  }
}
