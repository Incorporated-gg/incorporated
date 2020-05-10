import React, { useState } from 'react'
import PropTypes from 'prop-types'
import AllianceBadgeCreator from 'components/alliance/alliance-badge-creator'
import IncContainer from 'components/UI/inc-container'
import IncButton from 'components/UI/inc-button'
import styles from './alliance-edit.module.scss'
import api from 'lib/api'
import { reloadUserData } from 'lib/user'
import { useHistory } from 'react-router-dom'
import IncInput from 'components/UI/inc-input/inc-input'

AllianceEdit.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceEdit({ alliance, reloadAllianceData }) {
  const history = useHistory()
  const [badge, setBadge] = useState(alliance.badge)
  const [description, setDescription] = useState(alliance.description)

  const saveChanges = () => {
    history.push('/alliance')

    const promises = []

    if (badge !== alliance.badge) {
      promises.push(
        api.post('/v1/alliance/change_badge', {
          badge,
        })
      )
    }
    if (description !== alliance.description) {
      promises.push(
        api.post('/v1/alliance/change_description', {
          description,
        })
      )
    }

    if (!promises.length) return
    Promise.all(promises)
      .then(() => {
        reloadAllianceData()
        reloadUserData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  const deleteAlliance = () => {
    if (!window.confirm('Estás seguro? Todos los recursos de la alianza se perderán')) return
    api
      .post('/v1/alliance/delete')
      .then(() => {
        reloadAllianceData()
        reloadUserData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <>
      <IncButton outerStyle={{ display: 'block' }} className={styles.saveButton} onClick={saveChanges}>
        GUARDAR
      </IncButton>
      <br />
      <AllianceBadgeCreator badge={badge} setBadge={setBadge} />
      <br />
      <IncContainer darkBg>
        <IncInput
          multiline
          className={styles.descTextarea}
          placeholder={'Descripción de la corporación'}
          value={description}
          onChangeText={setDescription}
        />
      </IncContainer>
      <br />
      <IncButton outerStyle={{ display: 'block' }} className={styles.deleteCorpButton} onClick={deleteAlliance}>
        DISOLVER CORPORACIÓN
      </IncButton>
    </>
  )
}
