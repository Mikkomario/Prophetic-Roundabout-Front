<template>	
	<div class="box block">
		<h3 class="title is-4">Meeting Name @ Prophetic Roundabout</h3>
		<div class="block">
			<span class="is-size-5">Thursday 27th at 05:00 PM</span>
			<span v-for="h of host" :key="h"><br>By {{ h }}</span>
		</div>
		<div class="block">
			<a class="is-link" @click="show()">Show more</a>
		</div>
		<div v-if="detailsVisible">
			<div class="block">
				<b>Meeting ID:</b> 1231234214<br>
				<b>Password:</b> 12312
			</div>
			<div class="block">
				<a class="is-link" v-if="emailInvitationHidden" @click="showEmail()">Invite via email</a>, 
				<a class="is-link" v-if="textInvitationHidden" @click="showInvitation()">Show invitation</a> or 
				<a class="is-link" v-if="linkInvitationHidden" @click="showLink()">show invite link</a>

				<form class="block" v-if="emailInvitationVisible">
					<div class="field has-addons">
						<p class="control">
							<input class="input" type="text">
						</p>
						<p class="control">
							<a class="button is-info">Send Invitation</a>
						</p>
					</div>
				</form>


				<div class="notification block">Invitation Sent!</div>
			</div>
			<div class="block">
				<a class="is-link" @click="hide()">Show less</a>
			</div>
		</div>
		<div class="columns is-centered">
			<div class="column has-text-right">
				<button class="button is-primary" style="min-width: 33%">Start</button>	
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import { Option } from '@/classes/Option'
	import { Meeting } from '@/classes/Meeting'

	export default {
		props: {
			// Displayed meeting, which is required
			meeting: {
				type: Meeting, 
				required: true
			}, 
			// Whether you're the host of these meetings. Default = false.
			isHost: {
				type: Boolean, 
				default: false
			}
		}, 
		data() {
			return {
				detailsVisible: false, 
				invitationDisplay: ''
			}
		}, 
		computed: {
			host() { return new Option(this.meeting.host).map(h => h.name) }, 
			joinLink() { return this.meeting.joinUrl }, 

			emailInvitationVisible() { return this.invitationDisplay == 'email' }, 
			emailInvitationHidden() { return !this.emailInvitationVisible }, 
			textInvitationVisible() { return this.invitationDisplay == 'text' }, 
			textInvitationHidden() { return !this.textInvitationVisible }, 
			linkInvitationVisible() { return this.invitationDisplay == 'link' }, 
			linkInvitationHidden() { return !this.linkInvitationVisible }
		}, 
		methods: {
			show() { this.detailsVisible = true }, 
			hide() { 
				this.detailsVisible = false
				this.invitationDisplay = ''
			}, 
			showEmail() { this.invitationDisplay = 'email' }, 
			showInvitation() { this.invitationDisplay = 'text' }, 
			showLink() { return this.invitationDisplay = 'link' }
		}
	}
</script>