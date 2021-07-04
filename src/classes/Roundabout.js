import { Vector } from './Vector' 

export class Roundabout {
	// Id: Int, name: String, roleIds: Vector[Int], taskIds: Vector[Int]
	constructor(id, name, roleIds, taskIds) {
		this.id = id;
		this.name = name;
		this.roleIds = roleIds;
		this.taskIds = taskIds;
	}

	// Converts a json object to a roundabout
	static fromJson(json) {
		return new Roundabout(json.id, json.name, new Vector(json.my_role_ids), new Vector(json.my_task_ids));
	}

	// Whether the current user is able to host this roundabout
	get isHostable()  { return this.taskIds.contains(7); }
}