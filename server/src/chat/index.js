const users = require('../lib/db/users')
const sessions = require('../lib/db/sessions')

module.exports.setupChat = io => {
  const chatrooms = [
    {
      name: 'all',
      messages: [],
    },
    {
      name: 'corp',
      messages: [],
    },
    {
      name: 'gaymers',
      messages: [],
    },
  ]

  const apiNamespace = io.of('/api')
  apiNamespace
    .use(async (socket, next) => {
      if (socket.handshake.query && socket.handshake.query.sessionID) {
        const sessionID = socket.handshake.query.sessionID
        if (!sessionID) return next(new Error('Session not provided'))

        const userID = await sessions.getUserIDFromSessionID(sessionID)
        if (!userID) return next(new Error('User session not found'))

        const user = await users.getData(userID)
        socket.user = user
        next()
      } else {
        next(new Error('Authentication error'))
      }
    })
    .on('connection', socket => {
      chatrooms.forEach(room => {
        socket.join(room.name)
        socket.emit('messages', {
          room: room.name,
          messagesArray: room.messages.slice(Math.max(room.messages.length - 25, 0), room.messages.length),
        })
      })

      socket.emit('chatRoomList', chatrooms)

      socket.on('message', ({ room, text }) => {
        console.log('got this messg: ' + text + ' from user ' + socket.user.username + '. for room: ' + room)
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
        console.log(
          'user wants 10 more messages older than id ' + from + ', we got this many: ' + previousMessages.length
        )
        if (!previousMessages) return

        socket.emit('olderMessages', {
          room: thisRoom.name,
          messagesArray: previousMessages.slice(Math.max(previousMessages.length - 25, 0), previousMessages.length),
        })
      })
    })
}
