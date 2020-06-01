import React from 'react'
import styles from './hood-item.module.scss'
import AllianceLink from 'components/alliance/alliance-link'
import { numberToAbbreviation } from 'lib/utils'
import IncButton from 'components/UI/inc-button'
import IncProgressBar from 'components/UI/inc-progress-bar'
import { userData } from 'lib/user'
import Icon from 'components/icon'
import PropTypes from 'prop-types'
import { getHoodBenefitValue, HOOD_ATTACK_PROTECTION_TIME, calcHoodDailyServerPoints } from 'shared-lib/hoodUtils'
import { ALLIANCE_RESEARCHS } from 'shared-lib/allianceUtils'

HoodItem.propTypes = {
  hood: PropTypes.object,
  setAttackModalHood: PropTypes.func,
  setIsManageHoodModalOpen: PropTypes.func,
}
export default function HoodItem({ hood, setAttackModalHood, setIsManageHoodModalOpen }) {
  const isMine = hood.owner && userData.alliance && hood.owner.id === userData.alliance.id
  const attackProtectionTimeRemaining = HOOD_ATTACK_PROTECTION_TIME - (Date.now() / 1000 - hood.last_owner_change_at)
  const attackProtectionTimeHours = Math.ceil(attackProtectionTimeRemaining / 60 / 60) + 'H'

  let benefitElm = ''
  const benefitValue = getHoodBenefitValue(hood.benefit, hood.tier)

  switch (hood.benefit) {
    case 'alliance_research_guards': {
      benefitElm = `${ALLIANCE_RESEARCHS[2].name}: +${benefitValue}`
      break
    }
    case 'alliance_research_sabots': {
      benefitElm = `${ALLIANCE_RESEARCHS[3].name}: +${benefitValue}`
      break
    }
    case 'alliance_research_thieves': {
      benefitElm = `${ALLIANCE_RESEARCHS[4].name}: +${benefitValue}`
      break
    }
    case 'extra_income': {
      benefitElm = `Ingresos: +${benefitValue}%`
      break
    }
    case 'player_research_espionage': {
      benefitElm = `Espionaje: +${benefitValue}`
      break
    }
    case 'player_research_security': {
      benefitElm = `Seguridad: +${benefitValue}`
      break
    }
    case 'player_research_defense': {
      benefitElm = `Defensa: +${benefitValue}`
      break
    }
    default: {
      benefitElm = '???'
      break
    }
  }
  benefitElm += `\n\nReputación diaria: +${calcHoodDailyServerPoints(hood.tier)}`

  return (
    <div key={hood.id} className={styles.container}>
      <div className={styles.topPanel}>
        <div className={styles.leftSide}>
          <div className={styles.statBadge}>
            <div>Nivel</div>
            <div>{numberToAbbreviation(hood.level)}</div>
          </div>
          <div className={styles.statBadge}>
            <div>Guardias</div>
            <div>{numberToAbbreviation(hood.guards)}</div>
          </div>
          <div className={styles.statBadge}>
            <div>Beneficio</div>
            <div className={styles.benefitsStatValue}>{benefitElm}</div>
          </div>
        </div>

        <div className={styles.rightSide}>
          <div className={styles.allianceBadgeContainer}>
            <AllianceLink colorScheme="dark" type="bigBadge" alliance={hood.owner} />
          </div>
          {!isMine ? (
            <IncButton
              outerClassName={styles.actionButton}
              disabled={!hood.isAttackable}
              onClick={() => setAttackModalHood(hood)}>
              <Icon iconName="dynamite_monochrome" height={16} width={22} />
            </IncButton>
          ) : (
            <IncButton outerClassName={styles.actionButton} onClick={() => setIsManageHoodModalOpen(hood)}>
              <Icon svg={require('./img/tool.svg')} height={16} width={22} />
            </IncButton>
          )}
        </div>
      </div>

      <div className={styles.bottomPanel}>
        <span>{hood.tier}</span>
        <IncProgressBar
          direction="horizontal"
          progressPercentage={(hood.tier / 5) * 100}
          minSize={22}
          visualSteps={5}
          borderSize={2}
          roundRightSide
        />
      </div>

      {!hood.isAttackable && (
        <div className={styles.shieldOverlay}>
          <div className={styles.shieldOverlayReflections} />
          <div className={styles.shieldOverlayContent}>
            <Icon className={styles.riotShieldIcon} svg={require('./img/riot_shield.svg')} size={60} />
            <div className={styles.shieldBadge}>ESCUDOS ACTIVOS</div>
            <div className={styles.shieldBadgeHangingTimer}>{attackProtectionTimeHours}</div>
            {isMine && (
              <IncButton outerClassName={styles.manageButton} onClick={() => setIsManageHoodModalOpen(hood)}>
                Administrar
              </IncButton>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
