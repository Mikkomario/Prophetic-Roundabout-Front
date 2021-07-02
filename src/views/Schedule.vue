<template>
	<div class="block">
		<h1 class="title is-2">Schedule a new meeting</h1>
		<div class="card block">
			<div class="card-content">
				<form>
					<label class="label">Roundabout</label>
					<div class="field is-grouped">
						<p class="control">
							<span class="select">
								<select>
									<option>Example option</option>
								</select>
							</span>
						</p>
						<p class="control">
							<a class="button is-info is-outlined">Create New</a>
						</p>
					</div>
					<div class="field">
						<label class="label">Meeting Name</label>
						<input class="input" type="text">
					</div>
					<div class="field">
						<label class="label">Meeting Date & Time</label>
						<p class="control">
							<button ref="trigger" type="button">TEST</button>
						</p>
						<p class="help">In your local time</p>
					</div>
					<div class="field is-grouped">
						<p class="control">
							<button class="button is-primary">Submit</button>
						</p>
						<p class="control">
							<button class="button is-light">Cancel</button>
						</p>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import bulmaCalendar from 'bulma-calendar';

	export default {
		data() {
			return {
				date: new Date()
			}
		}, 
		mounted() {
			const calendar = new bulmaCalendar(this.$refs.trigger, {
				startDate: this.date, 
				dateFormat: 'dd.MM.yyyy', 
				showHeader: false, 
				showTodayButton: false, 
				showClearButton: false, 
				validateLabel: 'OK'
			})
			calendar.on('select', e => {
				this.date = e.data.time
				console.log(e);
				console.log(this.date);
			})
		}
	}
</script>