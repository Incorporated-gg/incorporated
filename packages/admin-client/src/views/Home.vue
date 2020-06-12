<template>
  <div class="home">
    <span>Active users in the last 30 days: {{activeUsers}}</span>
    <span>Unique IPs in the last 30 days: {{uniqueIps}}</span>
    <table class="multis" v-if="multis.length">
      <tr>
        <th colspan="2">Posibles multicuentas:</th>
      </tr>
      <tr>
        <th>Username</th>
        <th>IP</th>
      </tr>
      <tr v-for="(multi, i) in multis" :key="i">
        <td>
          <router-link class="usernameLink" :style="`color: ${multi.userColor}`" :to="'/inspect/' + multi.username">{{multi.username}}</router-link>
        </td>
        <td>
          <span class="ip">{{multi.ip}}</span>
        </td>
      </tr>
    </table>
    <ActivityPanel :activities="activities" v-on:refresh-activities="fetchUserActivities" :loading="loadingActivities" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ActivityPanel from '../components/ActivityPanel.vue'
import { accountGet } from '../lib/api'

export default Vue.extend({
  name: 'Home',
  components: { ActivityPanel },
  data() {
    return {
      activities: [],
      activeUsers: null,
      uniqueIps: null,
      multis: [],
      loadingActivities: false,
    }
  },
  methods: {
    async fetchUserActivities() {
      this.activities = []
      this.loadingActivities = true
      const data = await accountGet('/v1/admin/activity')
      this.loadingActivities = false
      if (data.error) return
      this.activities = data.latestActivity
      this.activeUsers = data.activeUsers
      this.uniqueIps = data.uniqueIps
      this.multis = data.multis
    },
  },
  async mounted() {
    await this.fetchUserActivities()
  }
})
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  padding: 40px;

  .multis {
    border: 1px solid black;
    text-align: center;
    max-width: 450px;
  }
  
  .usersPanel {
    margin-bottom: 40px;
  }
}
</style>