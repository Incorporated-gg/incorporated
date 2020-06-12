<template>
  <div class="activityPanel">
    <header class="header">
      <div class="heading">Latest activity</div>
      <button type="button" @click="$emit('refresh-activities')" :class="{loading}">🔄</button>
    </header>
    <div class="activityList">
      <ActivityItem v-for="(activity, i) in activities" :key="i" :activity="activity" />
      <span v-if="!activities.length">No activities yet</span>
    </div>
  </div>
</template>

<script>
import ActivityItem from './ActivityItem.vue'

export default {
  name: 'ActivityPanel',
  props: {
    loading: Boolean,
    activities: Array,
  },
  components: { ActivityItem },
}
</script>

<style lang="scss" scoped>
.activityPanel {
  border: 1px solid black;
  padding: 20px;
  background: #f0f0f0;

  .header {
    display: flex;
    align-items: flex-start;

    .heading {
      flex-grow: 1;
    }
    button {
      font-size: 40px;

      &.loading {
        animation-name: spin;
        animation-direction: normal;
        animation-duration: 5s;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }
    }
  }

  .activityList {
    display: flex;
    flex-direction: column;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>