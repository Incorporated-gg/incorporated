const { doAttackMissions } = require('./missions/attacks')
const { doHackMissions } = require('./missions/hacks')
const frequencyMs = 10 * 1000

const run = async () => {
  // Missions
  await doAttackMissions()
  await doHackMissions()
}
module.exports = {
  run,
  frequencyMs,
}
