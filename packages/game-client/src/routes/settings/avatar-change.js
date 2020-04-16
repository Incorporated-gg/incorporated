import React, { useEffect, useState, useCallback } from 'react'
import styles from './avatar-change.module.scss'
import api from '../../lib/api'
import { useUserData, reloadUserData } from '../../lib/user'
import Container from 'components/UI/container'

export default function AvatarChange() {
  const [avatarList, setAvatarList] = useState([])
  const { accountData } = useUserData()

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
      reloadUserData()
    })
  }, [])

  return (
    <Container darkBg>
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
    </Container>
  )
}
