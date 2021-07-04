import { Iterator } from './Iterator'
import { Iterable } from './Iterable'
import { Some, None } from './Option'

class IndexIterator extends Iterator {
	constructor(get, length = 0, start = 0) {
		super();
		this._source = get;
		this._length = length;
		this._nextIndex = start;
	}

	// Implemented
	get hasNext() { return this._nextIndex < this._length }
	next() { 
		const result = this._source(this._nextIndex);
		this._nextIndex += 1;
		return result;
	}
}

// An immutable list / indexed array of items
export class Vector extends Iterable {
	// Creates a new Vector. Expects an array to wrap or an item to wrap in an array.
	constructor(array = []) {
		super();
		this._array = Array.isArray(array) ? array : [array];
		this._size = this._array.length;
	}

	// An empty vector
	static empty = new Vector();

	// Implemented
	iterator() { 
		const that = this;
		function f(i) { return that.get(i); }
		return new IndexIterator(f, this.size) 
	}

	// Number of items in this vector
	get size() { return this._size }
	get nonEmpty() { return this.size > 0 }
	// The first item in this vector
	get head() { return this._array[0]; }
	get headOption() {
		if (this.nonEmpty)
			return Some(this.head);
		else
			return None;
	}

	// Retrieves an item at the specified index
	get(index) { return this._array[index]; }
	// Retrieves an item at the specified index. Returns None if there is no such item.
	option(index) {
		if (index < 0 || index >= this.size)
			return None;
		else
			return Some(this.get(index));
	}

	filter(f) { return new Vector(this.filterWith(f)); }
	filterNot(f) { return this.filter(a => !f(a)); }

	map(f) { return new Vector(this.mapWith(f)); }
	flatMap(f) { return new Vector(this.flatMapWith(f)); }
}