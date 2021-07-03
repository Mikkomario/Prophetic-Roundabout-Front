import { Vector } from '@/classes/Vector'

describe('Vector', () => {
	const v = new Vector([1, 2, 3]);

	test('size', () => {
		expect(Vector.empty.size).toBe(0);
		expect(v.size).toBe(3);
	})

	test('empty & nonEmpty', () => {
		expect(Vector.empty.isEmpty).toBe(true);
		expect(Vector.empty.nonEmpty).toBe(false);

		const v = new Vector(1);
		expect(v.isEmpty).toBe(false);
		expect(v.nonEmpty).toBe(true);
	})

	test('head', () => {
		expect(new Vector(1).head).toBe(1);
		expect(new Vector([2, 3, 4]).head).toBe(2);
	})

	test('get', () => {
		expect(v.get(0)).toBe(1);
		expect(v.get(1)).toBe(2);
		expect(v.get(2)).toBe(3);
	})

	test('option', () => {
		const v2 = new Vector([1, 2]);
		expect(v2.option(0).value).toBe(1);
		expect(v2.option(1).value).toBe(2);
		expect(v2.option(2).isDefined).toBe(false);
	})

	test('headOption', () => {
		expect(Vector.empty.headOption.isDefined).toBe(false);
		expect(new Vector(1).headOption.value).toBe(1);
		expect(new Vector([2, 3]).headOption.value).toBe(2);
	})

	test('foreach', () => {
		let sum = 0;
		v.foreach(i => sum += i);
		expect(sum).toBe(6);
	})

	test('forall', () => {
		expect(v.forall(i => i < 4)).toBe(true);
		expect(v.forall(i => i < 2)).toBe(false);
	})

	test('exists', () => {
		expect(v.exists(i => i < 2)).toBe(true);
		expect(v.exists(i => i > 2)).toBe(true);
		expect(v.exists(i => i > 3)).toBe(false);
	})

	test('contains', () => {
		expect(v.contains(1)).toBe(true);
		expect(v.contains(0)).toBe(false);
	})
})