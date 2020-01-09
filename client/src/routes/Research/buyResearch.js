import api from '../../lib/api'
import { userData, updateUserData } from '../../lib/user'
import { calcResearchPrice } from 'shared-lib/researchUtils'

export async function buyResearch(researchID) {
  const currentOptimizeLvl = userData.researchs[researchID]
  const coste = calcResearchPrice(researchID, currentOptimizeLvl)
  try {
    await api.post('/v1/research/buy', { research_id: researchID, count: 1 })
    updateUserData({
      money: userData.money - coste,
      researchs: Object.assign({}, userData.researchs, { [researchID]: currentOptimizeLvl + 1 }),
    })
  } catch (e) {
    alert(e.message)
  }
}
