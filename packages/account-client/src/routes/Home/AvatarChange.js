import React, { useEffect, useState, useCallback } from 'react'
import styles from './style.module.scss'
import api from '../../lib/api'
import { useAccountData, reloadAccountData } from '../../lib/user'

function Play() {
  const [avatarList, setAvatarList] = useState([])
  const accountData = useAccountData()

  const reloadList = useCallback(() => {
    api
      .get('/v1/avatar/list')
      .then(res => {
        setAvatarList(res.avatarList)
      })
      .catch(err => {
        alert(err.message)
      })
  }, [])
  useEffect(() => {
    reloadList()
  }, [reloadList])

  const changeAvatar = useCallback(avatarID => {
    api.post('/v1/avatar/change', { avatarID }).then(res => {
      reloadAccountData()
    })
  }, [])

  return (
    <div>
      <h1>Cambiar avatar</h1>
      <div className={styles.changeAvatarContainer}>
        {avatarList.map(avatar => {
          const isActive = accountData.avatarID === avatar.id
          return (
            <div
              key={avatar.id}
              onClick={() => changeAvatar(avatar.id)}
              className={`${styles.avatar} ${isActive ? styles.active : ''}`}>
              <img src={avatar.url} alt="" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Play
