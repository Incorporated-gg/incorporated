import { reloadUserData } from './user'

export function updateTabTitle({ missionTimeLeft, unreadMessages } = {}) {
  let newTitle = 'Incorporated'
  if (missionTimeLeft) newTitle += ` (${missionTimeLeft}) `
  if (unreadMessages) newTitle += ` [${unreadMessages.toLocaleString()}] `
  newTitle += ': Juego de estrategia multijugador online'
  window.document.title = newTitle
}
updateTabTitle()

setInterval(reloadUserData, 5 * 60 * 1000) // Reload user data every 5 minutes, to check unread messages
