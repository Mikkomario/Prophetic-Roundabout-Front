import { createStore } from 'vuex'
import { Option, Some, None } from '@/classes/Option'
import { Vector } from '@/classes/Vector'
import { Roundabout } from '@/classes/Roundabout'

const millisToSeconds = 1000;
const millisToHours = 60 * 60 * millisToSeconds;
function secondsSince(date) { return Math.floor(date - new Date()) / millisToSeconds }
function hoursSince(date) { return Math.floor(date - new Date()) / millisToHours }

export default createStore({
	state: {
		serverAddress: "", 

		// Reads email, sessionKey and sessionStart from local storage
		email: new Option(localStorage.email), 
		sessionKey: new Option(localStorage.sessionKey), 
		sessionStart: new Option(localStorage.sessionStart).map(dateNumber => new Date(parseInt(dateNumber, 10))), 

		myRoundabouts: Vector.empty, 
		myRoundaboutsUpdate: None
	}, 
	getters: {
		// Returns whether a session should still be open (unless closed on server side)
		isSessionOpen: state => {
			return state.sessionStart.exists(start => hoursSince(start) < 21);
		}, 
		// Returns the session key as a Authorization header value (bearer). Empty string if no session is open.
		authorizationHeader: state => {
			return state.sessionKey.match(key => 'Bearer ' + key, () => "");
		}, 

		// Checks whether roundabout data was updated within the last 60 seconds
		updatedRoundaboutsRecently: state => {
			return state.myRoundaboutsUpdate.exists(update => secondsSince(update) <= 60);
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
			state.sessionStart = Some(start);
			localStorage.sessionStart = start.getTime();
		}, 
		setServerAddress(state, address) { state.serverAddress = address }, 
		// Updates myRoundabouts, as well as the last update time for that value
		setMyRoundabouts(state, roundabouts) {
			state.myRoundabouts = roundabouts;
			state.myRoundaboutsUpdate = Some(new Date());
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
						payload.headers = { 'If-Modified-Since': t.toUTCString() };
					else
						payload.headers['If-Modified-Since'] = t.toUTCString();
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
