import { getUserData, getUserIDFromUsername } from '../lib/db/users'
import { getUserIDFromSessionID } from '../lib/db/sessions'
/* import { promisify } from 'util' */
/* import redis from 'redis' */
import ChatUser from './ChatUser'
import Conversation from './Conversation'

/* const client = redis.createClient(
  `redis://root:${process.env.REDIS_PASS}@${process.env.NODE_ENV === 'development' ? 'redis' : 'localhost'}:6379`
) */
/* const hGetAsync = promisify(client.hget).bind(client) */

const publicChannels = [
  {
    id: 'globalRoom',
    type: 'public',
    name: 'Global',
    messages: [],
    users: [],
    readonly: false,
  },
  {
    id: 'dudasAyuda',
    type: 'public',
    name: 'Dudas y Ayuda',
    messages: [],
    users: [],
    readonly: false,
  },
  {
    id: 'estrategia',
    type: 'public',
    name: 'Estrategia',
    messages: [],
    users: [],
    readonly: false,
  },
  {
    id: 'offTopic',
    type: 'public',
    name: 'Off-Topic',
    messages: [],
    users: [],
    readonly: false,
  },
  /* NOT IMPLEMENTED YET   {
    id: 'corp',
    type: 'group',
    name: 'Corporación',
    messages: [],
    users: [],
    readonly: false,
  }, */
]

/* const chat = {
  async getGroup(groupName) {
    return await hGetAsync('groups', groupName)
  },
  async getUser(userId) {
    const user = new ChatUser(userId)
    await user.init()
    return user
  },
} */

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
      const publicRooms = await Promise.all(
        publicChannels.map(async publicChannel => {
          const conv = new Conversation(publicChannel)
          await conv.init()
          const jsonConv = await conv.toJSON()
          socket.join(conv.id)
          socket.emit('messages', {
            room: conv.id,
            messagesArray: conv.messages,
          })
          return jsonConv
        })
      )
      const user = new ChatUser(socket.user.id)
      await user.init()
      user.conversations.length &&
        user.conversations.forEach(conversation => {
          socket.join(conversation.id)
          socket.emit('messages', {
            room: conversation.id,
            messagesArray: conversation.messages,
          })
        })
      socket.emit('chatRoomList', user.conversations.concat(publicRooms))

      socket.on('message', async ({ room: conversationId, text }) => {
        console.log(conversationId, text)
        const thisRoom = new Conversation({
          id: conversationId,
        })
        await thisRoom.init()
        if (!thisRoom) return

        const timestamp = Date.now() / 1000
        const newMessage = {
          id: thisRoom.messages.length,
          user: socket.user.id,
          date: timestamp,
          text,
        }
        await thisRoom.addMessage(newMessage)
        // We forward the entire user object to avoid querying all the info again
        newMessage.user = socket.user
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
        if (!userId || userId === socket.user.id) return
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
