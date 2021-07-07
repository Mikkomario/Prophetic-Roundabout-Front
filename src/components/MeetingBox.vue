<template>	
	<div class="box block">
		<h3 class="title is-4">Meeting Name @ Prophetic Roundabout</h3>
		<div class="block">
			<span class="is-size-5">Thursday 27th at 05:00 PM</span><br>
			By Host
		</div>
		<div class="block">
			<a class="is-link">Show more</a>
		</div>
		<div class="block">
			<b>Meeting ID:</b> 1231234214<br>
			<b>Password:</b> 12312
		</div>
		<div class="block">
			<a class="is-link">Invite via email</a>, 
			<a class="is-link">copy invitation</a> or 
			<a class="is-link">copy invite link</a>
			<form class="block">
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
			<a class="is-link">Show less</a>
		</div>
		<div class="columns is-centered">
			<div class="column has-text-right">
				<button class="button is-primary" style="min-width: 33%">Start</button>	
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	export default {
		props: {
			// Whether you're the host of these meetings. Default = false.
			isHost: {
				type: Boolean, 
				default: false
			}
		}
	}
</script>