import redis from 'redis'
import { promisify } from 'util'
import Conversation from './Conversation'

const client = redis.createClient(
  `redis://root:${process.env.REDIS_PASS}@${process.env.NODE_ENV === 'development' ? 'redis' : 'localhost'}:6379`
)
const sAddAsync = promisify(client.sadd).bind(client)
/* const hGetAsync = promisify(client.hget).bind(client) */
const sMembersAsync = promisify(client.smembers).bind(client)
/* const hGetAllAsync = promisify(client.hgetall).bind(client) */
const sisMemberAsync = promisify(client.sismember).bind(client)

const CONNECTED_USERS_SET_KEY = 'connectedUsers'

class ChatUser {
  constructor(userId) {
    this.id = userId
    this.conversations = []
    this.online = false
  }
  async init() {
    const isOnline = await sisMemberAsync(`chat:${CONNECTED_USERS_SET_KEY}`, this.id)
    const rawPrivateConversations = await sMembersAsync(`users:${this.id}:conversations`)
    const parsedConversations = rawPrivateConversations
      ? await Promise.all(
          rawPrivateConversations.map(async conversation => {
            const instance = new Conversation({ id: conversation })
            await instance.init()
            return await instance.toJSON()
          })
        )
      : []
    this.online = isOnline === 1
    this.conversations = parsedConversations
  }
  async joinConversation(conversationId) {
    await sAddAsync(`users:${this.id}:conversations`, conversationId)
  }
  async toJSON() {
    return {
      id: this.id,
      conversations: this.conversations,
      online: this.online,
    }
  }
}

export default ChatUser
