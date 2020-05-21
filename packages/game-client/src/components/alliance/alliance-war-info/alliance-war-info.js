import React, { useState } from 'react'
import PropTypes from 'prop-types'
import AllianceLink from 'components/alliance/alliance-link'
import styles from './alliance-war-info.module.scss'
import { WAR_DAYS_DURATION } from 'shared-lib/allianceUtils'
import { getServerDay } from 'lib/serverTime'
import { useUserData } from 'lib/user'
import IncButton from 'components/UI/inc-button'
import AskForWarAidModal from '../ask-for-war-aid-modal/ask-for-war-aid-modal'
import ChooseWarHoodsModal from '../choose-war-hoods-modal/choose-war-hoods-modal'

const warDaysArray = new Array(WAR_DAYS_DURATION).fill(null).map((_, dayIndex) => dayIndex + 1)

WarInfo.propTypes = {
  war: PropTypes.object.isRequired,
}
export default function WarInfo({ war }) {
  const userData = useUserData()

  const isMyAllianceAttackerOrDefender =
    userData.alliance && (userData.alliance.id === war.alliance1.id || userData.alliance.id === war.alliance2.id)

  const hasFinished = Boolean(war.winner)
  const hasStarted = Object.keys(war.days).length > 0
  let warLineGraphData = null
  let extraData = {
    points: [0, 0],
    wins: [0, 0],
    profit: [0, 0],
    smacks: [0, 0],
  }
  if (hasStarted) {
    warLineGraphData = {
      labels: [],
      datasets: [
        { label: war.alliance1.short_name, data: [], backgroundColor: 'rgb(238, 207, 130)' },
        { label: war.alliance2.short_name, data: [], backgroundColor: 'rgb(238, 207, 130)' },
      ],
    }
    warDaysArray.forEach(day => {
      const dayData = war.days[day]

      warLineGraphData.labels.push(`Día ${day}`)
      warLineGraphData.datasets[0].data.push(dayData ? dayData.alliance1.war_points : 0)
      warLineGraphData.datasets[1].data.push(dayData ? dayData.alliance2.war_points : 0)

      extraData.points[0] += dayData ? dayData.alliance1.war_points || 0 : 0
      extraData.points[1] += dayData ? dayData.alliance2.war_points || 0 : 0
      extraData.wins[0] += dayData ? dayData.alliance1.attack_wins || 0 : 0
      extraData.wins[1] += dayData ? dayData.alliance2.attack_wins || 0 : 0
      extraData.profit[0] += dayData ? dayData.alliance1.profit || 0 : 0
      extraData.profit[1] += dayData ? dayData.alliance2.profit || 0 : 0
      extraData.smacks[0] += dayData ? dayData.alliance1.attack_smacks || 0 : 0
      extraData.smacks[1] += dayData ? dayData.alliance2.attack_smacks || 0 : 0
    })
  }

  const canAskForWarAid = !hasFinished && isMyAllianceAttackerOrDefender && userData.alliance_user_rank.permission_admin
  const [isAskForWarAidModalOpen, setIsAskForWarAidModalOpen] = useState(false)
  const openAskForWarAidModal = () => {
    setIsAskForWarAidModalOpen(true)
  }

  const canChooseWarHoods =
    canAskForWarAid && userData.alliance.id === war.alliance2.id && war.alliance1_hoods.length === 0
  const [isChooseWarHoodsModalOpen, setIsChooseWarHoodsModalOpen] = useState(false)
  const openChooseWarHoodsModal = () => {
    setIsChooseWarHoodsModalOpen(true)
  }

  return (
    <div>
      <div className={styles.declaredOnText}>Comenzó día {getServerDay(war.created_at * 1000) + 1}</div>
      <h2>
        <AllianceLink type="bigBadge" alliance={war.alliance1} />
        <span>{' VS '}</span>
        <AllianceLink type="bigBadge" alliance={war.alliance2} />
      </h2>
      <div>
        Ayudando a <AllianceLink alliance={war.alliance1} />:
        {war.alliance1_aids.map(aid => {
          return <AllianceLink key={aid.alliance.id} alliance={aid.alliance} />
        })}
      </div>
      <div>
        Ayudando a <AllianceLink alliance={war.alliance2} />:
        {war.alliance2_aids.map(aid => {
          return <AllianceLink key={aid.alliance.id} alliance={aid.alliance} />
        })}
      </div>
      {canChooseWarHoods && (
        <>
          <IncButton onClick={openChooseWarHoodsModal}>Escoger barrios</IncButton>
          <ChooseWarHoodsModal
            war={war}
            isOpen={isChooseWarHoodsModalOpen}
            onRequestClose={() => {
              setIsChooseWarHoodsModalOpen(false)
            }}
          />
        </>
      )}
      {canAskForWarAid && (
        <>
          <IncButton onClick={openAskForWarAidModal}>Pedir ayuda</IncButton>
          <AskForWarAidModal
            war={war}
            isOpen={isAskForWarAidModalOpen}
            onRequestClose={() => {
              setIsAskForWarAidModalOpen(false)
            }}
          />
        </>
      )}
      {!hasStarted && <div>La guerra se ha declarado hoy y comenzará mañana</div>}
      <br />
      <div>Barrios que se juega atacante: {war.alliance1_hoods.map(hood => hood.name).join(', ')}</div>
      <br />
      <div>Barrios que se juega defensor: {war.alliance2_hoods.map(hood => hood.name).join(', ')}</div>
      <br />
      {hasStarted && (
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
        </>
      )}
      {hasFinished && (
        <div>
          Ganador: <AllianceLink alliance={war[`alliance${war.winner}`]} />
        </div>
      )}
    </div>
  )
}
