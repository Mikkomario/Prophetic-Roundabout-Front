<template>
	<div class="block box">
		<div v-if="isSuccess">
			<h1 class="title is-2">Congratulations</h1>
			<p class="content">
				You have now enabled Zoom features in Prophetic Roundabout.
			</p>
		</div>
		<div v-else-if="isFailure">
			<h1 class="title is-2 is-danger">Whoops :(</h1>
			<p class="content">
				We're sorry to inform you, but we couldn't authenticate you with your Zoom account.<br>
				Perhaps you can try again later?
			</p>
		</div>
		<div v-else>
			<h1 class="title is-2">Thank you!</h1>
			<p class="content">
				Thank you for enabling Zoom features in Prophetic Roundabout.<br>
				We still need to complete some tasks in the background, but the new features should become available to you soon.
			</p>
		</div>
		<router-link :to="nextPath">Continue to Prophetic Roundabout</router-link>
	</div>
</template>

<script type="text/javascript">
	import { mapGetters } from 'vuex'
	import { Option } from '@/classes/Option'

	export default {
		data() { 
			return {
				result: new Option(this.$route.query.success).map(s => s === 'true')
			}
		}, 
		computed: { 
			nextPath() {
				if (this.isSessionOpen)
					return '/me';
				else
					return '/';
			}, 
			isSuccess() { return this.result.contains(true) }, 
			isFailure() { return this.result.contains(false) }, 

			...mapGetters(['isSessionOpen'])
		}
	}
</script>