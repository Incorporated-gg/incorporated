<template>
  <div id="app">
    <nav id="nav">
      <div class="topLinks">
        <router-link to="/home"><span class="icon">🏠</span></router-link>
        <router-link to="/inspect"><span class="icon">🔎</span></router-link>
      </div>
      <div class="bottomLinks">
        <button v-if="sessionId" type="button" @click="localLogout()"><span class="icon">🚫</span></button>
      </div>
    </nav>
    <main class="content">
      <router-view/>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'

export default Vue.extend({
  computed: {
    ...mapState(['sessionId'])
  },
  methods: {
    ...mapMutations(['setSessionId']),
    ...mapActions(['logout']),
    localLogout() {
      this.logout()
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

button {
  outline: none;
  border: none;
  cursor: pointer;
}

#app {
  font-family: 'Muli', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  height: 100%;
  overflow: hidden;
}

.content {
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: auto;
}
.heading {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 40px;
}
.table {
  border: 1px solid #333;
}

.usernameLink {
  font-weight: bold;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
  &:after {
    content: ' ↗️';
    font-size: 9px;
  }
}

.ip {
  font-weight: bold;
  color: #2c3e50;
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
    &.router-link-active {
      background: #42b983;
      border: 2px solid black;
    }
  }
}
</style>
