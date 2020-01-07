import React from 'react'
import { calcBuildingPrice, calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import PropTypes from 'prop-types'
import { useUserData } from '../../lib/user'
import api from '../../lib/api'
import Card from './Card'

const buildingImages = {
  1: require('./img/b1.png'),
  2: require('./img/b2.png'),
  3: require('./img/b3.png'),
  4: require('./img/b4.png'),
  5: require('./img/b5.png'),
  6: require('./img/b6.png'),
}
const buildingDescriptions = {
  1: `Se llama zapatero a la persona cuyo oficio es la fabricación y reparación de calzado.`,
  2: `Un restaurante es un establecimiento donde se paga por la comida y bebida para ser consumidas en el mismo local.`,
  3: `Una droguería es un comercio especializado o bien un mercado de proporciones mayores.`,
  4: `Un bar es un establecimiento donde se sirven bebidas y aperitivos, para ser consumidos en el mismo establecimiento.`,
  5: `El cine es la técnica y el arte de crear y proyectar metrajes.`,
  6: `Un hotel es un edificio que otorga servicio de alojamiento.`,
}
const buildingAccentColors = {
  1: '#EE5487',
  2: '#1C053A',
  3: '#82BB30',
  4: '#4FACFF',
  5: '#F6901A',
  6: '#A13647',
}

BuildingItem.propTypes = {
  buildingInfo: PropTypes.object.isRequired,
  buildingCount: PropTypes.number.isRequired,
  updateBuildingN: PropTypes.func.isRequired,
}
export default function BuildingItem({ buildingInfo, buildingCount, updateBuildingN }) {
  const userData = useUserData()
  const coste = calcBuildingPrice(buildingInfo.id, buildingCount)
  const income = calcBuildingDailyIncome(buildingInfo.id, 1, userData.researchs[5])
  const timeToRecoverInvestment = (Math.round((coste / income) * 10) / 10).toLocaleString()

  const currentOptimizeLvl = userData.researchs[5]
  const hasEnoughOptimizeLvl = currentOptimizeLvl >= buildingInfo.requiredOptimizeResearchLevel
  const canAfford = userData.money > coste
  const canBuy = hasEnoughOptimizeLvl && canAfford

  const buyBuilding = async () => {
    if (!canBuy) return
    try {
      updateBuildingN(buildingInfo.id, buildingCount + 1)
      await api.post('/v1/buy_buildings', { building_id: buildingInfo.id, count: 1 })
    } catch (e) {
      updateBuildingN(buildingInfo.id, buildingCount)
      alert(e.message)
    }
  }

  let desc = buildingDescriptions[buildingInfo.id]
  if (!hasEnoughOptimizeLvl)
    desc = `${desc}\nNecesitas oficina central nivel ${buildingInfo.requiredOptimizeResearchLevel}`

  return (
    <Card
      image={buildingImages[buildingInfo.id]}
      title={buildingInfo.name}
      subtitle={buildingCount.toLocaleString()}
      desc={desc}
      coste={coste.toLocaleString()}
      pri={timeToRecoverInvestment}
      beneficios={income.toLocaleString()}
      canBuy={canBuy}
      onBuy={buyBuilding}
      accentColor={buildingAccentColors[buildingInfo.id]}
    />
  )
}
