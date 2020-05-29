import React from 'react'
import styles from './hood-item.module.scss'
import AllianceLink from 'components/alliance/alliance-link'
import { numberToAbbreviation } from 'lib/utils'
import IncButton from 'components/UI/inc-button'
import IncProgressBar from 'components/UI/inc-progress-bar'
import { userData } from 'lib/user'
import Icon from 'components/icon'
import PropTypes from 'prop-types'

const HOOD_ATTACK_PROTECTION_TIME = 60 * 60 * 24

HoodItem.propTypes = {
  hood: PropTypes.object,
  setAttackModalHood: PropTypes.func,
  setIsManageHoodModalOpen: PropTypes.func,
}
export default function HoodItem({ hood, setAttackModalHood, setIsManageHoodModalOpen }) {
  const isMine = hood.owner && userData.alliance && hood.owner.id === userData.alliance.id
  const attackProtectionTimeRemaining = HOOD_ATTACK_PROTECTION_TIME - (Date.now() / 1000 - hood.last_owner_change_at)
  const attackProtectionTimeHours = Math.ceil(attackProtectionTimeRemaining / 60 / 60) + 'H'

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
            <div>{hood.benefit}</div>
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
