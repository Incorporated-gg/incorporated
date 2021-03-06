import { userData } from 'lib/user'
import { simulateAttack } from 'shared-lib/simulateAttack'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'

export default function calcGuardsSuggestion() {
  const bestAttackFromAllBuildings = calcAttacksToAllBuildings().sort(
    (a, b) => b.attackerTotalIncome - a.attackerTotalIncome
  )[0]

  const maxSabotsToBeProfitable = Math.floor(
    bestAttackFromAllBuildings.attackerTotalIncome / PERSONNEL_OBJ.sabots.price
  )

  return Math.round((maxSabotsToBeProfitable * 1.2) / 50) * 50
}

function calcAttacksToAllBuildings() {
  return buildingsList.map(buildingInfo => {
    const simulation = simulateAttack({
      defensorGuards: 0,
      attackerSabots: 9999999,
      attackerThieves: 0,
      attackerSabotageLvl: userData.researchs[2],
      defensorDefenseLvl: userData.researchs[3],
      defensorSecurityLvl: userData.researchs[6],
      unprotectedMoney: 0,
      buildingID: buildingInfo.id,
      buildingAmount: userData.buildings[buildingInfo.id].quantity,
    })
    return simulation
  })
}
