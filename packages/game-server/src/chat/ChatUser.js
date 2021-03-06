import redis from 'redis'
import { promisify } from 'util'
import Conversation from './Conversation'

const client = redis.createClient(
  `redis://root:${process.env.REDIS_PASS}@${process.env.NODE_ENV === 'development' ? 'redis' : 'localhost'}:6379`
)
const sAddAsync = promisify(client.sadd).bind(client)
const sRemAsync = promisify(client.srem).bind(client)
const hGetAsync = promisify(client.hget).bind(client)
const hSetAsync = promisify(client.hset).bind(client)
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
            const lastReadMessagesDate = await this.getLastMessageReadDateForConversation(conversation)
            await instance.init()
            const convJSON = await instance.toJSON()
            return { ...convJSON, lastReadMessagesDate: lastReadMessagesDate || 0 }
          })
        )
      : []
    this.online = isOnline === 1
    this.conversations = parsedConversations
  }
  async joinConversation(conversationId, type) {
    await sAddAsync(`users:${this.id}:conversations`, conversationId)
    const instance = new Conversation({ id: conversationId, type })
    const lastReadMessagesDate = await this.getLastMessageReadDateForConversation(conversationId)
    await instance.init()
    const convJSON = await instance.toJSON()
    this.conversations.push({ ...convJSON, lastReadMessagesDate: lastReadMessagesDate || 0 })
  }
  async leaveConversation(conversationId) {
    await sRemAsync(`users:${this.id}:conversations`, conversationId)
    const existingConvIndex = this.conversations.findIndex(c => c.id === conversationId)
    if (existingConvIndex > -1) this.conversations.splice(existingConvIndex, 1)
  }
  async joinIndividualConversation(conversationId) {
    await this.joinConversation(conversationId, 'individual')
  }
  async joinAllianceConversation(conversationId) {
    await this.joinConversation(conversationId, 'alliance')
  }
  async joinGroupConversation(conversationId) {
    await this.joinConversation(conversationId, 'group')
  }
  async getLastMessageReadDateForConversation(conversationId) {
    return await hGetAsync(`users:${this.id}:lastReadMessagesDates`, conversationId)
  }
  async readConversation(conversationId) {
    await hSetAsync(`users:${this.id}:lastReadMessagesDates`, conversationId, parseInt(Date.now() / 1000))
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
