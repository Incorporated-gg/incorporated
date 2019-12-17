const { doAttackMissions } = require('./missions/attacks')
const { doSpyMissions } = require('./missions/spying')
const frequencyMs = 10 * 1000

const run = async () => {
  // Missions
  await doAttackMissions()
  await doSpyMissions()
}
module.exports = {
  run,
  frequencyMs,
}
