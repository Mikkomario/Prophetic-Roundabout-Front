import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import '@/assets/main.scss';

fetch(process.env.BASE_URL + "config.json")
	.then(response => {
		response.json().then(config => {
			const app = createApp(App); 
			// Sets the configuration to be available in all Vue components (via this.$config)
			app.config.globalProperties.$config = config;
			app.use(store).use(router).mount('#app');
		})
	})
	.catch(error => console.log(error));