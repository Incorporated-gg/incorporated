import React, { useState, useEffect } from 'react'
import styles from './map.module.scss'
import api from 'lib/api'
import AllianceLink from 'components/alliance/alliance-link'
import MissionModal from 'components/mission-modal'
import { numberToAbbreviation } from 'lib/utils'
import IncButton from 'components/UI/inc-button'
import IncProgressBar from 'components/UI/inc-progress-bar'
import ManageHoodModal from './components/manage-hood-modal/manage-hood-modal'
import { userData } from 'lib/user'
import Icon from 'components/icon'

const HOOD_ATTACK_PROTECTION_TIME = 60 * 60 * 24

export default function Map() {
  const [hoods, setHoods] = useState()
  const [attackModalHood, setAttackModalHood] = useState(false)
  const [isManageHoodModalOpen, setIsManageHoodModalOpen] = useState(false)

  useEffect(() => {
    api
      .get('/v1/city')
      .then(res => {
        setHoods(res.hoods)
      })
      .catch(err => alert(err.message))
  }, [])

  if (!hoods) return <div style={{ padding: 10 }}>Loading</div>
  return (
    <>
      <div className={styles.container}>
        {hoods.map(hood => {
          const isMine = hood.owner && userData.alliance && hood.owner.id === userData.alliance.id
          const attackProtectionTimeRemaining =
            HOOD_ATTACK_PROTECTION_TIME - (Date.now() / 1000 - hood.last_owner_change_at)
          const attackProtectionTimeHours = Math.ceil(attackProtectionTimeRemaining / 60 / 60) + 'H'

          return (
            <div key={hood.id}>
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
        })}
      </div>
      <MissionModal
        missionType="attack"
        hood={attackModalHood || undefined}
        isOpen={Boolean(attackModalHood)}
        onRequestClose={() => setAttackModalHood(false)}
      />
      <ManageHoodModal
        hood={isManageHoodModalOpen || undefined}
        isOpen={Boolean(isManageHoodModalOpen)}
        onRequestClose={() => setIsManageHoodModalOpen(false)}
      />
    </>
  )
}
