
// An immutable class that handles cases where a value is null
export class Option {
	// Accepts a value and wraps it
	constructor(val) {
		this._value = val;
		this._empty = val == null || val == "";
	}

	// An empty option instance
	static none = new Option(null);
	// A defined option instance (val must not be null)
	static some(val) { return new Option(val) }

	// Value of this option. May be null.
	get value() { return this._value }
	// Returns value of this option. Throws if empty.
	get get() {
		if (this.isEmpty)
			throw new Error("None.get");
		else
			return this.value;
	}
	// Whether this option is empty (null)
	get isEmpty() { return this._empty }
	// Whether this option contains a non-null value
	get nonEmpty() { return !this.isEmpty }
	// Alias for nonEmpty
	get isDefined() { return this.nonEmpty };
	// Transforms Option[Option] to an Option
	get flatten() {
		if (this.isEmpty)
			return this;
		else if (this.value instanceof Option)
			return this.value;
		else
			return this;
	}

	valueOf() { return this._value; }
	equals(other) { return (this.isEmpty && other.isEmpty) || (this.valueOf() === other.valueOf()) }

	// Returns the value of this option or the specified default value (call-by-name)
	getOrElse(def) {
		if (this.isEmpty)
		{
			if (typeof def === 'function')
				return def();
			else
				return def;
		}
		else
			return this.value;
	}
	// Performs a function over the value of this option, 
	// if one is defined
	foreach(f) {
		if (this.nonEmpty)
			f(this.value);
	}
	// Checks whether the specified function returns true 
	// for all (0-1) value(s) of this option
	// f should accept value and return true or false
	forall(f) {
		if (this.isEmpty)
			return true;
		else
			return f(this.value);
	}
	// Checks whether there exists a value in this option 
	// that fulfils the specified condition
	// f should accept value and return true or false
	exists(f) {
		if (this.isEmpty)
			return false;
		else
			return f(this.value);
	}
	// Calls one of the specified functions, based on whether this option is defined or empty
	// Returns the return value of the called function
	match(valueHandler, emptyHandler) {
		if (this.isEmpty)
			return emptyHandler();
		else
			return valueHandler(this.value);
	}
	// Creates a new option based on the value of this option, if one is defined. 
	// Returns an empty option if this option is empty.
	map(f) {
		return this.match(v => new Option(f(v)), () => Option.none);
	}
	// Creates a new option based on the value of this option, if one is defined. 
	// Expects the specified function to return an option
	flatMap(f) {
		return this.match(v => f(v), () => Option.none);
	}
}

export const None = Option.none
export function Some(val) { return Option.some(val) }