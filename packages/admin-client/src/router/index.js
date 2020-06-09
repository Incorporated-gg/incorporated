import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Search from '../views/Search.vue'

import store from '../store'

Vue.use(VueRouter)

  const routes = [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/search',
      name: 'Search',
      component: Search
    }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (!store.state.sessionId && to.path !== '/login') return next('/login')
  next()
})

export default router
