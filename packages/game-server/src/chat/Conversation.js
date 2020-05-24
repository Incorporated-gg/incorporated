import redis from 'redis'
import { promisify } from 'util'
import ChatUser from './ChatUser'
import { getUserData } from '../lib/db/users'
import { getAllianceBasicData } from '../lib/db/alliances'

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
    this.name = name
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
      this.id = nextId
      await this.saveConversation()
      await this.syncUsers()
      return true
    } else {
      const conversationKey = `conversations:${this.id}`
      // We check if conversation exists
      const conver = await hGetAllAsync(conversationKey)
      // If it doesn't, we create it
      if (!conver) {
        if (this.type === 'alliance') {
          const allianceId = parseInt(this.id.replace('alliance', ''))
          if (!allianceId) return
          const allianceData = await getAllianceBasicData(allianceId)
          this.name = `${allianceData.long_name} [${allianceData.short_name}]`
        }
        await this.saveConversation()
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
      const chatUser = new ChatUser(userId)
      if (this.type === 'individual') chatUser.joinIndividualConversation(this.id)
      if (this.type === 'alliance') chatUser.joinAllianceConversation(this.id)
      if (this.type === 'group') chatUser.joinGroupConversation(this.id)
      await sAddAsync(`conversations:${this.id}:userIds`, userId)
    })
  }
  async saveConversation() {
    await hmSetAsync(`conversations:${this.id}`, 'name', this.name, 'readonly', this.readonly, 'type', this.type)
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
