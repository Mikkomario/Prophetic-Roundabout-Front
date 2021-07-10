<template>
	<div class="block">
		<meeting-box v-for="meeting of meetings" :key="meeting.id" :is-host="isHost" :meeting="meeting"></meeting-box>
		<p class="is-size-6" v-for="(message, idx) of noMeetingsMessage" :key="idx">{{ message }}</p>
	</div>
</template>

<script type="text/javascript">
	import { Some, None } from '@/classes/Option'
	import { Vector } from '@/classes/Vector'
	import MeetingBox from '@/components/MeetingBox.vue'

	export default {
		props: {
			// Meetings being displayed. Expects a vector.
			meetings: {
				type: Vector, 
				default: function() { return Vector.empty }
			}, 
			// Whether you're the host of these meetings. Default = false.
			isHost: {
				type: Boolean, 
				default: false
			}
		}, 
		computed: {
			noMeetingsMessage() {
				if (this.meetings.nonEmpty)
					return None;
				else if (this.isHost)
					return Some("You haven't scheduled any meetings to host yet.")
				else
					return Some('There are no meetings you can join at this time.')
			}
		}, 
		components: {
			MeetingBox
		}
	}
</script>