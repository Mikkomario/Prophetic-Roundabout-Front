<template>
	<div class="block">
		<h1 class="title is-2">Schedule a new meeting</h1>
		<div class="card block">
			<div class="card-content">
				<form>
					<label class="label">Roundabout</label>
					<div class="field is-grouped">
						<p class="control">
							<span class="select" :class="{ 'is-danger': roundaboutFlag }">
								<select v-model="selectedRoundaboutId">
									<option disabled value="-1">Please select one</option>
									<option v-for="roundabout of roundabouts" :key="roundabout.id" :value="roundabout.id">{{ roundabout.name }}</option>
								</select>
							</span>
						</p>
						<p class="control">
							<a class="button is-info is-outlined">Create New</a>
						</p>
					</div>
					<div class="field">
						<label class="label">Meeting Name</label>
						<div class="control">
							<input class="input" type="text" v-model="nameField.text" :class="{ 'is-danger': nameField.flag }">
						</div>
						<p class="help is-danger" v-if="nameField.flag">
							This field is required
						</p>
					</div>
					<div class="field">
						<label class="label">Meeting Date & Time</label>
						<p class="control">
							<button ref="trigger" type="button">TEST</button>
						</p>
						<p class="help">Please provide the time value in your local time zone</p>
					</div>
					<div class="field is-grouped">
						<p class="control">
							<button class="button is-primary" :class="{ 'is-loading': isLoading }" @click.prevent="schedule()">Save & Close</button>
						</p>
						<p class="control">
							<button class="button is-light" @click.prevent="cancel()">Cancel</button>
						</p>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import bulmaCalendar from 'bulma-calendar';
	import { mapActions } from 'vuex'
	import { Vector } from '@/classes/Vector'
	import { Field } from '@/classes/Field'

	export default {
		data() {
			return {
				roundabouts: Vector.empty, 
				selectedRoundaboutId: -1, 
				roundaboutFlag: false, 
				date: new Date(), 
				nameField: Field.empty(true), 
				isLoading: false, 
				errorMessage: ''
			}
		}, 
		computed: {
			isFailed() { return this.errorMessage != '' }
		}, 
		watch: {
			selectedRoundaboutId: function(newId) {
				if (newId > 0)
					this.roundaboutFlag = false;
			}
		}, 
		methods: {
			schedule() {
				if (this.nameField.test()) {
					if (this.selectedRoundaboutId > 0) {
						this.roundaboutFlag = false;

						this.isLoading = true;
						/*
						const that = this;
						this.push({
							path: `organizations/${this.selectedRoundaboutId}/meetings`, 
							body: {
								"name": this.nameField.text, 
								"start_time_local": ""
							}
						})*/
					}
					else {
						this.roundaboutFlag = true;
						this.errorMessage = 'Please select the Roundabout that you want to host';
					}
				}
			}, 
			cancel() {
				console.log('Cancelling')
				// TODO: Navigate to meeting view
			}, 

			...mapActions(['myRoundabouts', 'push'])
		}, 
		created() {
			// Retrieves an up-to-date list of user's roundabouts
			const that = this;
			this.myRoundabouts().then(res => {
				const filtered = res.filter(r => r.isHostable);
				/*
				console.log(res.size + ' -> ' + filtered.size);
				res.foreach(r => { 
					console.log(r.name + ': ' + r.isHostable + ', ' + r.taskIds.size) 
					r.taskIds.foreach(id => console.log(id + ': ' + (typeof id)))
				})*/
				that.roundabouts = filtered;
				// May select the only roundabout option
				if (filtered.size == 1)
					this.selectedRoundaboutId = filtered.head.id;
			}, e => console.log(e));
		}, 
		mounted() {
			// Sets up the calendar component
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