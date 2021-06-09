<template>
	<div class="block">
		<p class="content">Please login in order to use this application</p>
		<form style="max-width: 480px;">
			<div class="field">
				<label class="label">Email</label>
				<input :class="fieldClasses(emailField)" type="text" v-model="emailField.text"">
			</div>
			<div class="field">
				<label class="label">Password</label>
				<input :class="fieldClasses(passwordField)" type="password" v-model="passwordField.text">
			</div>
			<button 
				class="button is-primary" 
				style="width: 100%;" 
				:disabled="emailField.isEmpty || passwordField.isEmpty" 
				@click.prevent="attemptLogin()">
				Login
			</button>
		</form>
		<div class="block" v-else-if="isFailed">
			<div class="notification is-danger">{{ displayErrorMessage }}</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import { None, Some } from '@/classes/Option'
	import { Stateful } from '@/classes/StatefulPromise'
	import { Field } from '@/classes/Field'

	export default {
		name: 'Login', 
		data() {
			return {
				emailField: Field.empty(true), 
				passwordField: Field.empty(true), 
				loginPromise: None, 
				errorMessage: ''
			}
		}, 
		computed: {
			displayErrorMessage() {
				if (this.errorMessage.length > 0)
					return this.errorMessage;
				else
					return this.loginPromise.flatMap(p => p.failure).match(e => e.message, () => '');
			}, 
			isFailed() { return this.displayErrorMessage.length > 0 }
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
					console.log("Logging in...")
					this.loginPromise = Some(Stateful(fetch(this.$config.server_address + 'quests/me/session-key', {
						headers: {
							'Authorization': 'Basic ' + window.btoa(unescape(encodeURIComponent(this.emailField.text + ':' + this.passwordField.text)))
						}
					}).then(response => {
						if (response.ok) {
							// TODO: On success, do something else (redirect etc.)
							response.text().then(sessionKey => console.log(sessionKey.replace(/"/g,"")))
						}
						else
							response.text().catch(e => '').then(message => {
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
					})));
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