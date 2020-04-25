import { getUserData, getUserIDFromUsername } from '../lib/db/users'
import { getUserIDFromSessionID } from '../lib/db/sessions'
import { promisify } from 'util'
import redis from 'redis'
import ChatUser from './ChatUser'
import Conversation from './Conversation'

const client = redis.createClient(
  `redis://root:${process.env.REDIS_PASS}@${process.env.NODE_ENV === 'development' ? 'redis' : 'localhost'}:6379`
)
const hGetAsync = promisify(client.hget).bind(client)

const publicChannels = [
  {
    id: 1,
    type: 'public',
    name: 'Global',
    messages: [],
    users: [],
    readonly: false,
  },
  {
    id: 2,
    type: 'public',
    name: 'Dudas y Ayuda',
    messages: [],
    users: [],
    readonly: false,
  },
  {
    id: 3,
    type: 'public',
    name: 'Estrategia',
    messages: [],
    users: [],
    readonly: false,
  },
  {
    id: 4,
    type: 'public',
    name: 'Off-Topic',
    messages: [],
    users: [],
    readonly: false,
  },
  {
    id: 5,
    type: 'group',
    name: 'Corporación',
    messages: [],
    users: [],
    readonly: false,
  },
]

const chat = {
  async getGroup(groupName) {
    return await hGetAsync('groups', groupName)
  },
  async getUser(userId) {
    const user = new ChatUser(userId)
    await user.init()
    return user
  },
}

export const setupChat = io => {
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
    .on('connection', async socket => {
      console.log(socket.user.id + ' connected')
      const userRoomNames = await hGetAsync(`users:${socket.user.id}`, 'conversations')
      const privateRooms =
        userRoomNames &&
        userRoomNames.map(async roomName => {
          return await hGetAsync('conver', roomName)
        })
      privateRooms &&
        privateRooms.forEach(privateRoom => {
          socket.join(privateRoom.name)
          socket.emit('messages', {
            room: privateRoom.name,
            messagesArray: privateRoom.messages.slice(
              Math.max(privateRoom.messages.length - 25, 0),
              privateRoom.messages.length
            ),
          })
        })
      publicChannels.forEach(room => {
        socket.join(room.name)
        socket.emit('messages', {
          room: room.name,
          messagesArray: room.messages.slice(Math.max(room.messages.length - 25, 0), room.messages.length),
        })
      })

      socket.emit('chatRoomList', publicChannels)

      socket.on('message', async ({ room: conversationId, text }) => {
        const thisRoom = new Conversation({
          id: conversationId,
        })
        await thisRoom.init()
        if (!thisRoom) return

        const timestamp = Date.now() / 1000
        const newMessage = {
          id: thisRoom.messages.length,
          user: socket.user,
          date: timestamp,
          text,
        }
        await thisRoom.addMessage(newMessage)
        apiNamespace.to(conversationId).emit('messages', {
          room: conversationId,
          messagesArray: [newMessage],
        })
      })

      /* socket.on('fetchMessages', ({ from, room }) => {
        const thisRoom = publicChannels.find(ch => ch.name === room)
        const previousMessages = thisRoom.messages.filter(m => m.id < from)
        if (!previousMessages) return

        socket.emit('olderMessages', {
          room: thisRoom.name,
          messagesArray: previousMessages.slice(Math.max(previousMessages.length - 25, 0), previousMessages.length),
        })
      }) */

      socket.on('disconnect', () => {
        console.log(socket.user.id + ' disconnected')
      })

      socket.on('createChat', async withUserName => {
        const userId = await getUserIDFromUsername(withUserName)
        if (!userId) return
        const withUser = await getUserData(userId)
        const newConv = new Conversation({
          name: withUser.username,
          userIds: [socket.user.id, withUser.id],
          type: 'individual',
        })
        await newConv.init()
        const jsonConversation = await newConv.toJSON()
        socket.join(newConv.id)
        socket.emit('chatCreated', jsonConversation)
      })

      /* setInterval(() => {
        console.log('do action every 10s')
      }, 10 * 1000) */
    })
}
