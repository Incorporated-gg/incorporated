import React from 'react'
import PropTypes from 'prop-types'
import './Card.scss'

Card.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  coste: PropTypes.string.isRequired,
  pri: PropTypes.string.isRequired,
  beneficios: PropTypes.string.isRequired,
  onBuy: PropTypes.func.isRequired,
  canBuy: PropTypes.bool.isRequired,
  accentColor: PropTypes.string.isRequired,
}

export default function Card({ image, title, subtitle, desc, coste, pri, beneficios, onBuy, canBuy, accentColor }) {
  return (
    <div className="card-container">
      <div className="card">
        <div className="image">
          <img src={image} alt="" />
        </div>
        <div className="name">{title}</div>
        <div className="subtitle">{subtitle}</div>
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
              <div className="stat-value">{beneficios}€</div>
            </div>
          </div>
          <button className="buy-button" onClick={onBuy} disabled={!canBuy} style={{ color: accentColor }}>
            COMPRAR
          </button>
        </div>
      </div>
    </div>
  )
}
