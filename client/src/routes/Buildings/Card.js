import React from 'react'
import PropTypes from 'prop-types'
import './Card.scss'
import { calcBuildingMaxMoney } from 'shared-lib/buildingsUtils'
import { useUserData } from '../../lib/user'

Card.propTypes = {
  isResearch: PropTypes.bool,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  buildingCount: PropTypes.number.isRequired,
  desc: PropTypes.string.isRequired,
  coste: PropTypes.string.isRequired,
  pri: PropTypes.string.isRequired,
  dailyIncome: PropTypes.number.isRequired,
  onBuy: PropTypes.func.isRequired,
  canBuy: PropTypes.bool.isRequired,
  accentColor: PropTypes.string.isRequired,
  accumulatedMoney: PropTypes.number,
  buildingID: PropTypes.number,
  onExtractMoney: PropTypes.func,
}

export default function Card({
  isResearch,
  image,
  title,
  buildingCount,
  desc,
  coste,
  pri,
  dailyIncome,
  onBuy,
  canBuy,
  accentColor,
  accumulatedMoney,
  buildingID,
  onExtractMoney,
}) {
  const userData = useUserData()
  let accumulatedMoneyElement = null
  if (!isResearch) {
    const maxMoney = calcBuildingMaxMoney({
      buildingID: buildingID,
      buildingAmount: buildingCount,
      bankResearchLevel: userData.researchs[4],
    })
    const moneyClassName = `${accumulatedMoney > maxMoney.maxSafe ? 'unsafe' : ''}`
    accumulatedMoneyElement = (
      <>
        <div className="stat-container">
          <div className="stat-icon">
            <img src={require('./img/stat-price.png')} alt="" />
          </div>
          <div className="stats-text">
            <div className="stat-title">Banco</div>
            <div className="stat-value">
              <span className={moneyClassName}>{Math.floor(accumulatedMoney).toLocaleString()}€</span> /{' '}
              {maxMoney.maxTotal.toLocaleString()}€
            </div>
          </div>
        </div>
        <button className="buy-button" onClick={onExtractMoney} style={{ color: accentColor }}>
          SACAR
        </button>
      </>
    )
  }

  return (
    <div className="card-container">
      <div className="card">
        <div className="image">
          <img src={image} alt="" />
        </div>
        <div className="name">{title}</div>
        <div className="subtitle">
          {isResearch ? `Lvl. ${buildingCount.toLocaleString()}` : buildingCount.toLocaleString()}
        </div>
        <div className="description">{desc}</div>

        <div className="accent-bg" style={{ backgroundColor: accentColor }}>
          <div className="stat-container">
            <div className="stat-icon">
              <img src={require('./img/stat-price.png')} alt="" />
            </div>
            <div className="stats-text">
              <div className="stat-title">Coste</div>
              <div className="stat-value">{coste}€</div>
            </div>
          </div>
          <div className="stat-container">
            <div className="stat-icon">
              <img src={require('./img/stat-pri.png')} alt="" />
            </div>
            <div className="stats-text">
              <div className="stat-title">PRI</div>
              <div className="stat-value">{pri} días</div>
            </div>
          </div>
          <div className="stat-container">
            <div className="stat-icon">
              <img src={require('./img/stat-income.png')} alt="" />
            </div>
            <div className="stats-text">
              <div className="stat-title">Bºs/día</div>
              <div className="stat-value">{Math.round(dailyIncome).toLocaleString()}€</div>
            </div>
          </div>
          <button className="buy-button" onClick={onBuy} disabled={!canBuy} style={{ color: accentColor }}>
            COMPRAR
          </button>
          {accumulatedMoneyElement}
        </div>
      </div>
    </div>
  )
}
