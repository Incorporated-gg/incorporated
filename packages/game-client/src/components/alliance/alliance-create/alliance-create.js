import React, { useState } from 'react'
import api from 'lib/api'
import PropTypes from 'prop-types'
import { CREATE_ALLIANCE_PRICE, NAMING_REQUIREMENTS } from 'shared-lib/allianceUtils'
import { reloadUserData } from 'lib/user'
import IncInput from 'components/UI/inc-input'
import IncContainer from 'components/UI/inc-container'
import IncButton from 'components/UI/inc-button'
import styles from './alliance-create.module.scss'
import Icon from 'components/icon'

CreateAlliance.propTypes = {
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function CreateAlliance({ reloadAllianceData }) {
  const [longName, setLongName] = useState('')
  const [shortName, setShortName] = useState('')
  const [description, setDescription] = useState('')

  const createAlliance = e => {
    e.preventDefault()
    api
      .post('/v1/alliance/create', {
        long_name: longName,
        short_name: shortName,
        description,
      })
      .then(res => {
        reloadAllianceData()
        reloadUserData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <IncContainer darkBg>
      <div style={{ padding: 10 }}>
        <div className={`${styles.supertitle} ${styles.title}`}>FUNDAR CORPORACIÓN</div>
        <form>
          <div>
            <label>
              <div className={styles.title}>NOMBRE</div>
              <IncInput
                maxLength={NAMING_REQUIREMENTS.long_name.maxChars}
                placeholder={'Corporación Ejemplo'}
                showBorder
                type="text"
                value={longName}
                onChangeText={setLongName}
              />
            </label>
          </div>
          <div>
            <label>
              <div className={styles.title}>INICIALES</div>
              <IncInput
                maxLength={NAMING_REQUIREMENTS.short_name.maxChars}
                showBorder
                placeholder={'CE'}
                type="text"
                value={shortName}
                onChangeText={setShortName}
              />
            </label>
          </div>
          <div>
            <label>
              <div className={styles.title}>DESCRIPCIÓN</div>
              <IncInput
                className={styles.descInput}
                multiline
                showBorder
                placeholder={
                  'Corporación Ejemplo es la mejor corporación en todo Incorporated. No querrás enfrentarte a nosotros'
                }
                value={description}
                onChangeText={setDescription}
              />
            </label>
          </div>
          <div>
            <div className={styles.title}>PRECIO</div>
            {CREATE_ALLIANCE_PRICE.toLocaleString()} <Icon iconName="money" size={20} />
          </div>
          <br />
          <div>
            <IncButton onClick={createAlliance}>Fundar corporación</IncButton>
          </div>
        </form>
      </div>
    </IncContainer>
  )
}
