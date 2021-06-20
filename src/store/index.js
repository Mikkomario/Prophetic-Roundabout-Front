import { createStore } from 'vuex'
import { Option, Some } from '@/classes/Option'

const millisToHours = 60 * 60 * 1000;
function hoursSince(date) { return Math.floor(date - new Date()) / millisToHours }

export default createStore({
	state: {
		serverAddress: "", 
		// Reads email, sessionKey and sessionStart from local storage
		email: new Option(localStorage.email), 
		sessionKey: new Option(localStorage.sessionKey), 
		sessionStart: new Option(localStorage.sessionStart).map(dateNumber => new Date(parseInt(dateNumber, 10)))
	}, 
	getters: {
		// Returns whether a session should still be open (unless closed on server side)
		isSessionOpen: state => {
			return state.sessionStart.exists(start => hoursSince(start) < 21);
		}, 
		// Returns the session key as a Authorization header value (bearer). Empty string if no session is open.
		authorizationHeader: state => {
			return state.sessionKey.match(key => 'Bearer ' + key, () => "");
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
		setServerAddress(state, address) { state.serverAddress = address }
	},
	actions: { 
		// Performs a GET request to the specified path on the back end server
		// Uses session key authorization
		// Returns Promise[Response]
		get(context, path) {
			if (context.getters.isSessionOpen)
				return fetch(context.state.serverAddress + path, { 
					headers: { 'Authorization': context.getters.authorizationHeader }
				});
			else
				return Promise.reject(new Error("No user session open"));
		}, 
		// Performs a GET request to the specified path on the back end server and parses response to json
		// Expects an OK response (200-299)
		// Uses session key authorization
		// Returns Promise[JSON]
		getJson({ dispatch }, path) {
			return dispatch('get', path).then(response => {
				if (response.ok)
					return response.json();
				else
					return throw new Error(response.status.toString());
			})
		}, 
		// Performs a POST/PUT/PATCH request to a back end server path with a json body
		// Uses session key authorization
		// Returns Promise[Response]
		push(context, payload) {
			if (context.getters.isSessionOpen) {
				if (payload.path != null && payload.body != null)
					return fetch(payload.path, { 
						method: new Option(payload.method).getOrElse(() => 'POST'), 
						headers: { 
							'Authorization': context.getters.authorizationHeader, 
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
