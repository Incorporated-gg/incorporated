import React from 'react'
import PropTypes from 'prop-types'
import styles from './alliance-research.module.scss'
import IncContainer from 'components/UI/inc-container'
import AllianceResearchItem from 'components/alliance/alliance-research-item/alliance-research-item'
import CardList from 'components/card/card-list'
import UserLink from 'components/UI/user-link'
import { ALLIANCE_RESEARCHS } from 'shared-lib/allianceUtils'
import Icon from 'components/icon'
import { Pie } from 'react-chartjs-2'
import { numberToAbbreviation } from 'lib/utils'

AllianceResearch.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceResearch({ alliance, reloadAllianceData }) {
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
          <AllianceResearchLogChart researchShares={alliance.research_shares} />
        </div>
      </IncContainer>
      <br />
      <IncContainer darkBg>
        <div style={{ padding: 10 }}>
          <h2>Historial de aportes</h2>
          {alliance.research_log.map(logEntry => {
            const researchInfo = ALLIANCE_RESEARCHS[logEntry.research_id]
            const researchName = researchInfo?.name || '???'
            return (
              <div key={Math.random()} className={styles.researchLogItem}>
                <UserLink user={logEntry.user} /> aportó {Math.abs(logEntry.money).toLocaleString()}{' '}
                <Icon iconName="money" size={18} /> a {researchName}
              </div>
            )
          })}
        </div>
      </IncContainer>
    </>
  )
}

AllianceResearchLogChart.propTypes = {
  researchShares: PropTypes.array.isRequired,
}
function AllianceResearchLogChart({ researchShares }) {
  researchShares.push({ total: 9123, user: { username: 'hola' } })
  researchShares.push({ total: 91223, user: { username: 'erfgrg' } })
  researchShares.push({ total: 914423, user: { username: 'ghgh' } })
  researchShares.push({ total: 923, user: { username: 'ertgg' } })
  researchShares.push({ total: 93, user: { username: 'bfdgfgbd' } })
  researchShares.push({ total: 3, user: { username: 'ergrge' } })
  researchShares.push({ total: 36532, user: { username: 'egrger' } })
  const shares = researchShares.sort((a, b) => a.total - b.total)
  const chartColors = ['#ca981b', '#e4b135', '#eac362', '#f0d48f']
  const extraColors = new Array(Math.max(0, shares.length - chartColors.length)).fill('#ca981b')
  chartColors.unshift(...extraColors)
  const chartData = {
    labels: shares.map(sh => sh.user.username),
    datasets: [
      {
        data: shares.map(sh => sh.total),
        backgroundColor: chartColors,
      },
    ],
  }

  return (
    <Pie
      data={chartData}
      options={{
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              const username = data.labels[tooltipItem.index]
              const value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
              return `${username}: ${value.toLocaleString()}`
            },
          },
        },
        legend: false,
        plugins: {
          datalabels: {
            textAlign: 'center',
            formatter: function(value, context) {
              const username = context.chart.data.labels[context.dataIndex]
              return `${username}\n${numberToAbbreviation(value)}`
            },
          },
        },
      }}
    />
  )
}
