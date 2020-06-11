<template>
  <article class="activityItem">
    <span class="date">{{activity.date|asDate}}</span>&nbsp;<router-link class="username" :style="`color: ${activity.userColor}`" :to="'/inspect/' + activity.username">{{activity.username}}</router-link> {{activity.type|asActivity}} from IP {{activity.ip}}.
    <span v-if="activity.extra">
      <button type="button" class="extraButton" @click="showExtra = !showExtra">➕ extra info</button>
      <pre class="extraInfo" v-show="showExtra">{{activity.extra|asExtra}}</pre>
    </span>
  </article>
</template>

<script lang="ts">
import Vue from 'vue'

const verb = {
  ["attackStart"]: 'started an attack',
  ["attackCancel"]: 'cancelled an attack',
  ["attackFinish"]: 'finished an attack',
  ["spyStart"]: 'started spying',
  ["spyCancel"]: 'cancelled a spy',
  ["spyFinish"]: 'finished a spy',
  ["login"]: 'logged in',
  ["corpCreate"]: 'created an alliance',
  ["corpDelete"]: 'deleted an alliance',
  ["corpLeave"]: 'left an alliance',
  ["corpBuff"]: 'activated an alliance buff',
  ["corpRequest"]: 'requested to join an alliance',
  ["corpKick"]: 'kicked a user from an alliance',
  ["corpReject"]: 'rejected an alliance join request',
  ["corpAccept"]: 'accepted an alliance join request',
  ["corpDeposit"]: 'deposited troops in the alliance',
  ["corpWithdraw"]: 'withdrew troops from the alliance',
  ["corpInvest"]: 'invested money into the alliance',
  ["buildingBought"]: 'bought a building',
  ["buildingExtract"]: 'extracted money from a building',
  ["researchStart"]: 'started a research',
  ["researchManuallyEnded"]: 'manually finished a research',
  ["researchEnd"]: 'finished a research',
  ["personnelHired"]: 'hired personnel',
  ["personnelFired"]: 'fired personnel'
}

export default Vue.extend({
  name: 'ActivityItem',
  data() {
    return {
      showExtra: false,
    }
  },
  props: {
    activity: {
      type: Object,
    }
  },
  filters: {
    asDate(epoch) {
      const date = new Date(parseInt(epoch))
      return `[${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(2, '0')}]`
    },
    asActivity(activity) {
      return verb[activity]
    },
    asExtra(extraInfo) {
      return JSON.stringify(extraInfo, null, 2)
    }
  }
})
</script>

<style lang="scss">
.activityItem {
  margin: 2px 0;
  .date {
    font-weight: bold;
  }
  .username {
    font-weight: bold;
    text-decoration: none;
  }
  .extraButton {
    font-size: 11px;
    text-transform: uppercase;
    border: 1px solid green;
    color: green;
    border-radius: 3px;
    padding: 2px 3px;
    background: transparent;

    &:hover {
      background: green;
      color: whitesmoke;
    }
  }
  .extraInfo {
    background: lightcoral;
    padding: 5px;
  }
}
</style>