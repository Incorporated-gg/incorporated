import redis from 'redis'
import { promisify } from 'util'
import ChatUser from './ChatUser'
import { getUserData } from '../lib/db/users'

const client = redis.createClient(
  `redis://root:${process.env.REDIS_PASS}@${process.env.NODE_ENV === 'development' ? 'redis' : 'localhost'}:6379`
)
const hGetAllAsync = promisify(client.hgetall).bind(client)
const sAddAsync = promisify(client.sadd).bind(client)
const sMembersAsync = promisify(client.smembers).bind(client)
const hmSetAsync = promisify(client.hmset).bind(client)
const hDelAsync = promisify(client.hdel).bind(client)
const incrAsync = promisify(client.incr).bind(client)

class Conversation {
  constructor({ id, name, userIds, readonly, type }) {
    this.id = id
    this.name = name || 'Sala sin nombre'
    this.messages = []
    this.userIds = userIds ? userIds.sort((a, b) => (a > b ? 1 : -1)) : []
    this.readonly = readonly || false
    this.type = type || 'individual'
  }
  async getNextConversationId() {
    const nextId = await incrAsync('next_conversation_id')
    return nextId
  }
  async init() {
    if (!this.id && this.type === 'individual' && this.userIds.length === 2)
      this.id = `${this.userIds[0]}to${this.userIds[1]}`
    if (!this.id) {
      // We create the conversation
      const nextId = await this.getNextConversationId()
      const conversationKey = `conversations:${nextId}`
      await hmSetAsync(conversationKey, 'name', this.name, 'readonly', this.readonly, 'type', this.type)
      this.id = nextId
      this.userIds.forEach(async userId => {
        await this.addUser(userId)
      })
      return true
    } else {
      const conversationKey = `conversations:${this.id}`
      // We check if conversation exists
      const conver = await hGetAllAsync(conversationKey)
      // If it doesn't, we create it
      if (!conver) {
        await hmSetAsync(conversationKey, 'name', this.name, 'readonly', this.readonly, 'type', this.type)
        await this.syncUsers()
      } else {
        const userIds = await sMembersAsync(`${conversationKey}:userIds`)
        const messages = await sMembersAsync(`${conversationKey}:messages`)
        if (messages) {
          const mapped = await Promise.all(
            messages.map(async message => {
              const parsed = JSON.parse(message)
              parsed.user = await getUserData(parsed.user)
              return parsed
            })
          )
          conver.messages = mapped.sort((m1, m2) => (m1.date > m2.date ? 1 : -1))
        }
        this.name = conver.name
        this.messages = conver.messages || []
        this.userIds = userIds
        this.type = conver.type
        this.readonly = conver.readonly
      }
      return true
    }
  }
  /**
   * Removes all users from a conversation and adds them again from userIds list
   * Makes sure no deprecated users are still in the conversation
   * (user left alliance and stays in alliance chat type of case)
   */
  async syncUsers() {
    await hDelAsync(`conversations:${this.id}`, 'userIds')
    this.userIds.forEach(async userId => {
      await sAddAsync(`conversations:${this.id}:userIds`, userId)
      await this.addUser(userId)
    })
  }
  async addUser(userId) {
    const chatUser = new ChatUser(userId)
    chatUser.joinConversation(this.id)
    this.userIds.push(userId)
    return await sAddAsync(`conversations:${this.id}:userIds`, userId)
  }
  async addMessage(messageData) {
    await sAddAsync(`conversations:${this.id}:messages`, JSON.stringify(messageData))
    this.messages.push(messageData)
  }
  async toJSON() {
    const mappedUsers = await Promise.all(
      this.userIds.map(async userId => {
        const user = await getUserData(userId)
        return user
      })
    )
    return {
      id: this.id,
      name: this.name,
      messages: this.messages,
      users: mappedUsers,
      type: this.type,
      readonly: this.readonly,
    }
  }
}

export default Conversation
