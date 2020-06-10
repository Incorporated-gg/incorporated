<template>
  <div class="activityPanel">
    <div class="heading">Latest activity</div>
    <div class="activityList">
      <article class="activityItem" v-for="(activity, i) in activities" :key="i">
        <span class="date">{{activity.date|asDate}}</span> User {{activity.userId}} did activity type {{activity.type}} from IP {{activity.ip}}.
        <span v-if="activity.extra">Here's some extra info about it: {{activity.extra}}.</span>
      </article>
      <span v-if="!activities.length">No activities yet</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ActivityPanel',
  props: {
    activities: Array
  },
  filters: {
    asDate(epoch) {
      const date = new Date(parseInt(epoch))
      return `[${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).padStart(2, '0')}] ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(2, '0')}`
    }
  }
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

    .activityItem {
      .date {
        font-weight: bold;
      }
    }
  }
}
</style>