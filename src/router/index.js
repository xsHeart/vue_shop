import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Wellcome from '../components/wellcome.vue'
import Users from '../components/user/users.vue'
import Rights from '../components/power/rights.vue'
import Roles from '../components/power/roles.vue'
import Cate from '../components/goods/cate.vue'
import Params from '../components/goods/params.vue'
import GoodsList from '../components/goods/list.vue'
import Add from '../components/goods/add.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/wellcome',
      children: [
        { path: '/wellcome', component: Wellcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: GoodsList },
        { path: '/goods/add', component: Add }
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next()有两种方式：一种是 next() 放行，一种是 next('/login')  强制跳转
  if (to.path === '/login') return next()
  // 如果用户访问的是登陆页会直接放行
  // 如果没有放行表示访问的是一个有权限的页面，要获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果没有值，就跳转到登录页
  if (!tokenStr) return next('/login')
  // 如果没有return出去，说明字符串是存在的，直接放行
  next()
})

export default router
