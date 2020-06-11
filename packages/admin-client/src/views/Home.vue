<template>
  <div class="home">
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
      loadingActivities: false,
    }
  },
  methods: {
    async fetchUserActivities() {
      this.activities = []
      this.loadingActivities = true
      const activities = await accountGet('/v1/admin/users/activity')
      this.loadingActivities = false
      if (activities.error) return
      this.activities = activities
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
  
  .usersPanel {
    margin-bottom: 40px;
  }
}
</style>