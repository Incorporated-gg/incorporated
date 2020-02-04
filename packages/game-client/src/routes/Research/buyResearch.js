import api from '../../lib/api'
import { userData, updateUserData, reloadUserData } from '../../lib/user'
import { calcResearchPrice, calcResearchTime } from 'shared-lib/researchUtils'

export async function buyResearch(researchID) {
  const currentLvl = userData.researchs[researchID]
  const cost = calcResearchPrice(researchID, currentLvl)
  if (cost > userData.money) return
  try {
    const tsNow = Math.floor(Date.now() / 1000)
    const researchTime = calcResearchTime(researchID, currentLvl)

    if (researchTime === 0) {
      updateUserData({
        money: userData.money - cost,
        researchs: Object.assign({}, userData.researchs, { [researchID]: currentLvl + 1 }),
      })
    } else {
      const finishesAt = tsNow + researchTime
      updateUserData({
        money: userData.money - cost,
        activeResearchs: [
          ...userData.activeResearchs,
          {
            research_id: researchID,
            finishes_at: finishesAt,
          },
        ],
      })
    }

    await api.post('/v1/research/buy', { research_id: researchID, count: 1 })
    if (researchTime !== 0) await reloadUserData()
  } catch (e) {
    alert(e.message)
  }
}
