import React from 'react'
import { Switch, Route } from 'react-router-dom'

import styles from '../style.module.scss'
import Login from '../../routes/login/login'
import TermsOfService from 'routes/legal/terms-of-service'

export default function LoginRouter() {
  return (
    <div className={`${styles.pageContainer} ${styles.login}`}>
      <div className={styles.contentContainer}>
        <Switch>
          <Route path="/terms">
            <TermsOfService />
          </Route>
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </div>
    </div>
  )
}
