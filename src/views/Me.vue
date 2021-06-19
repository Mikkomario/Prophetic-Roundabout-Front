<template>
	<div class="block">
		<h1>Welcome ???</h1>
	</div>
</template>

<script type="text/javascript">
	import { mapGetters } from 'vuex'
	import { Option } from '@/classes/Option'

	export default {
		data() {
			return {
				name: '', 
				timeZone: new Option(Intl.DateTimeFormat().resolvedOptions().timeZone), 
				isProAccount: false, 
				isLinkedToZoom: None
			}
		}, 
		computed {
			...mapGetters(['authorizationHeader'])
		}, 
		created() {
			// Retrieves current user settings from the server
			const that = this;
			fetch(that.$config.api_address + 'users/me/settings', {
				headers: { 'Authorization': that.authorizationHeader }
			})
		}
	}
</script>