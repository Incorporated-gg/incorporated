import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useUserData } from 'lib/user'
import Card from 'components/card'
import styles from './alliance-research-item.module.scss'
import {
  RESEARCHS_LIST,
  calcResourceGenerationByResearchID,
  calcResourceMaxByResearchID,
} from 'shared-lib/allianceUtils'
import api from 'lib/api'
import ProgressBar from 'components/UI/progress-bar'
import Icon from 'components/icon'
import Container from 'components/UI/container'
import { numberToAbbreviation } from 'lib/utils'

const researchImages = {
  1: require('./img/attack-buff.png'),
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

  const researchInfo = RESEARCHS_LIST.find(r => r.id === researchData.id)
  const [amount, setAmount] = useState(0)

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

  return (
    <Card image={researchImages[researchData.id]} title={researchInfo.name} ribbon={`Lvl. ${researchData.level}`}>
      <Container style={{ display: 'flex', alignItems: 'center' }}>
        <div className={styles.price}>{numberToAbbreviation(researchData.price)}</div>
        <ProgressBar>
          <div>
            {researchData.progress_money.toLocaleString()} <Icon iconName="money" size={20} />
          </div>
        </ProgressBar>
      </Container>
      {researchInfo.type === 'resource' && (
        <>
          <p>
            Genera {calcResourceGenerationByResearchID(researchData.id, researchData.level).toLocaleString()} al día, al
            mejorarla generará{' '}
            {calcResourceGenerationByResearchID(researchData.id, researchData.level + 1).toLocaleString()} al día
          </p>
          <p>
            Almacena {calcResourceMaxByResearchID(researchData.id, researchData.level).toLocaleString()}, al mejorarla
            almacenará {calcResourceMaxByResearchID(researchData.id, researchData.level + 1).toLocaleString()}
          </p>
        </>
      )}
      {researchInfo.type === 'buff' && (
        <>
          <p>
            Da {researchData.level + 1} niveles de investigación a todos los miembros de la alianza mientras está
            activa.
          </p>
          <p>Se puede activar durante 1h y tiene un cooldown de 2 días.</p>
        </>
      )}
      <Container>
        <form>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />{' '}
          <button onClick={doResearch}>Aportar</button>
        </form>
      </Container>
    </Card>
  )
}
