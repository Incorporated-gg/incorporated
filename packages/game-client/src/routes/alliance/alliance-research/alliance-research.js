import React from 'react'
import PropTypes from 'prop-types'
import styles from './alliance-research.module.scss'
import IncContainer from 'components/UI/inc-container'
import AllianceResearchItem from 'components/alliance/alliance-research-item/alliance-research-item'
import CardList from 'components/card/card-list'

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
      <CardList>
        {Object.values(alliance.researchs).map(researchData => {
          return (
            <AllianceResearchItem
              key={researchData.id}
              researchData={researchData}
              reloadAllianceData={reloadAllianceData}
            />
          )
        })}
      </CardList>
      <br />
      <IncContainer darkBg>
        <div style={{ padding: 10 }}>
          <h2>Aportes</h2>
          <img className={styles.aportesImg} src={chartImgUrl} alt="" />
        </div>
      </IncContainer>
    </>
  )
}
