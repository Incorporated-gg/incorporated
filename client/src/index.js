import React from 'react'
import ReactDOM from 'react-dom'
import Modal from 'react-modal'
import './index.scss'
import 'normalize.css'
import App from './App'
import * as serviceWorker from './serviceWorker'

Modal.defaultStyles = {}
Modal.setAppElement(document.getElementById('root'))
ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
