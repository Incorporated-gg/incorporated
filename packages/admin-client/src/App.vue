<template>
  <div id="app">
    <nav id="nav">
      <div class="topLinks">
        <router-link to="/"><span class="icon">🏠</span></router-link>
        <router-link to="/search"><span class="icon">🔎</span></router-link>
      </div>
      <div class="bottomLinks">
        <button v-if="sessionId" type="button" @click="logout()"><span class="icon">🚫</span></button>
      </div>
    </nav>
    <main class="content">
      <router-view/>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'

export default Vue.extend({
  computed: {
    ...mapState(['sessionId'])
  },
  methods: {
    ...mapMutations(['setSessionId']),
    logout() {
      this.setSessionId(false)
      this.$router.push('/login')
    }
  }
})
</script>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;

}

#app {
  font-family: 'Muli', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  height: 100%;
}

.content {
  flex-grow: 1;
}

#nav {
  padding: 10px;
  display: flex;
  flex-direction: column;
  background: #2c3e50;

  .topLinks {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  a, button {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    width: 60px;
    max-width: 60px;
    min-width: 60px;
    height: 60px;
    text-decoration: none;
    padding: 10px;
    border-radius: 30px;
    text-align: center;
    background: #5c3eff;
    font-weight: bold;
    color: whitesmoke;
    box-sizing: border-box;
    border: 1px solid black;

    &:not(:last-child) {
      margin-bottom: 10px;
    }
    &.router-link-exact-active {
      background: #42b983;
      border: 2px solid black;
    }
  }
}
</style>
