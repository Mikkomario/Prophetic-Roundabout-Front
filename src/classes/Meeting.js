import { None } from './Option'
import { Now } from './RichDate'
import { minutes } from './Duration'
import { Vector } from './Vector'

// Represents a single meeting instance. These classes are meant to be immutable
export class Meeting {
	/*
		id: Int 				- Id of this meeting
		zoomId: Long 			- Zoom id of this meeting
		roundabout: Roundabout 	- The roundabout instance where this meeting is hosted
		name: String 			- Meeting name / topic
		startTime: RichDate 	- Meeting start time
		duration: Duration 		- The estimated duration of this meeting in minutes
		password: String 		- Password used to access this meeting
		joinUrl 				- Url link for joining this meeting
		host: Option[Object] 	- the host (user) of this meeting (with properties id, email and name) 
								  None for meetings hosted by the current user
	*/
	constructor(id, zoomId, roundabout, name, startTime, duration, password, joinUrl, host = None) {
		this.id = id;
		this.zoomId = zoomId;
		this.host = host;
		this.roundabout = roundabout;
		this.name = name;
		this.startTime = startTime;
		this.duration = duration;
		this.password = password;
		this.joinUrl = joinUrl;
	}

	// Ending time of this meeting
	get endTime() { return this.startTime.plus(this.duration); }

	// Properties for status
	get hasStarted() { return this.startTime < Now }
	get hasEnded() { return this.endTime < Now }
	get isInProgress() { return this.hasStarted && !this.hasEnded }
	// Meeting is joinable 30 minutes before start and until the end of the meeting
	get isJoinable() { return !this.hasEnded && Now > this.startTime.plus(minutes(30)) }
	// Meeting is startable 60 minutes before start and after 60 minutes of ending the meeting
	get isStartable() { return (Now < this.endTime.plus(minutes(60))) && (Now > this.startTime.minus(minutes(60))) }

	get hostId() { return this.host.map(h => h.id) }
	get hostName() { return this.host.map(h => h.name) }

	get invitationLines() { 
		const hostPart = this.host.match(h => ` by ${h.name}`, () => '');
		return new Vector([
			`I'm inviting you to ${this.name} @ ${this.roundabout.name}${hostPart}`, 
			`The meeting starts at ${this.startTime.timeString} on ${this.startTime.dateString} (${this.startTime.timeZone})`, 
			'', 
			`Join via Zoom with this information:`, 
			`Meeting ID: ${this.zoomId}`, 
			`Meeting Password: ${this.password}`, 
			'', 
			'Or use this link:', 
			this.joinUrl
		]) 
	}
}