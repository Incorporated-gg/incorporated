import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import React from 'react'
import ReactDOM from 'react-dom'
import * as Sentry from '@sentry/browser'
import Modal from 'react-modal'
import './index.scss'
import 'normalize.css'
import App from './App'
import * as serviceWorker from './serviceWorker'

Sentry.init({ dsn: 'https://a0ebf63b5e1849dc85a4ee4fb698f308@o396353.ingest.sentry.io/5249593' })

Modal.defaultStyles = {}
Modal.defaultProps.closeTimeoutMS = 150
Modal.setAppElement(document.getElementById('root'))
ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
