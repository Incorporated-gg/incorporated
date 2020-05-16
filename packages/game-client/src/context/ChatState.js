import React, { useReducer } from 'react'
import PropTypes from 'prop-types'

import ChatContext from './chat-context'
import { chatReducer, OPEN_CHAT_WITH } from './reducers'

const ChatState = ({ children }) => {
  const [chatState, dispatch] = useReducer(chatReducer, {
    currentChat: null,
    openChatWith: username => {},
  })

  const openChatWith = username => {
    dispatch({ type: OPEN_CHAT_WITH, username })
  }

  return (
    <ChatContext.Provider
      value={{
        currentChat: chatState.currentChat,
        openChatWith,
      }}>
      {children}
    </ChatContext.Provider>
  )
}
ChatState.propTypes = {
  children: PropTypes.element,
}

export default ChatState
