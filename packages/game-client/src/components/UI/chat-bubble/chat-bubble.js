import React, { useState, useEffect, useRef, useCallback } from 'react'
import api from 'lib/api'
import { sessionID } from 'lib/user'
import UserLink from '../UserLink'
import { timestampFromEpoch } from 'shared-lib/commonUtils'
import io from 'socket.io-client'
import styles from './chat-bubble.module.scss'
import Icon from 'components/icon'
import IncButton from 'components/UI/inc-button'

export default function ChatBubble() {
  const [chatRoomList, setChatRoomList] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSelectingRoom, setIsSelectingRoom] = useState(false)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [messagesList, setMessagesList] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [lastReadMessageDates, setLastReadMessageDates] = useState([])

  const client = useRef(null)
  const chatWindowBody = useRef(null)
  const chatInput = useRef(null)

  const unreadMessagesForRoom = room => {
    return messagesList.filter(m =>
      m.room === room.name && m.date > lastReadMessageDates.find(lm => lm.room === room.name)
        ? lastReadMessageDates.find(lm => lm.room === room.name).date
        : 0
    ).length
  }

  const changeRoom = useCallback(chatRoom => {
    setCurrentRoom(chatRoom)
    setIsSelectingRoom(false)
    setLastReadMessageDates(records => {
      const existingRecord = records.find(r => r.room === chatRoom.name)
      if (!existingRecord) {
        return Array.prototype.concat(records, [{ room: chatRoom.name, date: Date.now() / 1000 }])
      }
      return records.map(r => {
        if (r.room === chatRoom.name) {
          r.date = Date.now()
        }
        return r
      })
    })
    chatInput.current && chatInput.current.focus()
    setTimeout(() => scrollDown())
  }, [])

  useEffect(() => {
    client.current = io(api.API_URL, {
      path: '/api/socket.io',
      query: {
        sessionID,
      },
    })
    client.current.on('messages', ({ room, messagesArray }) => {
      setMessagesList(originalList => {
        const existingList = originalList.find(list => list.room === room)
        if (!existingList) {
          return Array.prototype.concat(originalList, [{ room, messagesArray }])
        }
        return originalList.map(list => {
          if (list.room === room) {
            const filteredMessages = messagesArray.filter(
              message => !list.messagesArray.find(m => m.id === message.id && m.date < message.date)
            )
            list.messagesArray = Array.prototype.concat(list.messagesArray, filteredMessages)
          }
          return list
        })
      })
      scrollDown()
    })

    client.current.on('chatRoomList', chatRooms => {
      setChatRoomList(chatRooms)
      changeRoom(chatRooms[0])
    })

    client.current.on('olderMessages', ({ room, messagesArray }) => {
      setMessagesList(originalList => {
        const existingList = originalList.find(list => list.room === room)
        if (!existingList) {
          return Array.prototype.concat([{ room, messagesArray }], originalList)
        }
        return originalList.map(list => {
          if (list.room === room) {
            list.messagesArray = Array.prototype.concat(list.messagesArray, messagesArray)
          }
          return list
        })
      })
    })
  }, [changeRoom])

  const sendMessage = message => e => {
    e.preventDefault()
    if (!message) return
    setCurrentMessage('')
    client.current.emit('message', {
      room: currentRoom.name,
      text: message,
    })
  }

  const scrollDown = () => {
    if (!chatWindowBody.current) return
    chatWindowBody.current.scrollTop = chatWindowBody.current.scrollHeight
  }

  const captureChatScroll = e => {
    if (e.target.scrollTop === 0 && messagesList.length) {
      client.current.emit('fetchMessages', {
        room: currentRoom.name,
        from: messagesList.find(ml => ml.room === currentRoom.name).messagesArray[0].id,
      })
    }
    return false
  }

  const toggleChat = status => {
    setIsOpen(status || !isOpen)
    setTimeout(() => {
      chatInput.current && chatInput.current.focus()
      scrollDown()
    }, 0)
  }

  const showChatOptions = () => {
    console.log('showing chat options')
  }

  return (
    <>
      <aside className={styles.chatBubble}>
        {isOpen && (
          <div className={`${styles.chatWindow}${isFullscreen ? ` ${styles.fullScreen}` : ''}`}>
            <aside className={`${styles.chatWindowSidebar}${isSelectingRoom ? ` ${styles.active}` : ''}`}>
              <div className={styles.chatWindowSidebarHeader}>
                {isSelectingRoom && (
                  <button
                    type="button"
                    className={styles.chatWindowSidebarClose}
                    onClick={() => setIsSelectingRoom(!isSelectingRoom)}>
                    <Icon
                      width={26}
                      height={16}
                      svg={require('./img/sidebarClose.svg')}
                      alt={`${isSelectingRoom ? 'Ocultar menú' : 'Mostrar menú'}`}
                    />
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.chatWindowSidebarToggle}${isSelectingRoom ? ` ${styles.active}` : ''}`}
                  onClick={() => setIsSelectingRoom(!isSelectingRoom)}>
                  <Icon
                    width={26}
                    height={16}
                    svg={require('./img/sidebarToggle.svg')}
                    alt={`${isSelectingRoom ? 'Ocultar menú' : 'Mostrar menú'}`}
                  />
                </button>
              </div>
              {isSelectingRoom && (
                <div className={styles.chatWindowSidebarRoomList}>
                  <h3 className={styles.chatRoomCategory}>Canales</h3>
                  <div className={styles.chatRoomCategoryList}>
                    {chatRoomList.map((chatRoom, i) => (
                      <button
                        key={i}
                        type="button"
                        className={styles.chatRoomItemButton}
                        onClick={() => chatRoom.name !== currentRoom.name && changeRoom(chatRoom)}>
                        <span className={styles.chatRoomItemButtonName}>{chatRoom.name}</span>
                        {unreadMessagesForRoom(chatRoom) > 0 && (
                          <span className={styles.chatRoomItemButtonUnread}>{unreadMessagesForRoom(chatRoom)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <h3 className={styles.chatRoomCategory}>Convers.</h3>
                  <button
                    type="button"
                    className={styles.fullScreenButton}
                    onClick={() => setIsFullscreen(!isFullscreen)}>
                    <span>{isFullscreen ? '-' : '+'}</span>
                  </button>
                </div>
              )}
            </aside>
            <div
              ref={chatWindowBody}
              // onScroll={captureChatScroll}
              className={`${styles.chatWindowBody}${isSelectingRoom ? ` ${styles.showRoomList}` : ''}`}>
              <header className={styles.chatWindowBodyHeader}>
                <div className={styles.chatWindowBodyHeaderTop}>
                  <h3>{currentRoom && currentRoom.name}</h3>
                  <button type="button" className={styles.chatOptionsButton} onClick={() => showChatOptions()}>
                    <Icon
                      width={26}
                      height={16}
                      svg={require('./img/chatOptions.svg')}
                      alt="Opciones"
                      title="Opciones"
                    />
                  </button>
                </div>
                <span className={styles.chatWindowBodyHeaderBottom}>Yo, topotamadre y topotopadre</span>
              </header>
              <div className={styles.chatMessagesWrapper}>
                {messagesList.find(m => m.room === currentRoom.name) &&
                  messagesList
                    .find(m => m.room === currentRoom.name)
                    .messagesArray.map((message, i) => (
                      <div key={i} className={styles.chatMessage}>
                        <span className={styles.timeStamp}>{timestampFromEpoch(message.date)}</span>{' '}
                        <UserLink user={message.user} />: {message.text}
                      </div>
                    ))}
              </div>
              <div className={styles.chatWindowFooter}>
                <form onSubmit={sendMessage(currentMessage)}>
                  <input
                    type="text"
                    className={styles.chatTextInput}
                    value={currentMessage}
                    ref={chatInput}
                    placeholder="Redactar mensaje"
                    onChange={e => setCurrentMessage(e.target.value)}
                  />
                  <IncButton outerClassName={styles.chatTextSubmit} onClick={sendMessage(currentMessage)}>
                    Enviar
                  </IncButton>
                </form>
              </div>
            </div>
          </div>
        )}
      </aside>
      <div type="button" className={styles.chatToggleButton} onClick={() => toggleChat()}>
        <div>Chat</div>
      </div>
    </>
  )
}
