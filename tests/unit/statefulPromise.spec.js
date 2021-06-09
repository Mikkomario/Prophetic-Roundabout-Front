import { StatefulPromise, Stateful } from '@/classes/StatefulPromise'
import { Failure } from '@/classes/Try'

describe('StatefulPromise', () => {
	const testError = new Error("test");
	function delaySuccess(s) { return new Promise(resolve => setTimeout(() => resolve(s), 100)) }
	function delayFailure(error = testError) { return new Promise((undefined, reject) => setTimeout(() => reject(error), 100)) }

	// Delay methods
	test('success test method', () => {
		return expect(delaySuccess(1)).resolves.toBe(1);
	})
	test('failure test method', done => {
		delayFailure().then(() => expect("error").toBe("no error"), () => done());
	})

	// Stateful
	test('Stateful success', done => {
		Stateful(delaySuccess(1)).finally(r => r.match(s => {
			expect(s).toBe(1);
			done();
		}, e => done(e)));
	})
	test('Stateful failure', done => {
		Stateful(delayFailure()).finally(r => {
			expect(r.isFailure).toBe(true);
			done();
		})
	})

	// Result & completion
	test('state', done => {
		const promise = Stateful(delaySuccess(1));
		expect(promise.isCompleted).toBe(false);
		expect(promise.isPending).toBe(true);
		expect(promise.result.isEmpty).toBe(true);
		expect(promise.success.isEmpty).toBe(true);
		expect(promise.failure.isEmpty).toBe(true);
		expect(promise.isSuccess).toBe(false);
		expect(promise.isFailure).toBe(false);

		async function f1() {
			const result = await promise;
			expect(result).toBe(1);
			expect(promise.isCompleted).toBe(true);
			expect(promise.isPending).toBe(false);
			expect(promise.success.isDefined).toBe(true);
			expect(promise.failure.isDefined).toBe(false);
			expect(promise.isSuccess).toBe(true);
			expect(promise.isFailure).toBe(false);
			expect(promise.result.isDefined).toBe(true);

			done();
		}
		f1();
	})

	// Reject & resolve
	test('resolve', done => {
		StatefulPromise.resolve(1).finally(r => r.match(s => {
			expect(s).toBe(1);
			done();
		}, e => done(e)))
	})
	test('reject', done => {
		StatefulPromise.reject(testError).finally(r => r.match(() => expect("success").toBe("no success"), () => done()));
	})

	// Stateful variants
	test('Stateful function', done => {
		Stateful(() => 1).finally(r => r.match(s => {
			expect(s).toBe(1);
			done();
		}, e => done(e)))
	})
	test('Stateful value', done => {
		Stateful(1).finally(r => r.match(s => {
			expect(s).toBe(1);
			done();
		}, e => done(e)));
	})

	// Stateful then
	test('thenWithState', done => {
		const first = Stateful(delaySuccess(1));
		const second = first.thenWithState(i => delaySuccess(i + 1));
		async function f1() {
			const res1 = await first;
			expect(res1).toBe(1);
			expect(second.isCompleted).toBe(false);

			second.finally(r => r.match(s => {
				expect(s).toBe(2);
				done();
			}, e => done(e)))
		}
		f1();
	})

	// Failure resolve handling
	/*
	test('Failure in finally', done => {
		new StatefulPromise(delaySuccess(Failure(testError))).then()
	})*/

	// Maps
	/*
	test('map', done => {
		Stateful(1).map(r => r.map(i => i + 1))
	})*/
})