import Vue from 'vue'
import Vuex from 'vuex'

import { accountPost } from '../lib/api'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    sessionId: null
  },
  mutations: {
    setSessionId(state, payload) {
      state.sessionId = payload
    }
  },
  actions: {
    async login({ state, commit }, userData) {
      console.log(userData)
      if (state.sessionId === true) return
      const response = await accountPost('/v1/login', userData)
      const contentType = response.headers.get('content-type')
      const data = contentType && contentType.startsWith('application/json;') ? await response.json() : await response.text()
      if (!data.sessionID) {
        alert(JSON.stringify(data))
        return false
      }
      commit('setSessionId', data.sessionID)
      return true
    }
  },
  modules: {
  }
})
