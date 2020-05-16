export const OPEN_CHAT_WITH = 'OPEN_CHAT_WITH'

const initialState = {
  currentChat: null,
  openChatWith: username => {},
}

export const chatReducer = (state = initialState, action) => {
  const stateCopy = { ...state }
  if (action.type === OPEN_CHAT_WITH) {
    stateCopy.currentChat = action.username
  }
  return stateCopy
}
