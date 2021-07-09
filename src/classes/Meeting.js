import { None } from './Option'
// import { Vector } from './Vector'

// Represents a single meeting instance. These classes are meant to be immutable
export class Meeting {
	/*
		id: Int - Id of this meeting
		zoomId: Long - Zoom id of this meeting
		roundabout: Roundabout - The roundabout instance where this meeting is hosted
		name: String - Meeting name / topic
		starts: DateTime - Meeting start time in UTC
		durationMinutes: Int - The estimated duration of this meeting in minutes
		password: String - Password used to access this meeting
		joinUrl - Url link for joining this meeting
		host: Option[Object] - the host (user) of this meeting (with properties id, email and name) 
			- None for meetings hosted by the current user
		*/
	constructor(id, zoomId, roundabout, name, starts, durationMinutes, password, joinUrl, host = None) {
		this.id = id;
		this.zoomId = zoomId;
		this.host = host;
		this.roundabout = roundabout;
		this.name = name;
		this.starts = starts;
		this.durationMinutes = durationMinutes;
		this.password = password;
		this.joinUrl = joinUrl;
	}

	// Ending time of this meeting
	get ends() { return new Date(this.starts + this.durationMinutes * 60 * 1000) }

	// Properties for status
	get hasStarted() { return new Date() > this.starts }
	get hasEnded() { return new Date() > this.ends }
	get isInProgress() { return this.hasStarted && !this.hasEnded }

	get hostId() { return this.host.map(h => h.id) }
	get hostName() { return this.host.map(h => h.name) }

	/*
	get invitationLines(inviterName) { 
		const hostPart = host.match(h => ` by ${h.name}`, () => '');
		return new Vector([
			`${inviterName} invites you to ${this.name} at ${this.roundabout.name}${hostPart}`, 
			`Meeting starts at `
		]) 
	}*/
}