import { doAttackMissions } from './missions/attacks'
import { doSpyMissions } from './missions/spying'
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
