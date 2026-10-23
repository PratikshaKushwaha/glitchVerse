extends StaticBody3D
## Hidden paper — usually under a couch. Reveals the room code; may glitch-mark one digit.

@export var room_index: int = 1
@export var hide_hint: String = "under the couch"

var _discovered: bool = false
var _label: Label3D
var _mesh: MeshInstance3D
var _prompt_tag: Label3D


func setup(room: int, hint: String = "under the couch") -> void:
	room_index = room
	hide_hint = hint
	collision_layer = 1
	collision_mask = 0
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = Vector3(0.42, 0.08, 0.28)
	shape.shape = box
	shape.position = Vector3(0, 0.05, 0)
	add_child(shape)

	_mesh = MeshInstance3D.new()
	var cube := BoxMesh.new()
	cube.size = Vector3(0.4, 0.02, 0.26)
	_mesh.mesh = cube
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.86, 0.8, 0.68)
	mat.roughness = 0.85
	_mesh.material_override = mat
	_mesh.position = Vector3(0, 0.04, 0)
	_mesh.rotation_degrees = Vector3(0, 18, 2)
	add_child(_mesh)

	_label = Label3D.new()
	_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	_label.font_size = 42
	_label.outline_size = 8
	_label.position = Vector3(0, 0.38, 0)
	_label.text = ""
	add_child(_label)

	_prompt_tag = Label3D.new()
	_prompt_tag.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	_prompt_tag.font_size = 22
	_prompt_tag.position = Vector3(0, 0.22, 0)
	_prompt_tag.text = "paper"
	_prompt_tag.modulate = Color(0.85, 0.8, 0.7, 0.65)
	add_child(_prompt_tag)


func get_prompt() -> String:
	if _discovered:
		return "[E] Re-read the hidden paper"
	return "[E] Pull the paper %s" % hide_hint


func interact(_player: Node) -> void:
	_discovered = true
	_prompt_tag.visible = false
	var code: String = GameState.room_codes[room_index]
	var highlight := GameState.get_highlight_for_room(room_index)
	if highlight.is_empty():
		_label.text = code
		_label.modulate = Color(0.15, 0.12, 0.1)
		GameState.hint_message.emit("Paper %s. Code: %s" % [hide_hint, code])
	else:
		var digit_i: int = highlight["digit_index"]
		var parts: PackedStringArray = []
		for i in code.length():
			if i == digit_i:
				parts.append("[%s]" % code[i])
			else:
				parts.append(code[i])
		_label.text = "".join(parts)
		_label.modulate = Color(0.15, 1.0, 0.7)
		var glow := StandardMaterial3D.new()
		glow.albedo_color = Color(0.2, 0.55, 0.45)
		glow.emission_enabled = true
		glow.emission = Color(0.1, 0.95, 0.7)
		glow.emission_energy_multiplier = 2.4
		_mesh.material_override = glow
		GameState.register_highlight_seen(room_index)
		GameState.hint_message.emit(
			"Paper %s. Code %s — digit %s is marked differently. Remember it." % [
				hide_hint, code, highlight["digit"]
			]
		)
		_spawn_marked_digit(str(highlight["digit"]))


func _spawn_marked_digit(digit: String) -> void:
	if get_node_or_null("GlitchDigit") != null:
		return
	var mark := Label3D.new()
	mark.name = "GlitchDigit"
	mark.text = digit
	mark.font_size = 96
	mark.outline_size = 12
	mark.modulate = Color(0.2, 1.0, 0.85)
	mark.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	mark.position = Vector3(0, 0.85, 0)
	add_child(mark)
