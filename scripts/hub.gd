extends Node3D
## Foggy threshold from The Way Out.md — WorldGen pack as the open world, one door ahead.

const COLLIDER_PATH := "res://assets/WorldGen/pack/gaussian_splatting/environment_collider.glb"
const OBJ0_PATH := "res://assets/WorldGen/pack/separated_objects/glb/object_0000/model_shaded.glb"
const OBJ1_PATH := "res://assets/WorldGen/pack/separated_objects/glb/object_0001/model_shaded.glb"
const OBJ0_XFORM := "res://assets/WorldGen/pack/separated_objects/glb/object_0000/transform_matrix.json"
const OBJ1_XFORM := "res://assets/WorldGen/pack/separated_objects/glb/object_0001/transform_matrix.json"
const CAM_XFORM := "res://assets/WorldGen/pack/camera.json"
const LEVEL1_PATH := "res://scenes/level1.tscn"

@onready var float_text: Label3D = $FloatingInstructions
@onready var manuscript: StaticBody3D = $Manuscript
@onready var door: StaticBody3D = $TeleportDoor
@onready var instruction_plate: StaticBody3D = $InstructionPlate
@onready var player: CharacterBody3D = $Player
@onready var world_root: Node3D = $WorldGen

var read_manuscript: bool = false
var heard_brief: bool = false
var _opening_done: bool = false


func _ready() -> void:
	_setup_environment()
	_load_worldgen()
	_place_from_camera()
	float_text.text = (
		"SAVE THE DEVELOPER\n"
		+ "You are the CHOSEN ONE.\n\n"
		+ "[E] Level 1 instructions\n"
		+ "Then step through the door."
	)
	if manuscript.has_method("setup"):
		manuscript.call("setup", self)
	if door.has_method("setup"):
		door.call("setup", self)
	if instruction_plate.has_method("setup"):
		instruction_plate.call("setup", self)
	var vn := VN.box(self)
	if vn != null:
		vn.play_story("opening", Callable(self, "_on_opening_done"))
	else:
		_opening_done = true


func _on_opening_done() -> void:
	_opening_done = true


func _load_worldgen() -> void:
	_instance_glb(COLLIDER_PATH, world_root, Transform3D.IDENTITY, "EnvironmentCollider")
	_instance_glb(OBJ0_PATH, world_root, _load_matrix(OBJ0_XFORM), "Object0000")
	_instance_glb(OBJ1_PATH, world_root, _load_matrix(OBJ1_XFORM), "Object0001")
	_make_static_collision(world_root)


func _instance_glb(path: String, parent: Node3D, xform: Transform3D, node_name: String) -> void:
	if not ResourceLoader.exists(path):
		push_warning("Missing WorldGen asset: %s" % path)
		return
	var packed := load(path)
	if packed == null:
		return
	var inst: Node = packed.instantiate()
	inst.name = node_name
	if inst is Node3D:
		(inst as Node3D).transform = xform
	parent.add_child(inst)


func _load_matrix(path: String) -> Transform3D:
	if not FileAccess.file_exists(path):
		return Transform3D.IDENTITY
	var f := FileAccess.open(path, FileAccess.READ)
	var parsed: Variant = JSON.parse_string(f.get_as_text())
	if typeof(parsed) != TYPE_ARRAY:
		return Transform3D.IDENTITY
	var rows: Array = parsed
	if rows.size() < 3:
		return Transform3D.IDENTITY
	var r0: Array = rows[0]
	var r1: Array = rows[1]
	var r2: Array = rows[2]
	var basis := Basis(
		Vector3(float(r0[0]), float(r1[0]), float(r2[0])),
		Vector3(float(r0[1]), float(r1[1]), float(r2[1])),
		Vector3(float(r0[2]), float(r1[2]), float(r2[2]))
	)
	var origin := Vector3(float(r0[3]), float(r1[3]), float(r2[3]))
	return Transform3D(basis, origin)


func _place_from_camera() -> void:
	var cam_xf := _load_matrix(CAM_XFORM)
	# Spawn the player at the capture camera, looking toward the door / origin.
	player.global_position = cam_xf.origin + Vector3(0, 1.15, 0)
	if player.global_position.y < 0.9:
		player.global_position.y = 1.15
	var look_at := Vector3(0.0, player.global_position.y, 0.0)
	if look_at.distance_to(player.global_position) > 0.2:
		player.look_at(look_at, Vector3.UP)
	door.global_position = Vector3(0.0, 0.0, 0.2)
	manuscript.global_position = Vector3(-1.6, 0.0, 0.6)
	float_text.global_position = Vector3(1.8, 1.9, 0.4)
	instruction_plate.global_position = Vector3(1.8, 0.0, 0.55)


func _make_static_collision(node: Node) -> void:
	if node is MeshInstance3D:
		var mi := node as MeshInstance3D
		if mi.mesh != null and mi.get_node_or_null("StaticBody3D") == null:
			mi.create_trimesh_collision()
	for child in node.get_children():
		_make_static_collision(child)


func _setup_environment() -> void:
	var env_node: WorldEnvironment = $WorldEnvironment
	var e := Environment.new()
	e.background_mode = Environment.BG_COLOR
	e.background_color = Color(0.42, 0.46, 0.5)
	e.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	e.ambient_light_color = Color(0.62, 0.66, 0.7)
	e.ambient_light_energy = 0.85
	e.fog_enabled = true
	e.fog_light_color = Color(0.78, 0.82, 0.86)
	e.fog_density = 0.055
	env_node.environment = e
	var ground_mesh := get_node_or_null("Ground/Mesh") as MeshInstance3D
	if ground_mesh != null:
		var gm := StandardMaterial3D.new()
		gm.albedo_color = Color(0.48, 0.5, 0.52)
		gm.roughness = 1.0
		ground_mesh.material_override = gm


func on_hub_interact(role: String) -> void:
	var vn := VN.box(self)
	if vn != null and vn.is_playing():
		return
	if not _opening_done:
		if vn != null:
			vn.play_story("opening", Callable(self, "_on_opening_done"))
		return
	if vn == null:
		if role == "door":
			_enter_level1()
		return
	if role == "manuscript":
		vn.play_story("manuscript", Callable(self, "_on_manuscript_done"))
	elif role == "instructions":
		vn.play_story("level1_brief", Callable(self, "_on_brief_done"))
	elif role == "door":
		if not heard_brief:
			vn.play_story("level1_brief", Callable(self, "_enter_level1"))
		else:
			_enter_level1()


func _on_manuscript_done() -> void:
	read_manuscript = true


func _on_brief_done() -> void:
	heard_brief = true
	read_manuscript = true


func _enter_level1() -> void:
	heard_brief = true
	read_manuscript = true
	get_tree().change_scene_to_file(LEVEL1_PATH)
