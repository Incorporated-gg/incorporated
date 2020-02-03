import api from '../../lib/api'
import { userData, updateUserData } from '../../lib/user'
import { calcBuildingPrice } from 'shared-lib/buildingsUtils'

export async function buyBuilding(buildingID) {
  const currentAmount = userData.buildings[buildingID].quantity
  const coste = calcBuildingPrice(buildingID, currentAmount)
  if (coste > userData.money) return
  try {
    updateUserData({
      money: userData.money - coste,
      buildings: {
        ...userData.buildings,
        [buildingID]: { ...userData.buildings[buildingID], quantity: currentAmount + 1 },
      },
    })
    await api.post('/v1/buildings/buy', { building_id: buildingID, count: 1 })
  } catch (e) {
    alert(e.message)
  }
}
