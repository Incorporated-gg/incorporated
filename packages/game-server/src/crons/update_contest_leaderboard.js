import { updateCurrentContestScoreboard } from './on_day_reset/contests'
export const frequencyMs = 1000 * 60 * 60

export async function run() {
  await updateCurrentContestScoreboard()
}
