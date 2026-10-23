extends Node3D
## Builds the abandoned 7-room escape wing and wires puzzle flow.

const ROOM_SIZE := Vector3(10.0, 3.2, 10.0)
const HALL_WIDTH := 3.0
const WALL_THICK := 0.35

@onready var rooms_root: Node3D = $Rooms
@onready var props_root: Node3D = $Props
@onready var doors_root: Node3D = $Doors
@onready var player: CharacterBody3D = $Player
@onready var code_pad: CanvasLayer = $CodePad
@onready var hud_hint: Label = $HUD/Hint
@onready var hud_room: Label = $HUD/RoomLabel
@onready var hud_digits: Label = $HUD/DigitsLabel
@onready var win_panel: PanelContainer = $HUD/WinPanel

var _door_bodies: Array[StaticBody3D] = []
var _door_blockers: Array[StaticBody3D] = []
var _spawn_points: Array[Vector3] = []


func _ready() -> void:
	win_panel.visible = false
	GameState.hint_message.connect(_on_hint)
	GameState.lives_changed.connect(_on_lives)
	GameState.level_reset.connect(_on_level_reset)
	GameState.level_cleared.connect(_on_level_cleared)
	GameState.room_unlocked.connect(_on_room_unlocked)
	_build_level()
	_update_hud()
	_teleport_player(1)


func _build_level() -> void:
	var old_env := get_node_or_null("WorldEnvironment")
	if old_env:
		old_env.free()
	_clear_children(rooms_root)
	_clear_children(props_root)
	_clear_children(doors_root)
	_door_bodies.clear()
	_door_blockers.clear()
	_spawn_points.clear()

	var floor_mat := _make_mat(Color(0.22, 0.2, 0.18))
	var wall_mat := _make_mat(Color(0.32, 0.3, 0.28))
	var accent_mat := _make_mat(Color(0.18, 0.22, 0.2))

	# Layout: rooms in a line along +Z, each 12 units apart center-to-center.
	var spacing := 12.0
	for i in range(1, 8):
		var origin := Vector3(0, 0, (i - 1) * spacing)
		_spawn_points.append(origin + Vector3(0, 1.0, -3.5))
		_build_room(i, origin, floor_mat, wall_mat, accent_mat)
		if i <= 6:
			_place_furniture(i, origin)
			_place_hidden_code(i, origin)
			_place_door(i, origin + Vector3(0, 0, ROOM_SIZE.z * 0.5), false)
		else:
			_place_final_terminal(origin)
			_place_door(i, origin + Vector3(0, 0, ROOM_SIZE.z * 0.5), true)

	_place_ambient_light()
	_apply_door_states()


func _build_room(index: int, origin: Vector3, floor_mat: Material, wall_mat: Material, accent_mat: Material) -> void:
	var room := Node3D.new()
	room.name = "Room%d" % index
	room.position = origin
	rooms_root.add_child(room)

	# Floor
	_box(room, Vector3(0, -0.1, 0), Vector3(ROOM_SIZE.x, 0.2, ROOM_SIZE.z), floor_mat, true)
	# Ceiling
	_box(room, Vector3(0, ROOM_SIZE.y, 0), Vector3(ROOM_SIZE.x, 0.2, ROOM_SIZE.z), accent_mat, true)
	# Walls (leave north doorway gap)
	var hw := ROOM_SIZE.x * 0.5
	var hd := ROOM_SIZE.z * 0.5
	var wh := ROOM_SIZE.y
	# South wall (full)
	_box(room, Vector3(0, wh * 0.5, -hd), Vector3(ROOM_SIZE.x, wh, WALL_THICK), wall_mat, true)
	# East / West
	_box(room, Vector3(hw, wh * 0.5, 0), Vector3(WALL_THICK, wh, ROOM_SIZE.z), wall_mat, true)
	_box(room, Vector3(-hw, wh * 0.5, 0), Vector3(WALL_THICK, wh, ROOM_SIZE.z), wall_mat, true)
	# North wall with doorway gap in center
	var gap := HALL_WIDTH
	var side := (ROOM_SIZE.x - gap) * 0.5
	_box(room, Vector3(-(gap * 0.5 + side * 0.5), wh * 0.5, hd), Vector3(side, wh, WALL_THICK), wall_mat, true)
	_box(room, Vector3(gap * 0.5 + side * 0.5, wh * 0.5, hd), Vector3(side, wh, WALL_THICK), wall_mat, true)
	# Door lintel
	_box(room, Vector3(0, wh - 0.35, hd), Vector3(gap, 0.7, WALL_THICK), wall_mat, true)

	var tag := Label3D.new()
	tag.text = "ROOM %d" % index
	if index == 7:
		tag.text = "ROOM 7 — FINAL"
	tag.font_size = 64
	tag.position = Vector3(0, 2.6, -hd + 0.3)
	tag.modulate = Color(0.7, 0.85, 0.9) if index < 7 else Color(1.0, 0.45, 0.35)
	room.add_child(tag)

	var lamp := OmniLight3D.new()
	lamp.position = Vector3(0, 2.8, 0)
	lamp.light_energy = 0.85
	lamp.omni_range = 14.0
	lamp.light_color = Color(0.85, 0.9, 1.0) if index < 7 else Color(1.0, 0.55, 0.45)
	room.add_child(lamp)


func _place_furniture(room_index: int, origin: Vector3) -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = hash(room_index * 9176 + 42)
	var clutter_mat := _make_mat(Color(0.4, 0.35, 0.3))
	var dark_mat := _make_mat(Color(0.15, 0.14, 0.13))
	# Desk
	_prop_box(origin + Vector3(rng.randf_range(-3.5, -1.5), 0.4, rng.randf_range(-2.0, 2.0)), Vector3(1.6, 0.8, 0.7), clutter_mat)
	# Chair tipped
	var chair := _prop_box(origin + Vector3(rng.randf_range(1.0, 3.2), 0.35, rng.randf_range(-3.0, 1.0)), Vector3(0.5, 0.7, 0.5), dark_mat)
	chair.rotation_degrees = Vector3(0, rng.randf_range(-40, 40), rng.randf_range(10, 55))
	# Cabinet
	_prop_box(origin + Vector3(rng.randf_range(2.5, 3.8), 0.75, rng.randf_range(1.0, 3.5)), Vector3(0.9, 1.5, 0.5), clutter_mat)
	# Crates
	for _k in range(3):
		var c := _prop_box(
			origin + Vector3(rng.randf_range(-3.8, 3.8), 0.25, rng.randf_range(-3.8, 3.8)),
			Vector3(rng.randf_range(0.4, 0.8), rng.randf_range(0.3, 0.6), rng.randf_range(0.4, 0.7)),
			dark_mat
		)
		c.rotation_degrees.y = rng.randf_range(0, 360)


func _place_hidden_code(room_index: int, origin: Vector3) -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = hash(room_index * 1337 + 99)
	var scrap := StaticBody3D.new()
	scrap.name = "CodeScrap%d" % room_index
	scrap.set_script(load("res://scripts/hidden_code.gd"))
	scrap.position = origin + Vector3(rng.randf_range(-3.2, 3.2), 0.0, rng.randf_range(-3.2, 3.2))
	props_root.add_child(scrap)
	scrap.call("setup", room_index)


func _place_door(room_index: int, pos: Vector3, is_final: bool) -> void:
	# Invisible blocker that seals the doorway until unlocked.
	var blocker := StaticBody3D.new()
	blocker.name = "Blocker%d" % room_index
	blocker.position = pos + Vector3(0, 1.2, 0)
	var bshape := CollisionShape3D.new()
	var bbox := BoxShape3D.new()
	bbox.size = Vector3(HALL_WIDTH, 2.4, 0.4)
	bshape.shape = bbox
	blocker.add_child(bshape)
	var bmesh := MeshInstance3D.new()
	var bbox_mesh := BoxMesh.new()
	bbox_mesh.size = Vector3(HALL_WIDTH - 0.1, 2.3, 0.25)
	bmesh.mesh = bbox_mesh
	var bmat := _make_mat(Color(0.12, 0.1, 0.1) if not is_final else Color(0.35, 0.08, 0.08))
	bmesh.material_override = bmat
	blocker.add_child(bmesh)
	doors_root.add_child(blocker)
	_door_blockers.append(blocker)

	# Interactable keypad on the wall beside the door.
	var lock := StaticBody3D.new()
	lock.name = "DoorLock%d" % room_index
	lock.set_script(load("res://scripts/door_lock.gd"))
	lock.position = pos + Vector3(HALL_WIDTH * 0.55, 1.2, -0.2)
	var lshape := CollisionShape3D.new()
	var lbox := BoxShape3D.new()
	lbox.size = Vector3(0.35, 0.5, 0.2)
	lshape.shape = lbox
	lock.add_child(lshape)
	var lmesh := MeshInstance3D.new()
	var lboxm := BoxMesh.new()
	lboxm.size = Vector3(0.3, 0.45, 0.12)
	lmesh.mesh = lboxm
	var lmat := StandardMaterial3D.new()
	lmat.albedo_color = Color(0.1, 0.12, 0.14)
	lmat.emission_enabled = true
	lmat.emission = Color(0.2, 0.7, 0.9) if not is_final else Color(1.0, 0.25, 0.15)
	lmat.emission_energy_multiplier = 1.5
	lmesh.material_override = lmat
	lock.add_child(lmesh)
	var tag := Label3D.new()
	tag.text = "LOCK" if not is_final else "FINAL"
	tag.font_size = 28
	tag.position = Vector3(0, 0.4, 0)
	tag.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	lock.add_child(tag)
	doors_root.add_child(lock)
	lock.call("setup", code_pad, self, room_index, is_final)
	_door_bodies.append(lock)


func _place_final_terminal(origin: Vector3) -> void:
	var pedestal := _prop_box(origin + Vector3(0, 0.5, 0), Vector3(1.2, 1.0, 1.2), _make_mat(Color(0.08, 0.08, 0.1)))
	var note := Label3D.new()
	note.text = "Permute the 3 glitched digits.\nOrder = ascending room number.\n4 attempts. Fail = Room 1."
	note.font_size = 28
	note.position = origin + Vector3(0, 2.0, 0)
	note.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	note.modulate = Color(1.0, 0.55, 0.4)
	props_root.add_child(note)
	pedestal.name = "FinalPedestal"


func _place_ambient_light() -> void:
	var env := WorldEnvironment.new()
	var e := Environment.new()
	e.background_mode = Environment.BG_COLOR
	e.background_color = Color(0.05, 0.06, 0.07)
	e.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	e.ambient_light_color = Color(0.25, 0.28, 0.3)
	e.ambient_light_energy = 0.55
	e.fog_enabled = true
	e.fog_light_color = Color(0.35, 0.4, 0.45)
	e.fog_density = 0.012
	env.environment = e
	add_child(env)


func on_door_unlocked(room_index: int, is_final: bool) -> void:
	_open_blocker(room_index)
	_update_hud()
	if is_final:
		return
	_on_hint("Path to Room %d open." % (room_index + 1))


func _open_blocker(room_index: int) -> void:
	var i := room_index - 1
	if i < 0 or i >= _door_blockers.size():
		return
	var blocker := _door_blockers[i]
	if blocker == null or not is_instance_valid(blocker):
		return
	blocker.visible = false
	blocker.collision_layer = 0
	# Slide mesh up for feedback
	var tw := create_tween()
	tw.tween_property(blocker, "position:y", blocker.position.y + 3.0, 0.45)


func _apply_door_states() -> void:
	for i in range(1, 7):
		if GameState.unlocked_through >= i:
			_open_blocker(i)
			if i - 1 < _door_bodies.size() and _door_bodies[i - 1].has_method("set"):
				_door_bodies[i - 1].set("unlocked", true)


func _teleport_player(room_index: int) -> void:
	var idx := clampi(room_index - 1, 0, _spawn_points.size() - 1)
	player.global_position = _spawn_points[idx]
	player.velocity = Vector3.ZERO
	player.rotation = Vector3.ZERO
	if player.has_node("Head"):
		player.get_node("Head").rotation = Vector3.ZERO
	GameState.current_room = room_index
	_update_hud()


func _on_level_reset() -> void:
	# Rebuild so highlight scrap locations / glow reset with a new digit pick.
	call_deferred("_rebuild_after_fail")


func _rebuild_after_fail() -> void:
	_build_level()
	_teleport_player(1)
	_on_hint("The building rewinds. Start again — watch for glitched digits.")
	_update_hud()


func _on_level_cleared() -> void:
	win_panel.visible = true
	if player.has_method("set_look_locked"):
		player.set_look_locked(true)
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func _on_room_unlocked(_room: int) -> void:
	_update_hud()


func _on_lives(_n: int) -> void:
	_update_hud()


func _on_hint(text: String) -> void:
	hud_hint.text = text
	var tw := create_tween()
	hud_hint.modulate.a = 1.0
	tw.tween_interval(3.5)
	tw.tween_property(hud_hint, "modulate:a", 0.0, 1.0)


func _update_hud() -> void:
	hud_room.text = "Abandoned Wing — Progress: Room %d / 7" % mini(GameState.unlocked_through + 1, 7)
	var known := GameState.get_known_highlight_digits()
	hud_digits.text = "Glitched digits: %s   |   Final lives: %d" % [" ".join(PackedStringArray(known)), GameState.final_lives]


func _box(parent: Node3D, pos: Vector3, size: Vector3, mat: Material, collide: bool) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = size
	mi.mesh = mesh
	mi.material_override = mat
	mi.position = pos
	parent.add_child(mi)
	if collide:
		var body := StaticBody3D.new()
		var cs := CollisionShape3D.new()
		var shape := BoxShape3D.new()
		shape.size = size
		cs.shape = shape
		body.add_child(cs)
		body.position = pos
		parent.add_child(body)
	return mi


func _prop_box(global_pos: Vector3, size: Vector3, mat: Material) -> StaticBody3D:
	var body := StaticBody3D.new()
	body.position = global_pos
	var cs := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = size
	cs.shape = shape
	body.add_child(cs)
	var mi := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = size
	mi.mesh = mesh
	mi.material_override = mat
	body.add_child(mi)
	props_root.add_child(body)
	return body


func _make_mat(color: Color) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = color
	m.roughness = 0.9
	return m


func _clear_children(node: Node) -> void:
	while node.get_child_count() > 0:
		var c := node.get_child(0)
		node.remove_child(c)
		c.free()
