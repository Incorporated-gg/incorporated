import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import IncContainer from 'components/UI/inc-container'
import { userData, updateUserData } from 'lib/user'
import IncButton from 'components/UI/inc-button'
import IncChevron from 'components/UI/inc-chevron'
import Icon from 'components/icon'
import { numberToAbbreviation } from 'lib/utils'
import IncInput from 'components/UI/inc-input/inc-input'
import IncProgressBar from 'components/UI/inc-progress-bar'
import { calcHoodUpgradePrice, calcHoodMaxGuards, calcHoodDailyServerPoints } from 'shared-lib/hoodUtils'
import api from 'lib/api'
import styles from './manage-hood-modal.module.scss'

ManageHoodModal.propTypes = {
  hood: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function ManageHoodModal({ hood, isOpen, onRequestClose }) {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      {isOpen && <ManageHood hood={hood} onRequestClose={onRequestClose} />}
    </Modal>
  )
}

ManageHood.propTypes = {
  hood: PropTypes.object.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
function ManageHood({ hood, onRequestClose }) {
  const [, _rerender] = useState({})
  const [guards, setGuards] = useState('')
  const upgradePrice = calcHoodUpgradePrice(hood.level)
  const maxGuards = calcHoodMaxGuards(hood.level)
  const upgradeHood = () => {
    hood.level++
    updateUserData({ money: userData.money - upgradePrice })
    _rerender({})

    api
      .post('/v1/city/hood_upgrade', {
        hood_id: hood.id,
      })
      .catch(err => {
        alert(err.message)
        hood.level--
        _rerender({})
      })
  }
  const addGuards = () => {
    const guardsToAdd = parseInt(guards)
    if (!guardsToAdd) return

    hood.guards += guardsToAdd
    _rerender({})

    api
      .post('/v1/city/hood_add_guards', {
        hood_id: hood.id,
        guards: guardsToAdd,
      })
      .catch(err => {
        alert(err.message)
        hood.guards -= guardsToAdd
        _rerender({})
      })
  }

  return (
    <IncContainer withHairline darkBg>
      <div style={{ padding: 10 }}>
        <div>
          <span className={styles.title}>ADMINISTRAR BARRIO</span>
          <span className={styles.subtitle}>(+{calcHoodDailyServerPoints(hood.tier)} Reputación Diaria)</span>
        </div>

        <IncContainer className={styles.guardsResource}>
          <div>{maxGuards.toLocaleString()}</div>
          <IncProgressBar direction="horizontal" progressPercentage={(hood.guards / maxGuards) * 100}>
            <div>
              {Math.floor(hood.guards).toLocaleString()} <Icon iconName="guard" size={20} />
            </div>
          </IncProgressBar>
        </IncContainer>

        <IncButton outerClassName={styles.button} disabled={upgradePrice > userData.money} onClick={addGuards}>
          <IncInput
            style={{ width: '100%' }}
            onClick={e => e.stopPropagation()}
            placeholder={`Tienes ${numberToAbbreviation(userData.personnel.guards)}`}
            type="number"
            value={guards}
            onChangeText={setGuards}
            min={1}
            max={userData.personnel.guards}
          />
          <div className={styles.buttonTitle}>INGRESAR</div>
        </IncButton>

        <IncButton outerClassName={styles.button} disabled={upgradePrice > userData.money} onClick={upgradeHood}>
          <div className={styles.levelCost}>
            <IncChevron direction="right" padding={14} />
            <span>
              {numberToAbbreviation(upgradePrice)} <Icon iconName="money" size={20} />
            </span>
            <IncChevron direction="left" padding={14} />
          </div>
          <div className={styles.buttonTitle}>SUBIR A NIVEL {hood.level + 1}</div>
        </IncButton>
      </div>
    </IncContainer>
  )
}
