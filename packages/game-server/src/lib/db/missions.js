import { getHoodData } from './hoods'
import { getUserData } from './users'

export async function parseMissionFromDB(mission) {
  if (!mission) throw new Error(`Unknown mission: ${JSON.stringify(mission)}`)

  if (mission.mission_type === 'spy') {
    const defensorData = await getUserData(mission.target_user)
    const attackerData = await getUserData(mission.user_id)
    const data = JSON.parse(mission.data)
    return {
      user: attackerData,
      target_user: defensorData,
      mission_type: mission.mission_type,
      sent_spies: data.spies,
      started_at: mission.started_at,
      will_finish_at: mission.will_finish_at,
      completed: mission.completed,
      result: mission.result,
      report: data.report,
    }
  } else if (mission.mission_type === 'attack') {
    const attackerData = await getUserData(mission.user_id)
    const data = JSON.parse(mission.data)
    const result = {
      user: attackerData,
      target_user: undefined,
      target_hood: undefined,
      target_building: data.building,
      mission_type: mission.mission_type,
      sent_sabots: data.sabots,
      sent_thieves: data.thieves,
      started_at: mission.started_at,
      will_finish_at: mission.will_finish_at,
      completed: mission.completed,
      result: mission.result,
      profit: mission.profit,
      report: data.report,
    }
    if (mission.target_user) {
      result.target_user = await getUserData(mission.target_user)
    }
    if (data.hood) {
      result.target_hood = await getHoodData(data.hood)
    }
    return result
  } else throw new Error(`Unknown mission type: ${mission.mission_type}`)
}
