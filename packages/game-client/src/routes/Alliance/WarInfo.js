import React from 'react'
import PropTypes from 'prop-types'
import AllianceLink from '../../components/AllianceLink'
import styles from './WarInfo.module.scss'

const WAR_DAYS_DURATION = 5
const warDaysArray = new Array(WAR_DAYS_DURATION).fill(null).map((_, dayIndex) => dayIndex + 1)

WarInfo.propTypes = {
  war: PropTypes.object.isRequired,
}
export default function WarInfo({ war }) {
  let warLineGraphData = null
  let extraData = {
    points: [0, 0],
    wins: [0, 0],
    profit: [0, 0],
    smacks: [0, 0],
  }
  if (war.data) {
    warLineGraphData = {
      labels: [],
      datasets: [
        { label: war.alliance1.short_name, data: [] },
        { label: war.alliance2.short_name, data: [] },
      ],
    }
    warDaysArray.forEach(day => {
      const dayData = war.data.days[day]

      warLineGraphData.labels.push(`Día ${day}`)
      warLineGraphData.datasets[0].data.push(dayData ? dayData.war_points_alliance1 : 0)
      warLineGraphData.datasets[1].data.push(dayData ? dayData.war_points_alliance2 : 0)

      extraData.points[0] += dayData ? dayData.war_points_alliance1 || 0 : 0
      extraData.points[1] += dayData ? dayData.war_points_alliance2 || 0 : 0
      extraData.wins[0] += dayData ? dayData.attack_wins_alliance1 || 0 : 0
      extraData.wins[1] += dayData ? dayData.attack_wins_alliance2 || 0 : 0
      extraData.profit[0] += dayData ? dayData.profit_alliance1 || 0 : 0
      extraData.profit[1] += dayData ? dayData.profit_alliance2 || 0 : 0
      extraData.smacks[0] += dayData ? dayData.attack_smacks_alliance1 || 0 : 0
      extraData.smacks[1] += dayData ? dayData.attack_smacks_alliance2 || 0 : 0
    })
  }

  return (
    <div>
      <h2>
        <AllianceLink alliance={war.alliance1} />
        {' VS '}
        <AllianceLink alliance={war.alliance2} />
      </h2>
      <p>Se declaró el {new Date(war.created_at * 1000).toLocaleString()}</p>
      {!war.data && <div>La guerra se ha declarado hoy y comenzará mañana</div>}
      {war.data && (
        <>
          <img
            className={styles.lineGraphImg}
            src={`https://quickchart.io/chart?c={type:'bar',data:${JSON.stringify(warLineGraphData)}}`}
            alt="Gráfica de Puntos de guerra detallados por día"
          />
          <div>
            <p>
              <b>{war.alliance1.short_name}</b>: {extraData.points[0]} puntos de guerra{' '}
            </p>
            <p>{extraData.wins[0].toLocaleString()} victorias</p>
            <p>{extraData.profit[0].toLocaleString()}€ beneficios</p>
            <p>{extraData.smacks[0].toLocaleString()} estampadas</p>
          </div>
          <div>
            <p>
              <b>{war.alliance2.short_name}</b>: {extraData.points[1]} puntos de guerra{' '}
            </p>
            <p>{extraData.wins[1].toLocaleString()} victorias</p>
            <p>{extraData.profit[1].toLocaleString()}€ beneficios</p>
            <p>{extraData.smacks[1].toLocaleString()} estampadas</p>
          </div>

          {war.data.winner && (
            <div>
              Ganador: <AllianceLink alliance={war[`alliance${war.data.winner}`]} />
            </div>
          )}
        </>
      )}
    </div>
  )
}