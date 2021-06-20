import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
{
	path: '/',
	name: 'Home',
	component: Home
},
{
	path: '/about',
	name: 'About',
	// route level code-splitting
	// this generates a separate chunk (about.[hash].js) for this route
	// which is lazy-loaded when the route is visited.
	component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
}, 
{
	path: '/login', 
	name: 'Login', 
	component: () => import('../views/Login.vue')
}, 
{
	path: '/me', 
	name: 'Me', 
	component: () => import('../views/Me.vue')
}, 
{
	path: '/zoom-auth-result', 
	name: 'ZoomAuthResult', 
	component: () => import('../views/ZoomAuthResult.vue'), 
	props: true
}
]

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes
})

export default router
