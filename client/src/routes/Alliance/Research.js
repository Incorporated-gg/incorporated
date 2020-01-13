import React, { useState } from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'
import styles from './Research.module.scss'
import {
  RESEARCHS_LIST,
  calcResourceGenerationByResearchID,
  calcResourceMaxByResearchID,
} from 'shared-lib/allianceUtils'

AllianceResearch.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceResearch({ alliance, reloadAllianceData }) {
  const chartData = {
    type: 'pie',
    data: {
      labels: alliance.research_shares.map(sh => sh.user.username),
      datasets: [{ data: alliance.research_shares.map(sh => sh.total) }],
    },
  }
  const chartImgUrl = `https://quickchart.io/chart?width=500&height=500&c=${JSON.stringify(chartData)}`

  return (
    <>
      <div>
        <h2>Research</h2>
        {Object.values(alliance.researchs).map(researchData => {
          return (
            <SingleResearch key={researchData.id} researchData={researchData} reloadAllianceData={reloadAllianceData} />
          )
        })}
      </div>
      <br />
      <div>
        <h2>Aportes</h2>
        <img className={styles.aportesImg} src={chartImgUrl} alt="" />
      </div>
    </>
  )
}

SingleResearch.propTypes = {
  researchData: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
function SingleResearch({ researchData, reloadAllianceData }) {
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
    <div>
      <p>
        {researchInfo.name} <b>(Lvl {researchData.level})</b>
      </p>
      <p>
        {researchData.progress_money.toLocaleString()}€ / {researchData.price.toLocaleString()}€
      </p>
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
      <form>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <button onClick={doResearch}>Aportar</button>
      </form>

      <hr />
    </div>
  )
}
