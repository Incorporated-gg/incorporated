import React, { useEffect, useState, useCallback } from 'react'
import styles from './avatar-change.module.scss'
import api from '../../lib/api'
import { useUserData, reloadUserData } from '../../lib/user'
import IncContainer from 'components/UI/inc-container'

export default function AvatarChange() {
  const [avatarList, setAvatarList] = useState([])
  const userData = useUserData()

  const reloadList = useCallback(() => {
    api
      .accountGet('/v1/avatar/list')
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
    api.accountPost('/v1/avatar/change', { avatarID }).then(res => {
      setTimeout(reloadUserData, 1000) // Wait for cache from client-server
    })
  }, [])

  return (
    <IncContainer darkBg>
      <div className={styles.container}>
        <h1>Cambiar avatar</h1>
        <div className={styles.changeAvatarContainer}>
          {avatarList.map(avatar => {
            const isActive = userData.account.avatarID === avatar.id
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
    </IncContainer>
  )
}
