<template>
	<div class="block">
		<p class="content">Please login in order to use this application</p>
		<form class="block" style="max-width: 480px;">
			<div class="field">
				<label class="label">Email</label>
				<input :class="fieldClasses(emailField)" type="text" v-model="emailField.text">
			</div>
			<div class="field">
				<label class="label">Password</label>
				<input :class="fieldClasses(passwordField)" type="password" v-model="passwordField.text">
			</div>
			<button 
				class="button is-primary" 
				:class="{ 'is-loading': isLoading }"
				style="width: 100%;" 
				@click.prevent="attemptLogin()">
				Login
			</button>
		</form>
		<div class="block" v-if="isFailed">
			<div class="notification is-danger">{{ errorMessage }}</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import { Field } from '@/classes/Field'

	export default {
		name: 'Login', 
		data() {
			return {
				emailField: Field.empty(true), 
				passwordField: Field.empty(true), 
				isLoading: false, 
				errorMessage: ''
			}
		}, 
		computed: {
			isFailed() { return this.errorMessage.length > 0 }
		}, 
		methods: {
			fieldClasses(field) {
				return {
					'input': true, 
					'is-danger': field.flag
				}
			},
			attemptLogin() {
				// Makes sure the required fields have been filled
				if (this.emailField.test() && this.passwordField.test())
				{
					this.errorMessage = "";
					const that = this;
					console.log("Logging in...")
					fetch(that.$config.api_address + 'quests/me/session-key', {
						headers: {
							'Authorization': 'Basic ' + window.btoa(unescape(encodeURIComponent(that.emailField.text + ':' + that.passwordField.text)))
						}
					}).then(response => {
						if (response.ok) {
							// TODO: On success, do something else (redirect etc.)
							// TODO: Handle failure (catch)
							// TODO: Prints this but doesn't do anything
							response.text().then(sessionKey => { 
								console.log('Got a session key!');
								console.log(sessionKey.replace(/"/g,"")) 
							}).catch(e => console.log(e));
						}
						else
							response.text().catch(() => '').then(message => {
								console.log(response.status + ': ' + message);
								if (!message || message.length === 0) {
									if (response.status == 401)
										throw new Error("Email and password don't match");
									else if (response.status >= 500)
										throw new Error('This service is not currently working correctly');
									else
										throw new Error('Failed to authenticate');
								}
								else
									throw new Error(message);
							})
					}).catch(e => that.errorMessage = e.message)
						.finally(() => that.isLoading = false);
				}
				else
					this.errorMessage = "Please fill the required fields";
			}
		}, 
		mounted() { 
			// When mounted, attempts to read email from stored data
			if (localStorage.email)
				this.emailField.text = localStorage.email;
		}
	}
</script>