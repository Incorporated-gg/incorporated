<template>
  <div class="activityPanel">
    <div class="heading">Latest activity</div>
    <div class="activityList">
      <ActivityItem v-for="(activity, i) in activities" :key="i" :activity="activity" />
      <span v-if="!activities.length">No activities yet</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ActivityItem from './ActivityItem.vue'

export default Vue.extend({
  name: 'ActivityPanel',
  props: {
    activities: Array
  },
  components: { ActivityItem },
})
</script>

<style lang="scss" scoped>
.activityPanel {
  border: 1px solid black;
  padding: 20px;
  background: #f0f0f0;

  .activityList {
    display: flex;
    flex-direction: column;
  }
}
</style>