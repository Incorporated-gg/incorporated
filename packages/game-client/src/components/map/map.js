import React, { useState, useEffect } from 'react'
import styles from './map.module.scss'
import api from 'lib/api'
import MissionModal from 'components/mission-modal'
import ManageHoodModal from './components/manage-hood-modal/manage-hood-modal'
import HoodItem from './components/hood-item/hood-item'

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
          return (
            <HoodItem
              key={hood.id}
              hood={hood}
              setAttackModalHood={setAttackModalHood}
              setIsManageHoodModalOpen={setIsManageHoodModalOpen}
            />
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
