import { getUserData, getUserIDFromUsername } from '../lib/db/users'
import { getUserIDFromSessionID } from '../lib/db/sessions'
import ChatUser from './ChatUser'
import Conversation from './Conversation'

const events = require('events')
export const chatEvents = new events.EventEmitter()

const _DEV_ = process.env.NODE_ENV === 'development'

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
  const Chat = {
    getSocketForUserId(userId) {
      return Object.keys(apiNamespace.sockets).reduce((acc, curSocket, i, thisArray) => {
        if (apiNamespace.sockets[curSocket].user.id === userId) return apiNamespace.sockets[curSocket]
        return acc
      }, null)
    },
    async kickUserFromRoom(userId, fromRoom) {
      const conversation = new Conversation({ id: fromRoom, type: 'alliance' })
      await conversation.init()
      await conversation.syncUsers()
      const socket = this.getSocketForUserId(userId)
      if (!socket) return
      socket.leave(fromRoom)
      socket.emit('leaveRoom', fromRoom)
    },
    async addUserToRoom(userId, fromRoom) {
      const conversation = new Conversation({ id: fromRoom, type: 'alliance' })
      await conversation.init()
      await conversation.syncUsers()
      const newRoom = await conversation.toJSON()
      const socket = this.getSocketForUserId(userId)
      if (!socket) return
      socket.join(fromRoom)
      socket.emit('chatRoomList', [newRoom])
    },
  }
  chatEvents.on('kickUser', ({ room, userId }) => {
    if (_DEV_) console.log('kicking user from room', userId, room)
    Chat.kickUserFromRoom(userId, room)
  })
  chatEvents.on('addUser', ({ room, userId }) => {
    if (_DEV_) console.log('adding user to room', userId, room)
    Chat.addUserToRoom(userId, room)
  })
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
      if (_DEV_) console.log(socket.user.id + ' connected')
      const user = new ChatUser(socket.user.id)
      await user.init()
      const publicRooms = await Promise.all(
        publicChannels.map(async publicChannel => {
          const conv = new Conversation(publicChannel)
          await conv.init()
          const jsonConv = await conv.toJSON()
          jsonConv.lastReadMessagesDate = (await user.getLastMessageReadDateForConversation(conv.id)) || 0
          socket.join(conv.id)
          socket.emit('messages', {
            room: conv.id,
            messagesArray: conv.messages,
          })
          return jsonConv
        })
      )
      if (socket.user.alliance && !user.conversations.find(c => c.id === `alliance${socket.user.alliance.id}`)) {
        const conv = new Conversation({ id: `alliance${socket.user.alliance.id}` })
        await conv.init()
        await conv.addUser(socket.user.id)
        await user.joinAllianceConversation(`alliance${socket.user.alliance.id}`)
      }
      if (user.conversations.length) {
        await Promise.all(
          user.conversations.map(async conversation => {
            const conv = new Conversation({ id: conversation.id })
            await conv.init()
            if (!conv.userIds.includes(socket.user.id)) {
              await user.leaveConversation(conversation.id)
              return
            }
            socket.join(conversation.id)
            socket.emit('messages', {
              room: conversation.id,
              messagesArray: conversation.messages,
            })
          })
        )
      }

      socket.emit('chatRoomList', user.conversations.concat(publicRooms))

      socket.on('message', async ({ room: conversationId, text }) => {
        if (!socket.rooms[conversationId]) return
        if (_DEV_) console.log(conversationId, text)
        const thisRoom = new Conversation({
          id: conversationId,
        })
        await thisRoom.init()
        if (!thisRoom) return

        const timestamp = parseInt(Date.now() / 1000)
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

      socket.on('lastRead', async conversationId => {
        user.readConversation(conversationId)
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
        if (_DEV_) console.log(socket.user.id + ' disconnected')
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
