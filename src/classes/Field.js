import { Option } from "./Option"

// Mutable class that holds a field value and state
export class Field {
	// Initial field value + whether field must contain a value when tested
	// Initial value should be an option
	constructor(initialVal = null, isRequired = false) {
		// This field is not intended to be edited from outside
		this._value = initialVal;
		this.isRequired = isRequired;
		this.flag = false;
	}

	// Creates a pre-filled field
	static filled(val, isRequired = false) { return new Field(Option.some(val), isRequired) }
	// Creates an empty field
	static empty(isRequired = false) { return new Field(Option.none, isRequired) }

	// Current value of this field
	get value() { return this._value }
	set value(newVal) { 
		if (newVal instanceof Option)
			this._value = newVal;
		else
			this._value = new Option(newVal);
		// Clears the flag if one is present
		if (this.flag && this.nonEmpty)
			this.flag = false;
	}

	get text() { return this.value.getOrElse(() => "") }
	set text(newText) { this.value = new Option(newText) }

	get isEmpty() { return this.value.isEmpty }
	get nonEmpty() { return !this.isEmpty }

	// Empties this field
	clear() { this.value = Option.none }

	// Marks this field as missing if necessary
	test() {
		this.flag = this.isRequired && this.isEmpty;
		return !this.flag;
	}
}