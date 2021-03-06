import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Inspect from '../views/Inspect.vue'

import store from '../store'

Vue.use(VueRouter)

  const routes = [
    {
      path: '/home',
      name: 'Home',
      component: Home,
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/inspect',
      name: 'EmptyInspect',
      component: Inspect,
      children: [
        {
          path: ':userName',
          name: 'Inspect',
          component: Inspect
        }
      ]
    },
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (!store.state.sessionId && to.path !== '/login') return next('/login')
  if (to.path === '/') return next('/home')
  next()
})

export default router
