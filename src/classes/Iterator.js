// import { Some, None } from './Option'

// A common abstract class for all iterators (have hasNext and next())
export class Iterator {

	// Abstract methods
	get hasNext() { throw new Error(".hasNext not implemented") }
	next() { throw new Error(".next() not implemented") }

	// Concrete methods

	// Next item as an option. None when this iterator has reached its end.
	/*
	get nextOption() {
		if (this.hasNext)
			return Some(this.next());
		else
			return None;
	}*/

	// Calls the specified function for all items in this iterator
	foreach(f) {
		while (this.hasNext) {
			f(this.next());
		}
	}


	// To support javascript iterator & iterable (return in [Symbol.iterator]())
	get symbol() {
		const that = this;
		return {
			next: function() {
				if (that.hasNext)
					return { value: that.next() };
				else
					return { done: true };
			}
		}
	}
}