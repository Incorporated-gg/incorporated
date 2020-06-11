<template>
  <div class="usersPanel">
    <div class="heading">User list</div>
    <label for="search">search username</label>
    <input id="search" type="text" v-model="searchUser">
    <div class="userList">
      <table class="table">
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Actions</th>
        </tr>
        <tr class="user" v-for="(user, i) in usersList" :key="i">
          <td>{{user.id}}</td>
          <td>{{user.username}}</td>
          <td>
            <router-link :to="'/inspect/' + user.username">view activity</router-link>
          </td>
        </tr>
        <tr v-if="!usersList.length">
          <td colspan="3">
            Loading users...
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'UsersPanel',
  data() {
    return {
      searchUser: ''
    }
  },
  computed: {
    usersList() {
      return this.users.filter(u => u.username.toLowerCase().indexOf(this.searchUser.toLowerCase()) > -1)
    }
  },
  props: {
    users: Array
  },
})
</script>

<style lang="scss" scoped>
.usersPanel {
  border: 1px solid black;
  padding: 20px;
  background: #f0f0f0;

  .userList {
    display: flex;
    .table {
      flex-grow: 1;
      text-align: center;
      background: white;
    }
  }

  #search {
    margin-bottom: 25px;
  }
}
</style>