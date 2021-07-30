import { Iterator } from './Iterator'
import { Iterable } from './Iterable'
import { Option } from './Option'

class PairIterator extends Iterator {
	constructor(first, second) {
		super();
		this._first = first;
		this._second = second;
		this._nextIndex = 0;
	}

	// Implemented
	get hasNext() { return this._nextIndex < 2 }
	next() {
		const idx = this._nextIndex;
		this._nextIndex += 1;

		if (idx == 0)
			return this._first;
		else if (idx == 1)
			return this._second;
		else
			throw new Error('No more items to return in next() in PairIterator')
	}
}

// A simple class that consists of two values
export class Pair extends Iterable {
	constructor(first, second) {
		super();
		this._first = first;
		this._second = second;
	}

	// The first value in this pair
	get first() { return this._first }
	// The second value in this pair
	get second() { return this._second } 

	get reverse() { return new Pair(this.second, this.first) }

	// Implemented
	iterator() { return new PairIterator(this.first, this.second); }
	toString() { return `(${this.first}, ${this.second})` }
	map(f) { return new Pair(f(this.first), f(this.second)); }
	find(f) { return new Option(this._find(f)); }

	withFirst(first) { return new Pair(first, this.second) }
	withSecond(second) { return new Pair(this.first, second) }

	mapFirst(f) { return this.withFirst(f(this.first)); }
	mapSecond(f) { return this.withSecond(f(this.second)); }
}