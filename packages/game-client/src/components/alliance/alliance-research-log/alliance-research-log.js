import React from 'react'
import PropTypes from 'prop-types'
import styles from './alliance-research-log.module.scss'
import IncContainer from 'components/UI/inc-container'
import UserLink from 'components/UI/user-link'
import { ALLIANCE_RESEARCHS } from 'shared-lib/allianceUtils'
import Icon from 'components/icon'
import { Pie } from 'react-chartjs-2'
import { numberToAbbreviation, getServerTimeString } from 'lib/utils'

AllianceResearchLog.propTypes = {
  alliance: PropTypes.object.isRequired,
}
export default function AllianceResearchLog({ alliance }) {
  return (
    <>
      <IncContainer darkBg>
        <div style={{ padding: 10 }}>
          <h2 className={styles.title}>APORTES</h2>
          <AllianceResearchLogChart researchShares={alliance.research_shares} />
        </div>
      </IncContainer>
      <br />
      <IncContainer darkBg>
        <div style={{ padding: 10 }}>
          <h2 className={styles.title}>HISTORIAL DE APORTES</h2>
          <div className={styles.itemsContainer}>
            {alliance.research_log.map(logEntry => {
              const researchInfo = ALLIANCE_RESEARCHS[logEntry.research_id]
              const researchName = researchInfo?.name || '???'
              return (
                <React.Fragment key={Math.random()}>
                  <span>{getServerTimeString(logEntry.created_at)}</span>
                  <div>
                    <UserLink user={logEntry.user} />
                  </div>
                  <span>
                    Aportó {Math.abs(logEntry.money).toLocaleString()} <Icon iconName="money" size={18} /> a{' '}
                    {researchName}
                  </span>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </IncContainer>
    </>
  )
}

AllianceResearchLogChart.propTypes = {
  researchShares: PropTypes.array.isRequired,
}
function AllianceResearchLogChart({ researchShares }) {
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
