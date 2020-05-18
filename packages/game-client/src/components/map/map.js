import React, { useState, useEffect } from 'react'
import styles from './map.module.scss'
import api from 'lib/api'
import AllianceLink from 'components/alliance/alliance-link'
import MissionModal from 'components/mission-modal'
import { numberToAbbreviation } from 'lib/utils'
import IncContainer from 'components/UI/inc-container'
import IncButton from 'components/UI/inc-button'
import IncProgressBar from 'components/UI/inc-progress-bar'
import ManageHoodModal from './components/manage-hood-modal/manage-hood-modal'
import { userData } from 'lib/user'

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
      <IncContainer>
        <div className={styles.container}>
          {hoods.map(hood => {
            return (
              <div key={hood.id}>
                <div style={{ flexGrow: 1 }} />
                {hood.owner && (
                  <div className={styles.allianceContainer}>
                    <AllianceLink colorScheme="dark" type="shortNameInBraces" alliance={hood.owner} />
                  </div>
                )}
                <div className={styles.lvlContainer}>
                  <div>LVL.</div>
                  <div>{numberToAbbreviation(hood.level)}</div>
                </div>
                <div className={styles.lvlContainer}>
                  <div>Guardias</div>
                  <div>{numberToAbbreviation(hood.guards)}</div>
                </div>
                <div className={styles.attackButtonContainer}>
                  {!hood.owner || !userData.alliance || hood.owner.id !== userData.alliance.id ? (
                    <IncButton disabled={!hood.isAttackable} onClick={() => setAttackModalHood(hood)}>
                      Atacar
                    </IncButton>
                  ) : (
                    <IncButton onClick={() => setIsManageHoodModalOpen(hood)}>Manejar</IncButton>
                  )}
                </div>
                <div className={styles.tierContainer}>
                  <span>{hood.tier}</span>
                  <IncProgressBar
                    direction="horizontal"
                    progressPercentage={(hood.tier / 5) * 100}
                    minSize={20}
                    visualSteps={5}
                    noBackground
                    borderSize={3}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </IncContainer>
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
