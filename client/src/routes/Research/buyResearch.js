import api from '../../lib/api'
import { userData, updateUserData } from '../../lib/user'

export async function buyResearch(researchID) {
  try {
    await api.post('/v1/research/buy', { research_id: researchID, count: 1 })
    const newCount = userData.researchs[researchID] + 1
    updateUserData({ researchs: Object.assign({}, userData.researchs, { [researchID]: newCount }) })
  } catch (e) {
    alert(e.message)
  }
}
