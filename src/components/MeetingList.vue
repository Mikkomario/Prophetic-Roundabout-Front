<template>
	<div class="block">
		<meeting-box :is-host="isHost"></meeting-box>
	</div>
</template>

<script type="text/javascript">
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
		}, components: {
			MeetingBox
		}
	}
</script>