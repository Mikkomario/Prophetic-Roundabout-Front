import { Duration, hours, minutes, seconds, millis } from './Duration'

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function localTimeZone() { return Intl.DateTimeFormat().resolvedOptions().timeZone }

// A date wrapper class with extended features
class DateLike {
	// Intended to be overwritten
	get toDate() { return new Date() }

	get toNewDate() { return new Date(this.toDate.getTime()) }
	get toJson() { return this.toDate.toISOString() }
	get toHeaderValue() { return this.toDate.toUTCString() }

	valueOf() { return this.toDate.valueOf() }
	equals(other) { return this.valueOf() == other.valueOf() }
	toString() { 
		if (this.hasTime)
			return `${this.dateString} ${this.timeString} (${this.timeZone})`
		else
			return this.dateString;
	}

	// Getters for days, weekdays, months, and years
	get dayOfWeekIndex() { return this.toDate.getDay() }
	get dayOfWeekName() { return dayNames[this.dayOfWeekIndex] }
	get dayOfMonth() { return this.toDate.getDate() }
	get dayOfMonthString() {
		const day = this.dayOfMonth;
		if (day == 1)
			return `${day}st`;
		else if (day == 2)
			return `${day}nd`;
		else if (day == 3)
			return `${day}rd`;
		else
			return `${day}th`
	}
	get monthIndex() { return this.toDate.getMonth() }
	get monthName() { return monthNames[this.monthIndex] }
	get year() { return this.toDate.getFullYear() }
	get dateString() {
		// Uses different formatting based on context
		// Case: Past time
		if (this.isInPast) {
			const days = this.durationInPast.toDays
			// Case: Far in the past
			if (days > 6)
				return `${this.dayOfMonthString} of ${this.monthName} ${this.year}`
			// Case: Very close in the past
			else if (days < 2)
				return `${this.dayOfWeekName} ${this.dayOfMonthString} of ${this.monthName}`
			// Case: In recent past
			else
				return `${this.dayOfWeekName} ${this.dayOfMonthString} of ${this.monthName} ${this.year}`
		}
		else {
			if (this.durationInFuture.toDays > 6) {
				// Case: Further in the same year
				if (this.year == new Date().getFullYear)
					return `${this.dayOfMonthString} of ${this.monthName}`
				// Case: In a future year
				else
					return `${this.dayOfMonthString} of ${this.monthName} ${this.year}`
			}
			// Case: In close future
			else
				return `${this.dayOfWeekName} ${this.dayOfMonthString} of ${this.monthName}`
		}
	}

	// Getters for time
	get hour() { return this.toDate.getHours() }
	get minute() { return this.toDate.getMinutes() }
	get second() { return this.toDate.getSeconds() }
	get milli() { return this.toDate.getMilliseconds() }
	get hasTime() { return this.hour > 0 || this.minute > 0 }
	// Time in American format (with Midnight and Noon options for clarity). 
	// E.g. '1:15 PM'm '12:05 Midnight' or '12:45 Noon'
	get timeString() {
		const m = this.minute;
		const mString = m < 10 ? `0${m}` : m.toString();

		const rawHours = this.hour;
		const h = rawHours > 12 ? rawHours - 12 : (rawHours < 1 ? 12 : rawHours);
		
		const endString = rawHours == 0 ? 'Midnight' : (rawHours == 12 ? 'Noon' : (rawHours > 12 ? 'PM' : 'AM'));

		return `${h}:${mString} ${endString}`;
	}
	// Time in military format. E.g. '17:45'
	get militaryTimeString() {
		const h = this.hour;
		const m = this.minute;
		const hString = h < 10 ? `0${h}` : h.toString();
		const mString = m < 10 ? `0${m}` : m.toString();
		return `${hString}:${mString}`
	}
	// Time portion of this date (duration since midnight)
	get time() { return hours(this.hour).plus(minutes(this.minute)).plus(seconds(this.second)).plus(millis(this.milli)) }

	get timeZone() { return localTimeZone() }

	get isInPast() { return this.toDate < new Date() }
	get isInFuture() { return this.toDate > new Date() }
	get durationInPast() { return this.until(new Date()) }
	get durationInFuture() { return this.since(new Date()) }

	hasSameDateAs(other) {
		return this.dayOfMonth == other.dayOfMonth && this.monthIndex == other.monthIndex && this.year == other.year;
	}
	hasSameTimeAs(other) {
		if (other instanceof Duration)
			return this.time.equals(other);
		else
			return this.time.equals(other.time);
	}

	until(date) {
		if (date instanceof DateLike)
			return new Duration(date.toDate - this.toDate);
		else
			return new Duration(date - this.toDate);
	}
	daysUntil(date) { return this.until(date).toDays }
	since(date) {
		if (date instanceof DateLike)
			return new Duration(this.toDate - date.toDate);
		else
			return new Duration(this.toDate - date);
	}
	daysSince(date) { return this.since(date).toDays }

	// Offers limited implementation of these methods 
	// (because new RichDate(...) is not available here)
	minus(date) {
		if (date instanceof DateLike)
			return new Duration(this.toDate - date.toDate);
		else
			return new Duration(this.toDate - date);
	}
}

export class RichDate extends DateLike {
	constructor(wrapped = new Date()) {
		super();
		this._date = wrapped instanceof Date ? wrapped : new Date(wrapped);
	}

	get toDate() { return this._date }

	get isToday() { return this.hasSameDateAs(new RichDate()) }
	get isTomorrow() { return this.hasSameDateAs(new RichDate().tomorrow) }

	get atBeginningOfDay() { return this.minus(this.time); }
	get atEndOfDay() { return this.tomorrow.atBeginningOfDay }
	get tomorrow() { return this.plus(hours(24)) }
	get yesterday() { return this.minus(hours(24)) }

	hasSameDateAs(other) {
		if (other instanceof DateLike)
			return this.dayOfMonth == other.dayOfMonth && this.monthIndex == other.monthIndex && this.year == other.year;
		else
			return this.hasSameDateAs(new RichDate(other));
	}
	hasSameTimeAs(other) {
		if (other instanceof DateLike)
			return this.time.equals(other.time);
		else if (other instanceof Duration)
			return this.time.equals(other);
		else
			return this.hasSameTimeAs(new RichDate(other));
	}

	plus(duration) {
		if (duration instanceof Duration)
			return new RichDate(new Date(this._date.getTime() + duration.toMillis));
		else if (duration instanceof DateLike)
			return new RichDate(new Date(this._date.getTime() + duration.toDate));
		else
			return new RichDate(new Date(this._date.getTime() + duration));	
	}
	minus(duration) {
		if (duration instanceof Duration)
			return new RichDate(new Date(this._date.getTime() - duration.toMillis));
		else if (duration instanceof DateLike)
			return new Duration(this._date.getTime() - duration.toDate);
		else if (duration instanceof Date)
			return new Duration(this._date.getTime() - duration);
		else
			return new RichDate(new Date(this._date.getTime() - duration));
	}

	before(other) {
		if (other instanceof Duration)
			return new RichDate(this._date - other.toMillis);
		else if (other instanceof DateLike)
			return new Duration(other.toDate - this._date);
		else if (other instanceof Date)
			return new Duration(other - this._date);
		else
			return new RichDate(this._date - other);
	}
	after(other) {
		if (other instanceof Duration)
			return new RichDate(this._date + other.toMillis);
		else if (other instanceof DateLike)
			return new Duration(this._date - other.toDate);
		else if (other instanceof Date)
			return new Duration(this._date - other);
		else
			return new RichDate(this._date + other);
	}
}

class CurrentDate extends DateLike {
	get isInPast() { return false }
	get isInFuture() { return false }

	// Converts this fluctuing date to a static date
	get static() { return new RichDate(this.toDate) }

	// Delegates some methods to the RichDate class
	get atBeginningOfDay() { return this.static.atBeginningOfDay }
	get atEndOfDay() { return this.static.atEndOfDay }

	plus(duration) { return this.static.plus(duration) }
	minus(duration) { return this.static.minus(duration) }

	before(other) { return this.static.before(other) }
	after(other) { return this.static.after(other) }
}

export const Now = new CurrentDate();