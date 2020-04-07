import React, { useState } from 'react'
import styles from './login.module.scss'
import api from '../../lib/api'
import { setNewSessionID } from '../../lib/user'

export default function LoginRoute() {
  const [active, setActive] = useState('login')

  return (
    <>
      <img src={require('./img/logo.png')} alt="" className={styles.logo} />
      {active === 'login' && <Login />}
      {active === 'register' && <Register />}
      <div
        className={styles.toggleActiveLink}
        onClick={() => {
          setActive(active === 'login' ? 'register' : 'login')
        }}>
        {active === 'login' && (
          <>
            ¿No tienes cuenta? <b>Registrate</b>
          </>
        )}
        {active === 'register' && (
          <>
            ¿Ya tienes cuenta? <b>Conéctate</b>
          </>
        )}
      </div>
    </>
  )
}

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

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
    <form className={styles.formContainer} onSubmit={loginClicked}>
      <input
        type="text"
        placeholder={'Nombre de usuario'}
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input type="password" placeholder={'Contraseña'} value={password} onChange={e => setPassword(e.target.value)} />
      <div className={styles.buttonText} onClick={loginClicked}>
        INICIAR SESIÓN
      </div>
    </form>
  )
}

function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

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
    <form className={styles.formContainer} onSubmit={registerClicked}>
      <input type="text" placeholder="Nombre de usuario" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <div className={styles.buttonText} onClick={registerClicked}>
        CREAR CUENTA
      </div>
    </form>
  )
}
