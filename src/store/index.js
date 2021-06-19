import { createStore } from 'vuex'
import { Option, Some } from '@/classes/Option'

const millisToHours = 60 * 60 * 1000;
function hoursSince(date) { return Math.floor(date - new Date()) / millisToHours }

export default createStore({
	state: {
		// Reads email, sessionKey and sessionStart from local storage
		email: new Option(localStorage.email), 
		sessionKey: new Option(localStorage.sessionKey), 
		sessionStart: new Option(localStorage.sessionStart).map(dateNumber => new Date(dateNumber))
	}, 
	getters: {
		// Returns whether a session should still be open (unless closed on server side)
		isSessionOpen: state => {
			return sessionStart.exists(start => hoursSince(start) < 22);
		}, 
		// Returns the session key as a Authorization header value (bearer). Empty string if no session is open.
		authorizationHeader: state => {
			return state.sessionKey.match(key => 'Bearer ' + key, () => "");
		}
	}
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
			sessionStart = Some(start);
			localStorage.sessionStart = start.getTime();
		}
	},
	actions: {

	},
	modules: {

	}
})
