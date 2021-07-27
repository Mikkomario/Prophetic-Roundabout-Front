<template>
	<div class="block box">
		<h1 class="title is-2">{{ title }}</h1>
		<p class="content">{{ message }}</p>
		<router-link :to="nextPath">{{ nextButtonText }}</router-link>
	</div>
</template>

<script type="text/javascript">
	import { mapGetters } from 'vuex'
	import { Option, Some, None } from '@/classes/Option'
	import { Try } from '@/classes/Try'

	export default {
		data() { 
			return {
				result: this.queryParam('was_success').map(s => s === 'true'), 
				deniedAccess: this.queryParam('denied_access').map(s => s === 'true'), 
				state: this.queryParam('state').flatMap(s => Try.apply(() => JSON.parse(s)).match(json => Some(json), error => {
					console.log(error);
					return None;
				})), 
				errorMessage: this.queryParam('error').getOrElse('')
			}
		}, 
		computed: { 
			nextPath() {
				if (this.isSessionOpen && !this.isFailure && !this.deniedAccess)
					return this.state.flatMap(s => new Option(s.next)).match(n => '/' + n, () => '/me');
				else
					return '/';
			}, 
			nextName() {
				if (this.isSessionOpen)
					return this.state.flatMap(s => new Option(s.next_name));
				else
					return None;
			}, 
			nextButtonText() {
				return this.nextName.match(n => 'Continue to ' + n, () => 'Continue');
			}, 
			isSuccess() { return this.result.contains(true) }, 
			isFailure() { return this.result.contains(false) }, 
			targetSystem() { return this.state.flatMap(s => new Option(s.target)) }, 

			title() {
				if (this.isSuccess) {
					if (this.deniedAccess)
						return 'Thank you';
					else
						return 'Thank you!'
				}
				else if (this.isFailure) {
					if (this.deniedAccess)
						return 'Authentication Cancelled';
					else
						return 'Whoops :('
				}
				else
					return 'Authentication Completed'
			}, 
			message() {
				if (this.isSuccess) {
					if (this.deniedAccess)
						return this.targetSystem.match(
							system => `Thank you for enabling some of the features in ${system}. Unfortunately, some of the functions still remain unavailable until you provide access to the rest of the required data.`, 
							() => 'Thank you for providing access to some of the data. Some features may still remain inaccessible until you provide access to the rest of the required data, however.')
					else
						return this.targetSystem.match(
							system => `You have now successfully enabled ${system}-related features.`, 
							() => 'You have now successfully authenticated and are good to go.')
				} 
				else if (this.isFailure) {
					if (this.deniedAccess)
						return 'It looks like you rejected access to the required data. It is understandable. Please feel free to provide feedback for us or enable access later if you change your mind.'
					else if (this.errorMessage.length > 0)
						return `We're sorry to inform you but there was an unexpected error during the authentication process. Please contact us if the problem persists or if you need any help. Here's the error message for diagnostics: ${this.errorMessage}`
					else
						return "It looks like something went wrong during the authentication process, but we're unsure what exactly it is. Please contact us if the problem persists or if you need any help."
				}
				else 
					return 'The authentication process is now complete.'
			}, 

			...mapGetters(['isSessionOpen'])
		}, 
		methods: {
			queryParam(paramName) {
				return new Option(this.$route.query[paramName]);
			}
		}
	}
</script>