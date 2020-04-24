import { getUserData } from '../lib/db/users'
import { getUserIDFromSessionID } from '../lib/db/sessions'
let connectedUsers = 0

export const setupChat = io => {
  const chatrooms = [
    {
      name: 'Global',
      messages: [],
    },
    {
      name: 'Corporación',
      messages: [],
    },
    {
      name: 'Dudas y Ayuda',
      messages: [],
    },
    {
      name: 'Estrategia',
      messages: [],
    },
    {
      name: 'Off-Topic',
      messages: [],
    },
  ]

  const apiNamespace = io.of('/api')
  apiNamespace
    .use(async (socket, next) => {
      if (socket.handshake.query && socket.handshake.query.sessionID) {
        const sessionID = socket.handshake.query.sessionID
        if (!sessionID) return next(new Error('Session not provided'))

        const userID = await getUserIDFromSessionID(sessionID)
        if (!userID) return next(new Error('User session not found'))

        const user = await getUserData(userID)
        socket.user = user
        next()
      } else {
        next(new Error('Authentication error'))
      }
    })
    .on('connection', socket => {
      connectedUsers++
      chatrooms.forEach(room => {
        socket.join(room.name)
        socket.emit('connectedUsers', connectedUsers)
        socket.emit('messages', {
          room: room.name,
          messagesArray: room.messages.slice(Math.max(room.messages.length - 25, 0), room.messages.length),
        })
      })

      socket.emit('chatRoomList', chatrooms)

      socket.on('message', ({ room, text }) => {
        const thisRoom = chatrooms.find(ch => ch.name === room)
        if (!thisRoom) return

        const timestamp = Date.now() / 1000
        const newMessage = {
          id: thisRoom.messages.length,
          user: socket.user,
          date: timestamp,
          text,
        }
        thisRoom.messages.push(newMessage)
        apiNamespace.to(room).emit('messages', {
          room,
          messagesArray: [newMessage],
        })
      })

      socket.on('fetchMessages', ({ from, room }) => {
        const thisRoom = chatrooms.find(ch => ch.name === room)
        const previousMessages = thisRoom.messages.filter(m => m.id < from)
        if (!previousMessages) return

        socket.emit('olderMessages', {
          room: thisRoom.name,
          messagesArray: previousMessages.slice(Math.max(previousMessages.length - 25, 0), previousMessages.length),
        })
      })

      socket.on('disconnect', () => {
        connectedUsers--
      })

      setInterval(() => {
        apiNamespace.emit('connectedUsers', connectedUsers)
      }, 10 * 1000)
    })
}
