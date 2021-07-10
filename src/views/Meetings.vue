<template>
	<div class="box block">
		<h1 class="title is-2">Your upcoming meetings</h1>
		<p class="subtitle" v-if="isLoading">Looking for meetings...</p>
		<p class="subtitle" v-else-if="meetingsAreAvailable">There are <b>{{ meetingsCount }}</b> meetings you can attend.</p>
		<p class="subtitle" v-else>There are no meetings available at this time. Maybe you want to host one?</p>

		<div v-if="meetingsAreAvailable">
			<section class="block">
				<h2 class="title is-3">Meetings you're hosting</h2>
				<meeting-list is-host :meetings="hostedMeetings"></meeting-list>
				<div class="columns">
					<div class="column has-text-right">
						<button class="button is-primary" @click="schedule()">Schedule / Host a new Meeting</button>
					</div>
				</div>
			</section>
			<section class="block">
				<h2 class="title is-3">Meetings hosted by others</h2>
				<meeting-list :meetings="joinableMeetings"></meeting-list>
			</section>
		</div>
		<div v-else>
			<div class="columns">
				<div class="column has-text-right">
					<button class="button is-primary" @click="schedule()">Schedule / Host a new Meeting</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import { mapActions } from 'vuex'
	import { Vector } from '@/classes/Vector'
	import MeetingList from '@/components/MeetingList.vue'

	export default {
		data() {
			return {
				isLoading: true, 
				meetings: {
					hosting: Vector.empty, 
					other: Vector.empty
				}
			}
		}, 
		computed: {
			hostedMeetings() { return this.meetings.hosting }, 
			joinableMeetings() { return this.meetings.other }, 
			meetingsCount() { return this.hostedMeetings.size + this.joinableMeetings.size; }, 
			meetingsAreAvailable() { return this.meetingsCount > 0 }
		}, 
		methods: {
			schedule() { this.$router.push('schedule') }, 

			...mapActions({
				readMeetings: 'myMeetings'
			})
		}, 
		components: {
			MeetingList
		}, 
		created() {
			// Initializes meeting data with existing store resources
			this.meetings = this.$store.state.myMeetings;
			console.log(`Hosting: ${this.hostedMeetings.toString()}`)
			console.log(`Other: ${this.joinableMeetings.toString()}`)

			// Updates meetings data
			const that = this;
			this.readMeetings().then(newMeetings => {
				console.log(`New Hosting: ${newMeetings.hosting.toString()}`)
				console.log(`New Other: ${newMeetings.other.toString()}`)
				that.meetings = newMeetings;
				that.isLoading = false;

			}).catch(e => console.log(e))
		}
	}

</script>