const { doAttackMissions } = require('./missionUtils/attacks')
const { doHackMissions } = require('./missionUtils/hacks')
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
