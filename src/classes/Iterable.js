// Abstract class
// Builders must implement addOne(...) and result()
export class Builder {
	addOne(item) { throw new Error('.addOne(...) is not implemented') }
	result() { throw new Error('.result() is not implemented') }

	// Adds possibly multiple items to this builder
	add(item) {
		if (item.foreach !== undefined)
			item.foreach(a => this.addOne(a));
		else if (Array.isArray(item))
			item.forEach(a => this.addOne(a));
		else
			this.addOne(item);
	}
}

// A simple builder class
// Builders have methods add(item) and result() which builds the complete item
export class ArrayBuilder extends Builder {
	constructor() {
		super();
		this._buffer = [];
	}

	addOne(item) {
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
	get head() { return this.iterator().next() }

	// An array with the contents of this iterable item
	get toArray() { return this.iterator().toArray }

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

	// Converts this collection to another form using the specified builder parameter
	// The builder should have methods .addOne(item) and .result()
	to(builder = new ArrayBuilder) { return this.iterator().to(builder) }

	// Only keeps items that are accepted by the specified filter function
	filterWith(f, builder = new ArrayBuilder()) {
		this.foreach(a => {
			if (f(a))
				builder.addOne(a);
		})
		return builder.result();
	}

	// Maps the contents of this iterable item into another iterable item
	mapWith(f, builder = new ArrayBuilder()) {
		this.foreach(a => builder.addOne(f(a)));
		return builder.result();
	}
	// Maps the contents of this iterable item into another iterable item. Flattens in between.
	flatMapWith(f, builder = new ArrayBuilder()) {
		this.foreach(a => {
			const items = f(a);
			if (items instanceof Iterable)
				items.foreach(item => builder.addOne(item));
			else if (Array.isArray(items))
				items.forEach(item => builder.addOne(item));
			else
				builder.addOne(items);
		});
		return builder.result();
	}
	// Flattens Iterable[Iterable] to just Iterable
	fattenWith(builder = new ArrayBuilder) {
		this.foreach(a => {
			if (a instanceof Iterable)
				a.foreach(item => builder.addOne(item));
			else if (Array.isArray(a))
				a.forEach(item => builder.addOne(item));
			else
				builder.addOne(a);
		})
		return builder.result();
	}
	// Maps the items in this iterable asynchronously (using await)
	async asyncMapWith(f, builder = new ArrayBuilder()) {
		const iter = this.iterator();
		while (iter.hasNext) {
			// Wraps the result into a promise to make sure it can be awaited
			const mapResult = Promise.resolve(f(iter.next()));
			const waitResult = await mapResult;
			builder.addOne(waitResult);
		}
		return builder.result();
	}

	// Support for JS iteration
	[Symbol.iterator]() { return this.iterator().symbol }

	// Returns the first item that satisfies the specified search condition
	// An implementation of find which doesn't return an option (because of dependency problems)
	// This method is intended for subclass use, so that they can provide a finalized implementation
	_find(f) {
		const iter = this.iterator();
		let result = null;

		while (result == null && iter.hasNext) {
			const next = iter.next();
			if (f(next))
				result = next;
		}

		return result;
	}
}