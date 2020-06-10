<template>
  <div class="home">
    <UsersPanel :users="users" />
    <ActivityPanel :activities="activities" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import UsersPanel from '../components/UsersPanel.vue'
import ActivityPanel from '../components/ActivityPanel.vue'
import { accountGet } from '../lib/api'

export default Vue.extend({
  name: 'Home',
  components: {
    UsersPanel, ActivityPanel
  },
  data() {
    return {
      users: [],
      activities: [],
    }
  },
  async mounted() {
    const users = await accountGet('/v1/admin/users/list')
    const activities = await accountGet('/v1/admin/users/activity')
    this.users = users
    this.activities = activities
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