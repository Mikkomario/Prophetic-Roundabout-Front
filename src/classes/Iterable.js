// A simple builder class
// Builders have methods add(item) and result() which builds the complete item
class ArrayBuilder {
	constructor() {
		this._buffer = [];
	}

	add(item) {
		this._buffer.push(item);
	}
	result() {
		const r = this._buffer;
		this._buffer = [];
		return r;
	}
}

// A common abstract class for all items that can be iterated
export class Iterable {
	
	// Abstract methods
	iterator() { throw new Error(".iterator() is not implemented") }

	// Concrete methods

	// Whether this iterable contains any items
	get nonEmpty() { return this.iterator().hasNext }
	// Whether this iterable is empty
	get isEmpty() { return !this.nonEmpty }

	// The first item in this iterable
	get head() { return this.iterator().next }

	// An array with the contents of this iterable item
	get toArray() {
		const array = [];
		this.foreach(a => array.push(a));
		return array;
	}

	// Calls the specified function for each item
	foreach(f) { this.iterator().foreach(f); }

	// Checks whether there exists a value in this collection 
	// that fulfils the specified condition
	// f should accept value and return true or false
	exists(f) {
		const iter = this.iterator();
		let found = false;

		while (!found && iter.hasNext) {
			found = f(iter.next());
		}

		return found;
	}
	// Checks whether the specified function returns true 
	// for all (0-1) value(s) of this option
	// f should accept value and return true or false
	forall(f) {
		return !this.exists(a => !f(a));
	}

	// Checks whether the value equals another
	contains(a) { return this.exists(v => v == a) }

	// Maps the contents of this iterable item into another iterable item
	mapWith(f, builder = new ArrayBuilder()) {
		this.foreach(a => builder.add(f(a)));
		return builder.result();
	}
	/* TODO: Continue
	flatMapWith(f, builder = new ArrayBuilder()) {

	}*/

	// Support for JS iteration
	[Symbol.iterator]() { return this.iterator().symbol }
}