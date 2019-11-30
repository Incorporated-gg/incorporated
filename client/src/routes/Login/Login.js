import React, { useState } from 'react'
import { CSSTransition } from 'react-transition-group'
import './Login.scss'
import PropTypes from 'prop-types'
import api from '../../lib/api'
import { userLoggedIn } from '../../lib/user'

export default function LoginRoute() {
  const [active, setActive] = useState('login')

  return (
    <div className="login-page">
      <div className="form">
        <CSSTransition in={active === 'register'} timeout={200} unmountOnExit classNames="my-node">
          <Register toggleActive={() => setActive('login')} />
        </CSSTransition>
        <CSSTransition in={active === 'login'} timeout={200} unmountOnExit classNames="my-node">
          <Login toggleActive={() => setActive('register')} />
        </CSSTransition>
      </div>
    </div>
  )
}

Login.propTypes = {
  toggleActive: PropTypes.func.isRequired,
}
function Login({ toggleActive }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function registerClicked(e) {
    e.preventDefault()
    toggleActive()
  }

  function loginClicked(e) {
    e.preventDefault()
    api
      .post('/v1/login', { username, password })
      .then(res => {
        return userLoggedIn(res.session_id)
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <form className="login-form">
      <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={loginClicked}>login</button>
      <p className="message">
        No tienes cuenta?{' '}
        <a href="#" onClick={registerClicked}>
          Registrarme
        </a>
      </p>
    </form>
  )
}

Register.propTypes = {
  toggleActive: PropTypes.func.isRequired,
}
function Register({ toggleActive }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  function loginClicked(e) {
    e.preventDefault()
    toggleActive()
  }

  function registerClicked(e) {
    e.preventDefault()
    api
      .post('/v1/register', { username, password, email })
      .then(res => {
        return userLoggedIn(res.session_id)
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <form className="register-form">
      <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={registerClicked}>Crear</button>
      <p className="message">
        Ya tienes cuenta?{' '}
        <a href="#" onClick={loginClicked}>
          Conectarme
        </a>
      </p>
    </form>
  )
}
