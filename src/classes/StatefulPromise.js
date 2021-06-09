import { None, Some } from './Option'
import { Success, Failure } from './Try'

// A wrapper for Promise that also tracks state (isCompleted & result) which is accessible from outside
export class StatefulPromise {
	constructor(wrapped) {
		this.result = None;
		this.wrapped = wrapped;
		// Updates the state when the wrapped promise completes
		wrapped.then(
			success => {
				if (success instanceof Try)
					this.result = Some(success);
				else
					this.result = Some(Success(success));
			}, error => this.result = Some(Failure(error)));
	}

	// Wraps a rejected promise
	static reject(error) { return new StatefulPromise(Promise.reject(error)) }
	// Wraps a resolved promise
	static resolve(f) { return new StatefulPromise(Promise.resolve(f)) }

	// Current success, if one is available
	get success() { return this.result.flatMap(r => r.success); }
	// Current failure, if one is available
	get failure() { return this.result.flatMap(r => r.failure); }
	// Whether this promise has completed already
	get isCompleted() { return this.result.isDefined }
	get isPending() { return !this.isCompleted }
	get isSuccess() { return this.success.isDefined }
	get isFailure() { return this.failure.isDefined }

	// Provides access to wrapped promise's methods
	// NB: If the wrapped promise returns a Failure as resolve, handles that as a rejection
	then(onResolve = function(r) { return r }, onReject = function(e) { throw e }) { return this.wrapped.then(resolve => {
		if (resolve instanceof Try)
			resolve.match(s => onResolve(s), e => onReject(e));
		else
			onResolve(resolve);
	}, onReject) };
	catch(f) { return this.wrapped.catch(f) };
	// Passed function should accept a Try
	finally(f) { return this.wrapped.then(s => {
		if (s instanceof Try)
			f(s);
		else
			f(Success(s));
	}, e => f(Failure(e))) }

	// Same as .then, but wraps the result in a stateful promise
	thenWithState(onResolve, onReject) { return new StatefulPromise(this.then(onResolve, onReject)); }


	// All map functions accept either a Try or a success value. You can also throw in order to get a failure.
	// Maps the result (Success or Failure) of this promise
	map(f) { return new StatefulPromise(this.finally(f)); }
	// Maps the successful result of this promise
	mapSuccess(f) { return this.thenWithState(f) }
	// Maps the failure result of this promise
	mapFailure(f) { return new StatefulPromise(this.catch(f)) }
}

// Wraps a value, function or a promise into a stateful promise
export function Stateful(p) {
	if (p instanceof Promise)
		return new StatefulPromise(p);
	else if (p instanceof Try)
		return p.match(s => StatefulPromise.resolve(s), e => StatefulPromise.reject(e));
	else if (typeof p === 'function')
		return StatefulPromise.resolve(p());
	else
		return StatefulPromise.resolve(p);
}