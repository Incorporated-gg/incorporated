<template>
  <div class="inspect">
    <div class="filters">
      <div class="filter">
        <label for="search">search username</label>
        <input id="search" type="text" ref="seachUserInput" v-model="searchUser">
        <button type="button" @click="navigateToUser()">search</button>
      </div>
    </div>
    <activity-panel :activities="this.activities" v-on:refresh-activities="fetchUserActivity" :loading="loadingActivities" />
  </div>
</template>

<script>
import { accountGet } from '../lib/api'
import ActivityPanel from '../components/ActivityPanel.vue'
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'Inspect',
  data() {
    return {
      searchUser: this.$route.params.userName,
      currentUser: '',
      activities: [],
      loadingActivities: false,
    }
  },
  components: { ActivityPanel },
  computed: {
    ...mapState(['globalFilters'])
  },
  methods: {
    ...mapMutations(['setGlobalFilters']),
    async fetchUserActivity() {
      this.activities = []
      this.loadingActivities = true
      const activities = await accountGet(`/v1/admin/users/${this.currentUser}/activity`)
      this.loadingActivities = false
      if (activities.error) return
      this.activities = activities
    },
    navigateToUser() {
      if (this.searchUser === this.currentUser) return
      this.$router.push(`/inspect/${this.searchUser}`)
    }
  },
  watch: {
    currentUser: async function (newUser) {
      this.activities = []
      if (!newUser) return
      await this.fetchUserActivity()
      this.searchUser = newUser
    },
  },
  async created() {
    const userName = this.$route.params.userName
    if (!userName) return
    this.currentUser = userName
  },
  mounted() {
    this.$refs.seachUserInput.addEventListener('keyup', e => {
      if (e.which === 13) {
        this.navigateToUser()
      }
    })
  },
  async beforeRouteUpdate(to, from, next) {
    next()
    const userName = to.params.userName
    this.currentUser = userName
    this.searchUser = userName
  }
}
</script>

<style lang="scss" scoped>
.inspect {
  padding: 40px;
}
</style>