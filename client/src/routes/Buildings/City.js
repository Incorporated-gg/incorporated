import React, { useState } from 'react'
import { buildingsList, calcBuildingPrice, calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import { researchList, calcResearchPrice } from 'shared-lib/researchUtils'
import PropTypes from 'prop-types'
import { useUserData } from '../../lib/user'
import BuildingModal from './BuildingModal'

const positions = {
  bOptimizeResearch: { top: 25, left: 90 },
  b1: { top: 8, left: 23 },
  b2: { top: 77, left: 45 },
  b3: { top: 1, left: 80 },
  b4: { top: 42, left: 30 },
  b5: { top: 60, left: 80 },
  b6: { top: 93, left: 72 },
}
const cityBuildings = [
  ...buildingsList,
  {
    id: 'OptimizeResearch',
    name: researchList[4].name,
  },
]
const citySize = { width: 720, height: 1000 }
function getTransformFromPos(pos) {
  const pxLeft = (pos.left / 100) * citySize.width
  const perLeft = pos.left
  const pxTop = (pos.top / 100) * citySize.height
  const perTop = pos.top
  return `translate(calc(${pxLeft}px - ${perLeft}%), calc(${pxTop}px - ${perTop}%))`
}

City.propTypes = {
  buildings: PropTypes.object,
  updateBuildingN: PropTypes.func,
}
export default function City({ buildings, updateBuildingN }) {
  const cityZoom = Math.min(1, window.innerWidth / citySize.width)

  return (
    <>
      <div className="city-container">
        <div className="city" style={{ width: citySize.width, height: citySize.height, zoom: cityZoom }}>
          <div className="city-bg" />
          {cityBuildings.map(buildingInfo => (
            <CityClickableElm
              key={buildingInfo.id}
              buildingInfo={buildingInfo}
              buildings={buildings}
              updateBuildingN={updateBuildingN}
            />
          ))}
        </div>
      </div>
    </>
  )
}

CityClickableElm.propTypes = {
  buildingInfo: PropTypes.object,
  buildings: PropTypes.object,
  updateBuildingN: PropTypes.func.isRequired,
}
function CityClickableElm({ buildingInfo, buildings, updateBuildingN }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  let countTxt
  let timeToRecoverInvestment
  const userData = useUserData()
  if (buildingInfo.id === 'OptimizeResearch') {
    const currentOptimizeLvl = userData.researchs[5]
    const coste = calcResearchPrice(5, currentOptimizeLvl)

    let income = 0
    if (buildings) {
      const oldIncome = Object.entries(buildings).reduce(
        (prev, [buildingID, quantity]) =>
          prev + calcBuildingDailyIncome(parseInt(buildingID), quantity, currentOptimizeLvl),
        0
      )
      const newIncome = Object.entries(buildings).reduce(
        (prev, [buildingID, quantity]) =>
          prev + calcBuildingDailyIncome(parseInt(buildingID), quantity, currentOptimizeLvl + 1),
        0
      )
      income = newIncome - oldIncome
    }

    timeToRecoverInvestment = (Math.round((coste / income) * 10) / 10).toLocaleString() + ' días'
    countTxt = `Lvl ${currentOptimizeLvl}`
  } else {
    const buildingCount = buildings ? buildings[buildingInfo.id] : 0
    const coste = calcBuildingPrice(buildingInfo.id, buildingCount)
    const income = calcBuildingDailyIncome(buildingInfo.id, 1, userData.researchs[5])
    timeToRecoverInvestment = (Math.round((coste / income) * 10) / 10).toLocaleString() + ' días'
    countTxt = buildingCount.toLocaleString()
  }

  const onClick = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <BuildingModal
        isOpen={isModalOpen}
        initialBuildingID={buildingInfo.id}
        onRequestClose={() => setIsModalOpen(false)}
        buildings={buildings}
        updateBuildingN={updateBuildingN}
      />
      <div
        className="city-item"
        style={{ transform: getTransformFromPos(positions['b' + buildingInfo.id]) }}
        onClick={onClick}
        key={buildingInfo.id}>
        <div>
          <div className="name">{buildingInfo.name}</div>
          <div className="count">{countTxt}</div>
          <div className="PRI">PRI: {timeToRecoverInvestment}</div>
        </div>
      </div>
    </>
  )
}
