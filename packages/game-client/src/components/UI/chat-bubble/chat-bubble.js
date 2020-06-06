import React, { useState, useEffect, useRef, useCallback, useContext, useReducer } from 'react'
import api from 'lib/api'
import { sessionID, userData } from 'lib/user'
import ChatBubbleUser from './components/chat-bubble-user'
import io from 'socket.io-client'
import styles from './chat-bubble.module.scss'
import Icon from 'components/icon'
import IncButton from 'components/UI/inc-button'

import ChatContext from '../../../context/chat-context'

export default function ChatBubble() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSelectingRoom, setIsSelectingRoom] = useState(false)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [currentMessage, setCurrentMessage] = useState('')
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0)
  const [newChatUserName, setNewChatUserName] = useState('')

  const chatContext = useContext(ChatContext)

  const client = useRef(null)
  const chatMessagesWrapper = useRef(null)
  const chatInput = useRef(null)

  const [chatRoomList, dispatchChatRoomList] = useReducer((state, action) => {
    switch (action.type) {
      case 'newMessages':
        return state.map(rl => {
          if (rl.id === action.room) {
            const filteredMessages = action.newMessages.filter(message => !rl.messages.find(m => m.id === message.id))
            rl.messages = Array.prototype.concat(rl.messages, filteredMessages)
          }
          return rl
        })
      case 'addChatRooms':
        if (!action.chatRooms.length) return state
        if (!state.length) return action.chatRooms
        let newState = [...state]
        action.chatRooms.forEach(newRoom => {
          const existingRoomIndex = state.findIndex(r => r.id === newRoom.id)
          if (existingRoomIndex > -1) {
            newState[existingRoomIndex] = newRoom
          } else newState.push(newRoom)
        })
        return newState
      case 'removeRoom':
        const updatedState = state.filter(r => r.id !== action.roomName)
        if (currentRoom.id === action.roomName) setCurrentRoom(state[0])
        return updatedState
      case 'markRoomAsRead':
        return state.map(r => {
          if (r.id === action.room.id) {
            r.lastReadMessagesDate = parseInt(Date.now() / 1000)
          }
          return r
        })
      case 'markCurrentRoomAsRead':
        if (!isChatOpen) return state
        if (client.current) client.current.emit('lastRead', currentRoom.id)
        return state.map(r => {
          if (r.id === currentRoom.id) {
            r.lastReadMessagesDate = parseInt(Date.now() / 1000)
          }
          return r
        })
      default:
        console.error('Acción no soportada')
    }
  }, [])

  const sendMessage = message => e => {
    e.preventDefault()
    if (!message) return
    setCurrentMessage('')
    client.current.emit('message', {
      room: currentRoom.id,
      text: message,
    })
  }

  const scrollDown = () => {
    if (!chatMessagesWrapper.current) return
    chatMessagesWrapper.current.scrollTop = chatMessagesWrapper.current.scrollHeight
  }

  /* const captureChatScroll = e => {
    if (e.target.scrollTop === 0 && messagesList.length) {
      client.current.emit('fetchMessages', {
        room: currentRoom.name,
        from: messagesList.find(ml => ml.room === currentRoom.name).messagesArray[0].id,
      })
    }
    return false
  } */

  const createChat = userName => {
    const existingChat = chatRoomList.find(
      chatRoom => chatRoom.type === 'individual' && chatRoom.users.find(u => u.username === userName)
    )
    if (existingChat) return setCurrentRoom(existingChat)
    if (userName.toLowerCase() === userData.username.toLowerCase()) return false
    if (!isChatOpen) toggleChat(true)
    client.current.emit('createChat', userName)
  }

  useEffect(() => {
    if (chatContext.currentChat) {
      createChat(chatContext.currentChat)
      toggleChat(true)
    }
    // eslint-disable-next-line
  }, [chatContext])

  const toggleChat = status => {
    setIsChatOpen(status || !isChatOpen)
    setTimeout(() => scrollDown(), 0)
  }

  const showChatOptions = () => {
    console.log('showing chat options')
  }

  const unreadMessagesForRoom = room => {
    return room.messages.filter(m => {
      return parseInt(m.date) > parseInt(room.lastReadMessagesDate)
    }).length
  }

  const calcTotalUnreadMessages = useCallback(() => {
    const total =
      chatRoomList && chatRoomList.reduce((accumulated, curRoom) => accumulated + unreadMessagesForRoom(curRoom), 0)
    setTotalUnreadMessages(total)
  }, [chatRoomList])

  const markMessagesAsReadForRoom = room => {
    if (!room) return
    dispatchChatRoomList({ type: 'markRoomAsRead', room })
  }

  useEffect(() => calcTotalUnreadMessages(), [calcTotalUnreadMessages])

  useEffect(() => {
    setIsSelectingRoom(false)
    // Update last read messages date
    markMessagesAsReadForRoom(currentRoom)
    // emit read messages for this new room
    if (client.current) client.current.emit('lastRead', currentRoom.id)
    scrollDown()
  }, [currentRoom])

  useEffect(() => {
    client.current = io(api.API_URL, {
      path: '/api/socket.io',
      query: {
        sessionID,
      },
    })
    client.current.on('messages', ({ room, messagesArray: newMessages }) => {
      dispatchChatRoomList({ type: 'newMessages', room, newMessages })
      dispatchChatRoomList({ type: 'markCurrentRoomAsRead' })
      calcTotalUnreadMessages()
      scrollDown()
    })

    client.current.on('chatRoomList', chatRooms => {
      dispatchChatRoomList({ type: 'addChatRooms', chatRooms })
      setCurrentRoom(chatRooms[0])
      calcTotalUnreadMessages()
    })

    client.current.on('chatCreated', chatData => {
      dispatchChatRoomList({ type: 'addChatRooms', chatRooms: [chatData] })
      setCurrentRoom(chatData)
      chatInput.current && chatInput.current.focus()
      calcTotalUnreadMessages()
    })

    client.current.on('leaveRoom', roomName => {
      dispatchChatRoomList({ type: 'removeRoom', roomName })
      calcTotalUnreadMessages()
    })

    /* client.current.on('olderMessages', ({ room, messagesArray }) => {
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
    }) */
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <aside className={`${styles.chatBubble}${isSelectingRoom ? ` ${styles.selectingRoom}` : ''}`}>
        {isChatOpen && (
          <div className={`${styles.chatWindow}${isFullscreen ? ` ${styles.fullScreen}` : ''}`}>
            <aside className={styles.chatWindowSidebar}>
              <div className={styles.chatWindowSidebarHeader}>
                <button type="button" className={styles.chatWindowSidebarClose} onClick={() => toggleChat()}>
                  <Icon
                    width={26}
                    height={16}
                    svg={require('./img/sidebarClose.svg')}
                    alt={`${isSelectingRoom ? 'Ocultar menú' : 'Mostrar menú'}`}
                  />
                </button>
                <button
                  type="button"
                  className={styles.chatWindowSidebarToggle}
                  onClick={() => setIsSelectingRoom(!isSelectingRoom)}>
                  <Icon
                    width={26}
                    height={16}
                    svg={require('./img/sidebarToggle.svg')}
                    alt={`${isSelectingRoom ? 'Ocultar menú' : 'Mostrar menú'}`}
                  />
                </button>
              </div>
              <div className={`${styles.chatWindowSidebarRoomList} ${isSelectingRoom ? styles.sidebarVisible : ''}`}>
                <h3 className={styles.chatRoomCategory}>Canales</h3>
                <div className={styles.chatRoomCategoryList}>
                  {chatRoomList && chatRoomList.filter(room => room.type === 'public').length ? (
                    chatRoomList
                      .filter(room => room.type === 'public')
                      .map((chatRoom, i) => (
                        <button
                          key={i}
                          type="button"
                          className={styles.chatRoomItemButton}
                          onClick={() => chatRoom.name !== currentRoom.name && setCurrentRoom(chatRoom)}>
                          <span className={styles.chatRoomItemButtonName}>{chatRoom.name}</span>
                          {unreadMessagesForRoom(chatRoom) > 0 && (
                            <span className={styles.chatRoomItemButtonUnread}>{unreadMessagesForRoom(chatRoom)}</span>
                          )}
                        </button>
                      ))
                  ) : (
                    <span className={styles.chatRoomItemButtonName}>No tienes canales</span>
                  )}
                </div>
                <h3 className={styles.chatRoomCategory}>Grupos</h3>
                <div className={styles.chatRoomCategoryList}>
                  {chatRoomList &&
                  chatRoomList.filter(room => room.type === 'group' || room.type === 'alliance').length ? (
                    chatRoomList
                      .filter(room => room.type === 'group' || room.type === 'alliance')
                      .map((chatRoom, i) => (
                        <button
                          key={i}
                          type="button"
                          className={styles.chatRoomItemButton}
                          onClick={() => chatRoom.name !== currentRoom.name && setCurrentRoom(chatRoom)}>
                          <span className={styles.chatRoomItemButtonName}>{chatRoom.name}</span>
                          {unreadMessagesForRoom(chatRoom) > 0 && (
                            <span className={styles.chatRoomItemButtonUnread}>{unreadMessagesForRoom(chatRoom)}</span>
                          )}
                        </button>
                      ))
                  ) : (
                    <span className={styles.chatRoomItemButtonName}>No tienes grupos</span>
                  )}
                </div>
                <h3 className={styles.chatRoomCategory}>Convers.</h3>
                <div className={styles.chatRoomCategoryList}>
                  {chatRoomList && chatRoomList.filter(room => room.type === 'individual').length ? (
                    chatRoomList
                      .filter(room => room.type === 'individual')
                      .map((chatRoom, i) => (
                        <button
                          key={i}
                          type="button"
                          className={styles.chatRoomItemButton}
                          onClick={() => chatRoom.name !== currentRoom.name && setCurrentRoom(chatRoom)}>
                          <span className={styles.chatRoomItemButtonName}>
                            {chatRoom.users.length && chatRoom.users.find(u => parseInt(u.id) !== userData.id).username}
                          </span>
                          {unreadMessagesForRoom(chatRoom) > 0 && (
                            <span className={styles.chatRoomItemButtonUnread}>{unreadMessagesForRoom(chatRoom)}</span>
                          )}
                        </button>
                      ))
                  ) : (
                    <span className={styles.chatRoomItemButtonName}>No tienes chats</span>
                  )}
                </div>
                <input type="text" value={newChatUserName} onChange={e => setNewChatUserName(e.target.value)} />
                <button type="button" onClick={() => chatContext.openChatWith(newChatUserName)}>
                  <span>Create chat with</span>
                </button>
                <button
                  type="button"
                  className={styles.fullScreenButton}
                  onClick={() => setIsFullscreen(!isFullscreen)}>
                  <span>{isFullscreen ? '-' : '+'}</span>
                </button>
              </div>
            </aside>
            <div className={`${styles.chatWindowBody}${isSelectingRoom ? ` ${styles.showRoomList}` : ''}`}>
              <header className={styles.chatWindowBodyHeader}>
                <div className={styles.chatWindowBodyHeaderTop}>
                  <h3>
                    {currentRoom && currentRoom.type === 'individual'
                      ? currentRoom.users.find(u => parseInt(u.id) !== userData.id).username
                      : currentRoom && currentRoom.name
                      ? currentRoom.name
                      : 'No hay conversaciones activas'}
                  </h3>
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
                <span className={styles.chatWindowBodyHeaderBottom}>
                  {currentRoom && currentRoom.users.filter(u => u.online).length} usuarios conectados
                </span>
              </header>
              <div className={styles.chatMessagesWrapper} ref={chatMessagesWrapper} /* onScroll={captureChatScroll} */>
                {currentRoom &&
                  currentRoom.messages.map((message, i, thisMessagesArray) => {
                    const isThreadMessage =
                      thisMessagesArray[i - 1] &&
                      thisMessagesArray[i - 1].user.id === message.user.id &&
                      parseInt(message.date - parseInt(thisMessagesArray[i - 1].date)) < 5 * 60
                    return (
                      <div
                        key={i}
                        className={`${styles.chatMessage} ${isThreadMessage ? styles.chatMessageThread : ''}`}>
                        {!isThreadMessage && (
                          <ChatBubbleUser user={message.user} className={styles.chatMessageUserAvatar} />
                        )}
                        <div className={styles.chatMessageContent}>
                          {!isThreadMessage && (
                            <div>
                              <span className={styles.chatMessageUsername}>{message.user.username}</span>
                              <span className={styles.chatMessageTimestamp}>
                                <ChatTimestamp timestamp={message.date} />
                              </span>
                            </div>
                          )}
                          <p className={styles.chatMessageText}>
                            <span>{message.text}</span>
                            <span className={styles.chatMessageHiddenTimestamp}>
                              <ChatTimestamp timestamp={message.date} />
                            </span>
                          </p>
                        </div>
                      </div>
                    )
                  })}
              </div>
              <div className={styles.chatWindowFooter}>
                <form onSubmit={sendMessage(currentMessage)}>
                  <input
                    type="text"
                    className={styles.chatTextInput}
                    disabled={!currentRoom}
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
      <div className={styles.chatToggleButton} onClick={() => toggleChat()}>
        <div>
          {totalUnreadMessages > 0 && <span className={styles.unreadMessagesCount}>{totalUnreadMessages}</span>}
          <Icon size={26} svg={require('./img/chatIcon.svg')} alt={`${isChatOpen ? 'Ocultar chat' : 'Mostrar chat'}`} />
        </div>
      </div>
    </>
  )
}

function ChatTimestamp({ timestamp = parseInt(Date.now() / 1000) }) {
  const chatTS = new Date(timestamp * 1000)
  function pad(number) {
    return number.toString().padStart(2, '0')
  }

  return `${pad(chatTS.getHours())}:${pad(chatTS.getMinutes())}:${pad(chatTS.getSeconds())}`
}
