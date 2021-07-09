import { Duration, weeks, days, hours, minutes, seconds, millis } from '@/classes/Duration'

describe('Duration', () => {
	test('constructor', () => {
		expect(new Duration(1000).toMillis).toBe(1000);
		expect(new Duration(new Date(1000)).toMillis).toBe(1000);
	})

	test('utility constructors', () => {
		expect(weeks(3).toWeeks).toBe(3);
		expect(days(3).toDays).toBe(3);
		expect(hours(3).toHours).toBe(3);
		expect(minutes(3).toMinutes).toBe(3);
		expect(seconds(3).toSeconds).toBe(3);
		expect(millis(3).toMillis).toBe(3);
	})

	test('unit conversions', () => {
		const small = seconds(1);
		const medium = hours(1);
		const large = weeks(1);

		expect(small.toMillis).toBe(1000);
		expect(medium.toMinutes).toBe(60);
		expect(medium.toSeconds).toBe(3600);
		expect(large.toDays).toBe(7);
		expect(days(2).toHours).toBe(48);
		expect(millis(1000).toSeconds).toBe(1);
	})

	test('sign', () => {
		const nega = seconds(-1);
		const posi = seconds(1);

		expect(nega.isNegative).toBe(true);
		expect(nega.isPositive).toBe(false);
		expect(nega.isZero).toBe(false);

		expect(posi.isNegative).toBe(false);
		expect(posi.isPositive).toBe(true);
		expect(posi.isZero).toBe(false);

		expect(Duration.zero.isNegative).toBe(false);
		expect(Duration.zero.isPositive).toBe(false);
		expect(Duration.zero.isZero).toBe(true);
	})

	test('comparison', () => {
		expect(seconds(2) > seconds(1)).toBe(true);
		expect(seconds(1) > Duration.zero).toBe(true);
		expect(Duration.zero < seconds(2)).toBe(true);
		expect(seconds(1) > seconds(2)).toBe(false);
		expect(seconds(2) < seconds(1)).toBe(false);
	})

	test('plus', () => {
		expect(seconds(1).plus(seconds(1)).toSeconds).toBe(2);
		expect(millis(300).plus(300).toMillis).toBe(600);
		expect(seconds(1).plus(seconds(-1)).isZero).toBe(true);
	})
	test('minus', () => {
		expect(seconds(1).minus(seconds(1)).isZero).toBe(true);
		expect(millis(600).minus(300).toMillis).toBe(300);
		expect(seconds(1).minus(seconds(-1)).toSeconds).toBe(2);
	})

	test('full accessors', () => {
		expect(millis(1256).toFullSeconds).toBe(1);
		expect(seconds(128).toFullMinutes).toBe(2);
		expect(minutes(50).toFullHours).toBe(0);
		expect(minutes(60).toFullHours).toBe(1);
		expect(hours(30).toFullDays).toBe(1);
		expect(days(22).toFullWeeks).toBe(3);
	})
	test('part accessors', () => {
		expect(millis(1256).millisPart).toBe(256);
		expect(seconds(128).secondsPart).toBe(8);
		expect(minutes(50).minutesPart).toBe(50);
		expect(minutes(60).minutesPart).toBe(0);
		expect(hours(30).hoursPart).toBe(6);
		expect(days(22).daysPart).toBe(1);
	})

	test('is', () => {
		expect(Duration.zero.isMillis).toBe(false);
		expect(millis(3).isMillis).toBe(true);
		expect(millis(700).isSeconds).toBe(false);
		expect(millis(3000).isSeconds).toBe(true);
		expect(minutes(5).isMinutes).toBe(true);
		expect(seconds(50).isMinutes).toBe(false);
		expect(minutes(70).isHours).toBe(false);
		expect(hours(3).isHours).toBe(true);
		expect(hours(24).isDays).toBe(false);
		expect(days(3).isDays).toBe(true);
		expect(days(4).isWeeks).toBe(false);
		expect(days(20).isWeeks).toBe(true);
	})
})