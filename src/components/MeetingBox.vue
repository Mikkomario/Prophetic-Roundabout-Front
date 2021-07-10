<template>	
	<div class="box block">
		<h3 class="title is-4">{{ meeting.name }} @ {{ roundaboutName }}</h3>
		<div class="block">
			<span class="is-size-5">{{ timeText }}</span>
			<span v-for="name of hostName" :key="name"><br>By {{ name }}</span>
		</div>
		<div class="block" v-if="detailsHidden">
			<a class="is-link" @click="show()">Show more</a>
		</div>
		<div v-else>
			<div class="block">
				<b>Meeting ID:</b> {{ meeting.zoomId }}<br>
				<b>Password:</b> {{ meeting.password }}
			</div>
			<div class="block">
				<a class="is-link" v-if="emailInvitationHidden" @click="showEmail()">Invite via email</a>, 
				<a class="is-link" v-if="textInvitationHidden" @click="showInvitation()">Show invitation</a> or 
				<a class="is-link" v-if="linkInvitationHidden" @click="showLink()">show invite link</a>
			</div>
			<form class="block" v-if="emailInvitationVisible">
				<div class="field has-addons">
					<p class="control">
						<input class="input" type="text" :class="{ 'is-danger': emailField.flag }" v-model="emailField.text">
					</p>
					<p class="control">
						<a class="button is-info">Send Invitation</a>
					</p>
				</div>
			</form>
			<div class="block box" v-else-if="textInvitationVisible">
				<span v-for="(line, index) of meeting.invitationLines" :key="index">{{ line }}<br></span>
			</div>
			<div class="block" v-else-if="linkInvitationVisible">
				<a class="is-link" :href="joinLink">{{ joinLink }}</a>
			</div>
			<div class="notification block" :class="messageClass" v-if="messageVisible">{{ message }}</div>
			<a class="is-link" @click="hide()">Show less</a>
		</div>
		<div class="columns">
			<div class="column has-text-right">
				<button class="button" :class="actionButtonClass" :disabled="actionButtonDisabled" style="min-width: 33%">Start</button>	
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import { Now } from '@/classes/RichDate'
	import { Field } from '@/classes/Field'
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
				detailsHidden: true, 
				invitationDisplay: '', 
				emailField: Field.empty(true), 
				message: '', 
				messageClass: [], 
				messageVisible: false
			}
		}, 
		computed: {
			actionButtonText() {
				if (this.isHost)
					return 'Start';
				else
					return 'Join';
			}, 
			actionButtonDisabled() {
				if (this.isHost)
					return !this.meeting.isStartable;
				else
					return !this.meeting.isJoinable;
			}, 
			actionButtonClass() {
				if (this.isHost)
					return 'is-primary';
				else
					return 'is-link';
			}, 

			roundaboutName() { return this.meeting.roundabout.name }, 
			hostName() { return this.meeting.hostName }, 
			joinLink() { return this.meeting.joinUrl }, 
			timeText() { 
				const time = this.meeting.startTime;
				if (time.isInPast) {
					const end = this.meeting.endTime;
					if (end.isInPast)
						return `Finished ${Now.since(end).toString()} ago`;
					else
						return `In progress right now! (Started ${time.until(Now).toString()} ago)`;
				}
				else if (time.isToday)
					return `Today at ${time.timeString} (Starting in ${Now.until(time).toString()})`;
				else if (time.isTomorrow)
					return `Tomorrow at ${time.timeString} (${time.timeZone})`
				else
					return `${time.dateString} at ${time.timeString} (${time.timeZone})` 
			}, 

			emailInvitationVisible() { return this.invitationDisplay == 'email' }, 
			emailInvitationHidden() { return !this.emailInvitationVisible }, 
			textInvitationVisible() { return this.invitationDisplay == 'text' }, 
			textInvitationHidden() { return !this.textInvitationVisible }, 
			linkInvitationVisible() { return this.invitationDisplay == 'link' }, 
			linkInvitationHidden() { return !this.linkInvitationVisible }
		}, 
		methods: {
			show() { this.detailsHidden = false }, 
			hide() { 
				this.detailsHidden = true;
				this.invitationDisplay = '';
			}, 
			
			showEmail() { this.invitationDisplay = 'email' }, 
			showInvitation() { this.invitationDisplay = 'text' }, 
			showLink() { return this.invitationDisplay = 'link' }, 
			
			sendInvitations() {
				if (this.emailField.test()) {
					console.log('Sending (not implemented)')
				}
			}, 

			/*showMessage(message) {

			}*/
		}
	}
</script>