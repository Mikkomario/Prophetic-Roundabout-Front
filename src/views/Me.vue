<template>
	<div class="block">
		<h1 class="title is-2">Welcome, {{ displayName }}</h1>
		<!-- TODO: Add edit functionality -->
		<div class="card block">
			<header class="card-header">
				<p class="card-header-title">
					Settings
				</p>
				<a class="card-header-icon">
					<span class="icon-text">
						<span class="icon">
							<i class="material-icons">edit</i>
						</span>
						<span>Edit</span>
					</span>
				</a>
			</header>
			<div class="card-content">
				<table class="table">
					<tbody>
						<tr>
							<th class="hast-text-right">Name</th>
							<td>{{ name }}</td>
						</tr>
						<tr>
							<th class="hast-text-right">Time Zone</th>
							<td>{{ displayTimeZone }}</td>
						</tr>
						<tr>
							<th class="hast-text-right">Zoom Status</th>
							<td>{{ zoomStatus }}</td>
						</tr>
						<tr>
							<th class="hast-text-right">Google Status</th>
							<td>{{ googleStatus }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<!--  
		<div class="block" v-if="zoomAuthEnabled">
			<div class="box">
				<p class="content">
					Your Prophetic Roundabout account hasn't been linked to Zoom yet.<br>
					Linking is required to enable some features, like scheduling a Roundabout meeting. 
				</p>
				<button 
					class="button is-primary" :class="{ 'is-loading': isLoadingZoom }" 
					@click.prevent="redirectToZoomAuth()">
					Enable Zoom Features
				</button>
			</div>
		</div> -->
	</div>
</template>

<script type="text/javascript">
	import { mapActions } from 'vuex'
	import { Option, Some, None } from '@/classes/Option'
	import { Vector } from '@/classes/Vector'

	export default {
		data() {
			return {
				name: '', 
				timeZone: new Option(Intl.DateTimeFormat().resolvedOptions().timeZone), 
				isProAccount: false, 
				authorizedServiceIds: None, 
				isLinkedToZoom: None, 
				isLoadingZoom: false
			}
		}, 
		computed: {
			// Displays an email address if name is unavailable
			displayName() {
				if (this.name.length > 0)
					return this.name;
				else
					return this.$store.state.email.getOrElse(() => '');
			}, 
			// Displayable version of time zone
			displayTimeZone() {
				return this.timeZone.getOrElse(() => 'Not specified');
			}, 
			// String status of this user's zoom account state
			zoomStatus() {
				return this.authorizedServiceIds.match(
					serviceIds => {
						if (serviceIds.contains(1)) {
							if (this.isProAccount)
								return 'Pro/Paid Account';
							else
								return 'Basic Account';
						}
						else
							return 'Not linked yet';
					}, 
					() => 'Unknown');
			}, 
			googleStatus() {
				return this.authorizedServiceIds.match(
					serviceIds => {
						if (serviceIds.contains(2))
							return 'Linked';
						else
							return 'Not linked yet';
					}, () => 'Unknown')
			}, 
			// Whether Zoom authorization should be provided
			// zoomAuthEnabled() { return this.isLinkedToZoom.contains(false) }, 

			// ...mapGetters(['authorizationHeader'])
		}, 
		methods: {
			/*
			redirectToZoomAuth() {
				this.isLoadingZoom = true;
				const that = this;

				this.getJson('zoom/login').then(json => {
					that.isLoadingZoom = false;
					// Expects the API to return url to redirect the user to
					new Option(json.url).match(
						url => location.href = url, 
						() => {
							if (json.is_authorized)
								console.log("Already authorized!")
							else
								console.log(json.description)
						}
					)
				}, e => console.log(e)).finally(that.isLoadingZoom = false);
			},*/ 

			...mapActions(['getJson', 'push'])
		}, 
		created() {
			// Retrieves current user settings from the server
			const that = this;
			this.getJson('users/me/settings').then(json => {
				that.name = json.name;
				new Option(json.roundabout).foreach(rb => {
					that.isProAccount = rb.owns_pro_zoom_account;
					that.authorizedServiceIds = Some(new Vector(rb.authorized_service_ids));
					// that.isLinkedToZoom = new Option(rb.is_zoom_authorized)

					// Reads the time zone also. 
					// If it hasn't been updated on server side, sends the data read from browser
					new Option(rb.time_zone_id).match(
						timeZone => that.timeZone = Some(timeZone), 
						() => that.timeZone.foreach(timeZone => {
							that.push({
								path: 'users/me/settings/roundabout', 
								method: 'PATCH', 
								body: { time_zone_id: timeZone }
							}).catch(e => {
								console.log('Failed to update time zone');
								console.log(e);
								throw e;
							});
						}));
				});
			})
		}
	}
</script>