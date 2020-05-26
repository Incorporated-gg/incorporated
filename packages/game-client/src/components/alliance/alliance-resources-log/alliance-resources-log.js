import React from 'react'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import PropTypes from 'prop-types'
import IncContainer from 'components/UI/inc-container'
import UserLink from 'components/UI/user-link'
import styles from './alliance-resources-log.module.scss'
import { getServerTimeString } from 'lib/utils'

AllianceResourcesLog.propTypes = {
  resourcesLog: PropTypes.array.isRequired,
}
export default function AllianceResourcesLog({ resourcesLog }) {
  return (
    <IncContainer darkBg>
      <div style={{ padding: 10 }}>
        <h2 className={styles.title}>HISTORIAL DE RECURSOS</h2>
        <div className={styles.itemsContainer}>
          {resourcesLog.map(logEntry => {
            const resourceInfo = PERSONNEL_OBJ[logEntry.resource_id]
            const resourceName = resourceInfo?.name || '???'

            return (
              <React.Fragment key={Math.random()}>
                <span>{getServerTimeString(logEntry.created_at)}</span>
                <div>
                  <UserLink user={logEntry.user} />
                </div>
                <span>
                  {logEntry.type === 'deposit'
                    ? 'Deposita'
                    : logEntry.type === 'extract'
                    ? 'Extrae'
                    : logEntry.type === 'replenish'
                    ? 'Es protegido con'
                    : '???'}{' '}
                  {logEntry.quantity.toLocaleString()} {resourceName}
                </span>
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </IncContainer>
  )
}
