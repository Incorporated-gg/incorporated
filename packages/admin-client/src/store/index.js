import Vue from 'vue'
import Vuex from 'vuex'

import { accountPost } from '../lib/api'
import storage from '../lib/storage'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    sessionId: storage.getItem('sessionId', null)
  },
  mutations: {
    setSessionId(state, payload) {
      state.sessionId = payload
      storage.setItem('sessionId', payload)
    }
  },
  actions: {
    async login({ state, commit }, userData) {
      if (state.sessionId === true) return
      const data = await accountPost('/v1/login', userData)
      if (!data.sessionID) {
        return false
      }
      commit('setSessionId', data.sessionID)
      return true
    },
    logout({ state, commit }) {
      if (!state.sessionId) return
      storage.removeItem('sessionId')
      commit('setSessionId', null)
    }
  },
  modules: {
  }
})
