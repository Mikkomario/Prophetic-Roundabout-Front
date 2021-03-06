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
	import { mapGetters, mapMutations } from 'vuex'
	import { Option } from '@/classes/Option'
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
			isFailed() { return this.errorMessage.length > 0 }, 
			...mapGetters(['authorizationHeader'])
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
					this.isLoading = true;
					this.errorMessage = "";
					const email = this.emailField.text;
					const that = this;

					// FIXME: serverAddress is undefined (remove logs)
					console.log('Logging to: ' + that.$store.state.serverAddress + 'quests/me/session-key');
					fetch(that.$store.state.serverAddress + 'quests/me/session-key', {
						headers: {
							'Authorization': 'Basic ' + window.btoa(unescape(encodeURIComponent(email + ':' + that.passwordField.text))), 
							'X-Style': 'simple'
						}
					}).then(response => {
						if (response.ok) {
							response.text().then(sessionKey => { 
								console.log('Acquired session key');
								console.log(sessionKey);
								// Stores the session key locally
								that.login({
									email: email, 
									sessionKey: sessionKey.replace(/"/g,"")
								});
								// Moves the user to the next destination
								that.$router.push(new Option(that.$route.query.next).getOrElse('me'));
							}).catch(e => console.log(e));
						}
						else
							return response.text().catch(() => '').then(message => {
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
			}, 
			...mapMutations(['login'])
		}, 
		mounted() { 
			// When mounted, attempts to read email from stored data
			this.$store.state.email.foreach(email => this.emailField.text = email);
		}
	}
</script>