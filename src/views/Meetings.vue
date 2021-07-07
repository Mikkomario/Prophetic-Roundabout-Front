<template>
	<div class="box block">
		<h1 class="title is-2">Your upcoming meetings</h1>
		<p class="subtitle">There are <b>X</b> meetings you can attend.</p>
		<section class="block">
			<h2 class="title is-3">Meetings you're hosting</h2>
			<meeting-list is-host></meeting-list>
			<div class="columns">
				<div class="column has-text-right">
					<button class="button is-primary">Schedule / Host a new Meeting</button>
				</div>
			</div>
		</section>
		<section class="block">
			<h2 class="title is-3">Meetings hosted by others</h2>
			<meeting-list></meeting-list>
		</section>
	</div>
</template>

<script type="text/javascript">
	import MeetingList from '@/components/MeetingList.vue'

	export default {
		components: {
			MeetingList
		}
	}

</script>