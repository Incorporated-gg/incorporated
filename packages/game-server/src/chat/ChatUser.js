import redis from 'redis'
import { promisify } from 'util'
import Conversation from './Conversation'

const client = redis.createClient(`redis://root:root@redis:6379`)
const sAddAsync = promisify(client.sadd).bind(client)
const hGetAsync = promisify(client.hget).bind(client)
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
    const rawConversations = await hGetAsync(`users:${this.id}`, 'conversations')
    const parsedConversations = rawConversations.map(async conversation => {
      const instance = new Conversation(conversation)
      await instance.init()
      return instance
    })
    this.online = isOnline === 1
    return parsedConversations
  }
  async joinConversation(conversationId) {
    await sAddAsync(`users:${this.id}:conversations`, conversationId)
  }
}

export default ChatUser
