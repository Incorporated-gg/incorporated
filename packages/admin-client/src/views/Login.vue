<template>
  <div class="about">
    <h1>Login here pls</h1>
    <input type="text" v-model="username" placeholder="username">
    <input type="password" v-model="password" placeholder="pwd">
    <button type="button" @click="loginLocal()">login</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'

export default Vue.extend({
  data() {
    return {
      username: 'damage',
      password: 'pass1234'
    }
  },
  methods: {
    ...mapActions(['login']),
    async loginLocal() {
      const success = await this.login({
        username: this.username,
        password: this.password,
        admin: 'true',
      })
      if (success) this.$router.push('/')
    }
  },
})
</script>