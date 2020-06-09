import React, { useState } from 'react'
import styles from './login.module.scss'
import api from '../../lib/api'
import { setNewSessionID } from '../../lib/user'
import IncInput from 'components/UI/inc-input/inc-input'
import { Link } from 'react-router-dom'

const ACCOUNT_NAMING_REQUIREMENTS = {
  minLength: 4,
  maxLength: 16,
  regExp: /^[a-z0-9 _-]+$/i,
}

export default function LoginRoute() {
  const [active, setActive] = useState('login')

  return (
    <>
      <img src={require('./img/logo.png')} alt="" className={styles.logo} />
      {active === 'login' && <Login />}
      {active === 'register' && <Register />}
      <div
        tabIndex={0}
        className={styles.toggleActiveLink}
        onClick={() => {
          setActive(active === 'login' ? 'register' : 'login')
        }}
        onKeyPress={e => {
          if (e.key !== 'Enter' && e.key !== ' ') return
          setActive(active === 'login' ? 'register' : 'login')
        }}>
        {active === 'login' && (
          <>
            ¿No tienes cuenta? <b>Regístrate</b>
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
      <IncInput
        maxLength={ACCOUNT_NAMING_REQUIREMENTS.maxLength}
        type="text"
        placeholder={'Nombre de usuario'}
        value={username}
        onChangeText={setUsername}
      />
      <br />
      <br />
      <IncInput type="password" placeholder={'Contraseña'} value={password} onChangeText={setPassword} />
      <br />
      <br />
      <div className={styles.buttonText} onClick={loginClicked}>
        INICIAR SESIÓN
      </div>
      <button type="submit" style={{ display: 'none' }}></button>
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
      <IncInput
        maxLength={ACCOUNT_NAMING_REQUIREMENTS.maxLength}
        type="text"
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
      />
      <br />
      <br />
      <IncInput type="password" placeholder="Contraseña" value={password} onChangeText={setPassword} />
      <br />
      <br />
      <IncInput type="email" placeholder="Email" value={email} onChangeText={setEmail} />
      <div className={styles.subtitle}>
        Sólo usaremos tu correo para recuperar verificar tu identidad, y recuperar tu contraseña
      </div>
      <br />
      <div className={styles.buttonText} onClick={registerClicked}>
        CREAR CUENTA
      </div>
      <div className={styles.subtitle}>
        Al crear una cuenta en Incorporated, aceptas nuestros <Link to="/terms">Términos y Condiciones</Link>
      </div>
      <button type="submit" style={{ display: 'none' }}></button>
    </form>
  )
}
