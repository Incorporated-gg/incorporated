import React, { useState } from 'react'
import { CSSTransition } from 'react-transition-group'
import './login.scss'
import PropTypes from 'prop-types'
import api from '../../lib/api'
import { setNewSessionID } from '../../lib/user'
import Container from 'components/UI/container'

export default function LoginRoute() {
  const [active, setActive] = useState('login')

  return (
    <Container outerClassName="login-page" darkBg>
      <div>
        <CSSTransition in={active === 'register'} timeout={200} unmountOnExit classNames="my-node">
          <Register toggleActive={() => setActive('login')} />
        </CSSTransition>
        <CSSTransition in={active === 'login'} timeout={200} unmountOnExit classNames="my-node">
          <Login toggleActive={() => setActive('register')} />
        </CSSTransition>
      </div>
    </Container>
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
      .accountPost('/v1/login', { username, password })
      .then(res => {
        if (!res.sessionID) {
          alert(JSON.stringify(res))
          return
        }
        return setNewSessionID(res.sessionID)
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <form>
      <input
        type="text"
        placeholder={'Nombre de usuario'}
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input type="password" placeholder={'Contraseña'} value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={loginClicked}>Login</button>
      <p>
        No tienes cuenta?{' '}
        <button type="button" onClick={registerClicked}>
          Registrarme
        </button>
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
      .accountPost('/v1/register', { username, password, email })
      .then(res => {
        if (!res.sessionID) {
          alert(JSON.stringify(res))
          return
        }
        return setNewSessionID(res.sessionID)
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <form>
      <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={registerClicked}>Crear cuenta</button>
      <p>
        Ya tienes cuenta?{' '}
        <button type="button" onClick={loginClicked}>
          Conectarme
        </button>
      </p>
    </form>
  )
}
