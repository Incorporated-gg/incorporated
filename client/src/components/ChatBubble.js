import React, { useState, useEffect, useRef, useCallback } from 'react'
import { API_URL } from '../lib/api'
import { sessionID } from '../lib/user'
import Username from './Username'
import { timestampFromEpoch } from 'shared-lib/commonUtils'
import io from 'socket.io-client'
import './ChatBubble.scss'

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
    client.current = io(API_URL, {
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
            list.messagesArray = Array.prototype.concat(list.messagesArray, messagesArray)
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

  return (
    <aside className="chatBubble">
      {isOpen && (
        <div className={`chatWindow${isFullscreen ? ' fullScreen' : ''}`}>
          <div className="chatWindowHeader">
            <button type="button" onClick={() => setIsSelectingRoom(!isSelectingRoom)}>
              ☰ Salas
            </button>
            <h3 className="chatWindowTitle">Chat ({currentRoom.name})</h3>
            <button type="button" className="fullScreenButton" onClick={() => setIsFullscreen(!isFullscreen)}>
              <span>+</span>
            </button>
            <button type="button" className="closeButton" onClick={() => toggleChat(false)}>
              <span>x</span>
            </button>
          </div>
          <div
            ref={chatWindowBody}
            onScroll={captureChatScroll}
            className={`chatWindowBody${isSelectingRoom ? ' showRoomList' : ''}`}>
            <div className="chatRoomList">
              {chatRoomList.map((chatRoom, i) => (
                <button
                  key={i}
                  type="button"
                  className="chatRoom"
                  onClick={() => chatRoom.name !== currentRoom.name && changeRoom(chatRoom)}>
                  {chatRoom.name} {unreadMessagesForRoom(chatRoom) > 0 && `(${unreadMessagesForRoom(chatRoom)})`}
                </button>
              ))}
            </div>
            <div className="chatMessagesWrapper">
              {messagesList.find(m => m.room === currentRoom.name) &&
                messagesList
                  .find(m => m.room === currentRoom.name)
                  .messagesArray.map((message, i) => (
                    <div key={i} className="chatMessage">
                      <span className="timeStamp">{timestampFromEpoch(message.date)}</span>{' '}
                      <Username user={message.user} />: {message.text}
                    </div>
                  ))}
            </div>
          </div>
          <div className="chatWindowFooter">
            <form onSubmit={sendMessage(currentMessage)}>
              <input
                type="text"
                className="chatTextInput"
                value={currentMessage}
                ref={chatInput}
                onChange={e => setCurrentMessage(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}
      <button type="button" className="chatToggleButton" onClick={() => toggleChat()}>
        <span>chat</span>
      </button>
    </aside>
  )
}
