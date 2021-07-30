import { createStore } from 'vuex'
import { Option, Some, None } from '@/classes/Option'
import { Vector } from '@/classes/Vector'
import { RichDate, Now } from '@/classes/RichDate'
import { minutes, seconds } from '@/classes/Duration'
import { Roundabout } from '@/classes/Roundabout'
import { Meeting } from '@/classes/Meeting'

function updatedRecently(lastUpdate, duration = seconds(120)) { return lastUpdate.exists(update => Now.since(update) < duration) }

export default createStore({
	state: {
		serverAddress: "", 

		// Reads email, sessionKey and sessionStart from local storage
		email: new Option(localStorage.email), 
		sessionKey: new Option(localStorage.sessionKey), 
		sessionStart: new Option(localStorage.sessionStart).map(dateNumber => new RichDate(new Date(parseInt(dateNumber, 10)))), 

		myRoundabouts: Vector.empty, 
		myRoundaboutsUpdate: None, 

		myMeetings: {
			hosting: Vector.empty, 
			other: Vector.empty
		}, 
		myMeetingsUpdate: None
	}, 
	getters: {
		// Returns whether a session should still be open (unless closed on server side)
		isSessionOpen: state => {
			return state.sessionStart.exists(start => start.until(Now).toHours < 21.5);
		}, 
		// Returns the session key as a Authorization header value (bearer). Empty string if no session is open.
		authorizationHeader: state => {
			return state.sessionKey.match(key => 'Bearer ' + key, () => "");
		}, 

		// Checks whether roundabout data was updated within the last 60 seconds
		updatedRoundaboutsRecently: state => {
			return updatedRecently(state.myRoundaboutsUpdate);
		}, 
		updatedMeetingsRecently: state => {
			return updatedRecently(state.myMeetingsUpdate);
		}
	}, 
	mutations: {
		// Updates email, session key and session start time. All values are recorded to localStorage also for persistent sessions.
		// Expects payload to contain email + session key
		login(state, payload) {
			const newEmail = payload.email;
			const newKey = payload.sessionKey;

			state.email = Some(newEmail);
			localStorage.email = newEmail;
			state.sessionKey = Some(newKey);
			localStorage.sessionKey = newKey;
			const start = new Date();
			state.sessionStart = Some(new RichDate(start));
			localStorage.sessionStart = start.getTime();
		}, 
		setServerAddress(state, address) { state.serverAddress = address }, 
		// Updates myRoundabouts, as well as the last update time for that value
		setMyRoundabouts(state, roundabouts) {
			state.myRoundabouts = roundabouts;
			state.myRoundaboutsUpdate = Some(Now.static);
		}, 
		setMyMeetings(state, meetings) {
			console.log('Setting my meetings...');
			console.log(meetings);
			state.myMeetings = meetings;
			state.myMeetingsUpdate = Some(Now.static);
		}, 
		// Invalidates meetings so that they will be updated upon next myMeetings() call
		invalidateMeetings(state) {
			state.myMeetingsUpdate = None;
		}
	},
	actions: { 
		// Performs a GET request to the specified path on the back end server
		// Uses session key authorization
		// Parameter can either be a path (String) or Payload (object). Payload supports following properties:
		// - path (required)
		// - headers (object, optional)
		// - style ('simple' | 'full', optional)
		// Returns Promise[Response]
		get({ state, getters }, payload) {
			if (getters.isSessionOpen) {
				// Case: Path is passed as the parameter
				if (typeof payload === 'string')
					return fetch(state.serverAddress + payload, { 
						headers: { 'Authorization': getters.authorizationHeader }
					});
				// Case: Payload is passed as the parameter
				else {
					if (payload.path == null)
						return Promise.reject(new Error('path is a required payload parameter'));
					else {
						// Supports custom headers and the X-Style -parameter
						const headers = {
							'Authorization': getters.authorizationHeader, 
							...payload.headers
						}
						new Option(payload.style).foreach(style => headers['X-Style'] = style);
						return fetch(state.serverAddress + payload.path, {
							headers: headers
						});
					}
				}
			}
			else
				return Promise.reject(new Error("No user session open"));
		}, 
		// Performs a GET request to the specified path on the back end server and parses response to json
		// Expects an OK response (200-299)
		// Uses session key authorization
		// Parameters same as in get
		// Returns Promise[JSON]
		getJson({ dispatch }, payload) {
			return dispatch('get', payload).then(response => {
				if (response.ok)
					return response.json();
				else
					throw new Error(response.status.toString());
			})
		}, 
		// Performs a GET request to a path on the back end server. Expects json result on success
		// Supports a 'since' payload parameter (optional)
		// Successful result is wrapped in an option, containing None if Not Modified was returned
		getJsonIfModified({ getters, dispatch }, payload) {
			if (getters.isSessionOpen) {
				new Option(payload.since).flatten.foreach(t => {
					if (payload.headers == null)
						payload.headers = { 'If-Modified-Since': t.toHeaderValue };
					else
						payload.headers['If-Modified-Since'] = t.toHeaderValue;
				});

				// Performs the GET and handles status 304 (Not Modified)
				return dispatch('get', payload).then(response => {
					if (response.status == 304)
						return None;
					else if (response.ok)
						return response.json().then(json => Some(json));
					else
						throw new Error(response.status.toString());
				});
			}
			else
				return Promise.reject(new Error('No user session open'))
		}, 
		// Performs a POST/PUT/PATCH request to a back end server path with a json body
		// Uses session key authorization
		// Payload consists of:
		// - path (after base uri)
		// - body (object, sent as json) 
		// - method (default = POST)
		// Returns Promise[Response]
		push({ state, getters }, payload) {
			if (getters.isSessionOpen) {
				if (payload.path != null && payload.body != null)
					return fetch(state.serverAddress + payload.path, { 
						method: new Option(payload.method).getOrElse(() => 'POST'), 
						headers: { 
							'Authorization': getters.authorizationHeader, 
							'Content-Type': 'application/json'
						}, 
						body: JSON.stringify(payload.body)
					});
				else
					return Promise.reject(new Error("path and body are required in payload"));
			}
			else
				return Promise.reject(new Error("No user session open"));
		}, 

		// Authenticates the user for a task in a service by redirecting them to an external OAuth process
		// Payload consists of:
		// - serviceId: Int - Id of the targeted service (1 for Zoom, 2 for Google) - May also be a string ('zoom' or 'google')
		// - taskId: Int - Id of the task the user wants to perform
		authenticate({ state, dispatch }, payload) {
			if (payload.serviceId != null && payload.taskId != null) {
				return dispatch('push', {
					path: `services/${payload.serviceId}/auth/preparations`, 
					body: { task_id: payload.taskId }
				}).then(response => {
					if (response.ok)
						return response.json();
					else
						throw new Error(`Authentication preparation failed with error code ${response.status}`);
				}).then(preparationJson => {
					// Redirects the user to the authentication process
					const url = state.serverAddress + `services/${payload.serviceId}/auth?token=${preparationJson.token}`;
					location.href = url
				})
			}
			else
				return Promise.reject(new Error('serviceId and taskId are required in payload'))
		}, 

		// Returns the user's current roundabouts
		// Updates state if necessary
		myRoundabouts({ state, getters, dispatch, commit }) {
			// Case: Can and should fetch new data
			if (getters.isSessionOpen && !getters.updatedRoundaboutsRecently) {
				// Performs the fetch
				return dispatch('getJsonIfModified', {
					path: 'users/me/organizations', 
					since: state.myRoundaboutsUpdate
				}).then(
					result => result.match(
						// Case: New data read => updates cache and returns new data
						json => {
							console.log('Read roundabouts: ' + JSON.stringify(json));
							const roundabouts = new Vector(json.map(a => Roundabout.fromJson(a)));
							commit('setMyRoundabouts', roundabouts);
							return roundabouts;
						}, 
						// Case: Not Modified => returns cached data
						() => state.myRoundabouts
					), 
					// Case: Request failed => logs and returns cached data
					e => {
						console.log(e);
						return state.myRoundabouts;
					}
				)
			}
			// Case: Can't or doesn't need to fetch new data
			else
				return Promise.resolve(state.myRoundabouts);
		}, 
		myMeetings({ state, getters, dispatch, commit }) {
			if (getters.isSessionOpen && !getters.updatedMeetingsRecently) {
				// Performs the fetch
				return dispatch('getJsonIfModified', {
					path: 'users/me/meetings', 
					since: state.myMeetingsUpdate
				}).then(result => result.match(json => {
					// Case: New data read => May need to acquire organization or user data
					const oldMeetings = state.myMeetings.hosting.plus(state.myMeetings.other);
					const hostingMeetings = new Vector(json.hosting);
					const otherMeetings = new Vector(json.other);
					const allMeetings = hostingMeetings.plus(otherMeetings);
					const meetingRoundaboutIds = allMeetings.map(meeting => meeting.host_organization_id).distinct;
					const meetingHostIds = otherMeetings.map(meeting => meeting.host_id).distinct;
					const oldMeetingHostIds = oldMeetings.map(meeting => meeting.host.id).distinct;
					const newHostIds = meetingHostIds.filterNot(id => oldMeetingHostIds.contains(id));

					const roundaboutsPromise = meetingRoundaboutIds.forall(id => state.myRoundabouts.exists(r => r.id == id)) ? 
						Promise.resolve(state.myRoundabouts) : dispatch('myRoundabouts');

					// Combines the data into a new set of meetings, then updates the cache
					return roundaboutsPromise.then(roundabouts => {
						const newUsersPromise = newHostIds.asyncMap(hostId => dispatch('getJson', `users/${hostId}`));
						return newUsersPromise.then(newUsers => {
							const allUsers = oldMeetings.map(m => m.host).distinctBy((a, b) => a.id == b.id).plus(newUsers);
							function roundaboutForId(id) { return roundabouts.find(r => r.id == id) }
							function userForId(id) { return allUsers.find(user => user.id == id) }
							function meetingFromJson(json) { return new Meeting(json.id, json.zoom_id, 
								roundaboutForId(json.host_organization_id).get, json.name, 
								new RichDate(json.start_time), minutes(json.duration_minutes), json.password, json.join_url, userForId(json.host_id)) 
							}

							const newMeetings = {
								hosting: hostingMeetings.map(json => meetingFromJson(json)), 
								other: otherMeetings.map(json => meetingFromJson(json))
							}
							commit('setMyMeetings', newMeetings);
							return newMeetings;
						})
					})

				}, () => state.myMeetings)).catch(e => {
					console.log(e);
					return state.myMeetings;
				})
			}
			else
				return Promise.resolve(state.myMeetings);
		}, 

		// Initializes host server address from a separate config.json file. Should be called only once at application startup.
		init(context) {
			fetch(process.env.BASE_URL + "config.json")
				.then(response => {
					response.json().then(config => {
						context.commit('setServerAddress', config.api_address);
					})
				})
				.catch(error => console.log(error));
		}
	},
	modules: {

	}
})
