import { Iterator } from './Iterator'
import { Iterable, Builder } from './Iterable'
import { Some, None, Option } from './Option'

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
	toString() {
		return `[${this.mkString(', ')}]`
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
	get last() { return this._array[this.size - 1] }
	get lastOption() {
		if (this.nonEmpty)
			return Some(this.last);
		else
			return None;
	}

	// Returns a copy of this vector where each item is unique by comparison (==)
	get distinct() { return this.distinctBy((a, b) => a == b); }

	// Constructs a string based on this vector
	mkString(separator = '') {
		if (this.isEmpty)
			return '';
		else {
			let str = '';
			for (let i = 0; i < this.size - 1; i++) {
				str += this.get(i).toString();
				str += separator;
			}
			return str + this.last;
		}
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

	find(f) { return new Option(this._find(f)); }

	filter(f) { return new Vector(this.filterWith(f)); }
	filterNot(f) { return this.filter(a => !f(a)); }

	map(f) { return new Vector(this.mapWith(f)); }
	flatMap(f) { return new Vector(this.flatMapWith(f)); }
	asyncMap(f) { return this.asyncMapWith(f).then(array => new Vector(array)) }

	// Creates a new vector with n items appended, depending on the type of the specified parameter
	// Adding an Iterable item or an Array may add multiple items
	// Adding some other type adds exactly one item
	plus(item) {
		if (item instanceof Vector)
			return new Vector(this._array.concat(item._array));
		else if (item instanceof Iterable) {
			const newArray = this._array.slice();
			item.foreach(a => newArray.push(a));
			return new Vector(newArray);
		}
		else if (Array.isArray(item)) {
			return new Vector(this._array.concat(item));
		}
		else
			return this.plusOne(item);
	}
	// Creates a new vector with exactly one item appended, regardless of type
	plusOne(item) {
		const newArray = this._array.slice();
		newArray.push(item);
		return new Vector(newArray);
	}
	// Creates a new vector with exactly one item prepended, regardless of type
	prependOne(item) {
		const newArray = this._array.slice();
		newArray.unshift(item);
		return new Vector(newArray);
	}

	// Removes items which are considered duplicates by the specified testing function
	// The specified function takes 2 items and returns true or false
	distinctBy(compare) { 
		const array = [];
		this.foreach(a => {
			if (!array.some(a2 => compare(a, a2)))
				array.push(a);
		})
		return new Vector(array);
	}
}

// A builder that exports vectors
export class VectorBuilder extends Builder {
	constructor() {
		super();
		this._array= [];
	}

	// Implemented
	addOne(item) { this._array.push(item); }
	result() {
		const r = new Vector(this._array);
		this._array = [];
		return r;
	}
}