extends StaticBody3D
## Prop that reveals a room door code; may show a glitch-highlighted digit.

@export var room_index: int = 1

var _discovered: bool = false
var _label: Label3D
var _mesh: MeshInstance3D


func setup(room: int) -> void:
	room_index = room
	collision_layer = 1
	collision_mask = 0
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = Vector3(0.55, 0.35, 0.2)
	shape.shape = box
	shape.position = Vector3(0, 0.2, 0)
	add_child(shape)
	_mesh = MeshInstance3D.new()
	var cube := BoxMesh.new()
	cube.size = Vector3(0.5, 0.3, 0.15)
	_mesh.mesh = cube
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.35, 0.28, 0.22)
	_mesh.material_override = mat
	_mesh.position = Vector3(0, 0.2, 0)
	add_child(_mesh)
	_label = Label3D.new()
	_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	_label.font_size = 48
	_label.outline_size = 8
	_label.position = Vector3(0, 0.55, 0)
	_label.text = "???"
	_label.modulate = Color(0.75, 0.75, 0.8)
	add_child(_label)


func get_prompt() -> String:
	if _discovered:
		return "[E] Re-read code scrap"
	return "[E] Inspect scrap"


func interact(_player: Node) -> void:
	_discovered = true
	var code: String = GameState.room_codes[room_index]
	var highlight := GameState.get_highlight_for_room(room_index)
	if highlight.is_empty():
		_label.text = code
		_label.modulate = Color(0.85, 0.9, 1.0)
		GameState.hint_message.emit("Code found: %s" % code)
	else:
		var digit_i: int = highlight["digit_index"]
		var parts: PackedStringArray = []
		for i in code.length():
			if i == digit_i:
				parts.append("[%s]" % code[i])
			else:
				parts.append(code[i])
		_label.text = "".join(parts)
		_label.modulate = Color(0.2, 1.0, 0.85)
		var glow := StandardMaterial3D.new()
		glow.albedo_color = Color(0.15, 0.55, 0.5)
		glow.emission_enabled = true
		glow.emission = Color(0.1, 0.9, 0.75)
		glow.emission_energy_multiplier = 2.2
		_mesh.material_override = glow
		GameState.register_highlight_seen(room_index)
		GameState.hint_message.emit(
			"Code found: %s — digit %s is GLITCHED. Remember it." % [code, highlight["digit"]]
		)
