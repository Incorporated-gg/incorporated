import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useUserData } from 'lib/user'
import Card from 'components/card'
import styles from './alliance-research-item.module.scss'
import { ALLIANCE_RESEARCHS, calcAllianceResourceGeneration, calcAllianceResourceMax } from 'shared-lib/allianceUtils'
import api from 'lib/api'
import IncProgressBar from 'components/UI/inc-progress-bar'
import Icon from 'components/icon'
import IncContainer from 'components/UI/inc-container'
import { numberToAbbreviation } from 'lib/utils'
import IncInput from 'components/UI/inc-input/inc-input'
import IncButton from 'components/UI/inc-button'

const researchImages = {
  2: require('./img/guards.png'),
  3: require('./img/gangsters.png'),
  4: require('./img/thieves.png'),
  5: require('./img/attack-buff.png'),
  6: require('./img/defense-buff.png'),
}

AllianceResearchItem.propTypes = {
  researchData: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceResearchItem({ researchData, reloadAllianceData }) {
  useUserData()

  const researchInfo = ALLIANCE_RESEARCHS[researchData.id]
  const [amount, setAmount] = useState('')

  const doResearch = e => {
    e.preventDefault()
    api
      .post('/v1/alliance/research', { research_id: researchData.id, amount })
      .then(() => {
        reloadAllianceData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  let lvlTxt = `Lvl. ${researchData.level - researchData.bonusLvlsFromHoods}`
  if (researchData.bonusLvlsFromHoods) lvlTxt += ` +${researchData.bonusLvlsFromHoods}`

  return (
    <Card image={researchImages[researchData.id]} title={researchInfo.name} ribbon={lvlTxt}>
      <IncContainer style={{ display: 'flex', alignItems: 'center' }}>
        <div className={styles.price}>{numberToAbbreviation(researchData.price)}</div>
        <IncProgressBar progressPercentage={(researchData.progress_money / researchData.price) * 100}>
          <div>
            {researchData.progress_money.toLocaleString()} <Icon iconName="money" size={20} />
          </div>
        </IncProgressBar>
      </IncContainer>
      {researchInfo.type === 'resource' && (
        <>
          <div className={styles.statTitle}>{researchInfo.resourceGeneratedName} generados al día</div>
          <div className={styles.statContainer}>
            <span>{calcAllianceResourceGeneration(researchData.id, researchData.level).toLocaleString()}</span>
            <Icon iconName="arrows" width={30} height={18} />
            <span>{calcAllianceResourceGeneration(researchData.id, researchData.level + 1).toLocaleString()}</span>
          </div>

          <div className={styles.statTitle}>Capacidad de almacenaje</div>
          <div className={styles.statContainer}>
            <span>{calcAllianceResourceMax(researchData.id, researchData.level).toLocaleString()}</span>
            <Icon iconName="arrows" width={30} height={18} />
            <span>{calcAllianceResourceMax(researchData.id, researchData.level + 1).toLocaleString()}</span>
          </div>
        </>
      )}
      {researchInfo.type === 'buff' && (
        <>
          <div className={styles.statTitle}>Se puede activar durante 1h y tiene un cooldown de 2 días.</div>

          <div className={styles.statTitle}>
            Niveles extra de investigación a todos los miembros de la alianza mientras está activa.
          </div>
          <div className={styles.statContainer}>
            <span>{researchData.level + 1}</span>
            <Icon iconName="arrows" width={30} height={18} />
            <span>{researchData.level + 2}</span>
          </div>
        </>
      )}
      <IncButton onClick={doResearch}>
        <IncInput
          className={styles.input}
          min={1}
          placeholder={0}
          onClick={e => e.stopPropagation()}
          type="number"
          value={amount}
          onChangeText={setAmount}
        />
        <div className={styles.doResearchTitle}>APORTAR</div>
      </IncButton>
    </Card>
  )
}
