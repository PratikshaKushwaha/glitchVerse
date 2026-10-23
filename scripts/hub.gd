extends Node3D
## Foggy threshold before Level 1 — manuscript + teleport door.

@onready var float_text: Label3D = $FloatingInstructions
@onready var manuscript: StaticBody3D = $Manuscript
@onready var door: StaticBody3D = $TeleportDoor

var read_manuscript: bool = false


func _ready() -> void:
	_setup_environment()
	float_text.text = (
		"SAVE THE DEVELOPER\n"
		+ "You are the CHOSEN ONE.\n\n"
		+ "Level 1 — Abandoned Wing\n"
		+ "• 7 rooms. Codes hide in the wreckage.\n"
		+ "• 3 rooms hold a GLITCHED digit.\n"
		+ "• Room 7: permute those 3 digits (3! = 6).\n"
		+ "• 4 wrong guesses → back to Room 1."
	)
	if manuscript.has_method("setup"):
		manuscript.call("setup", self)
	if door.has_method("setup"):
		door.call("setup", self)


func _setup_environment() -> void:
	var env_node: WorldEnvironment = $WorldEnvironment
	if env_node.environment == null:
		var e := Environment.new()
		e.background_mode = Environment.BG_COLOR
		e.background_color = Color(0.35, 0.38, 0.42)
		e.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
		e.ambient_light_color = Color(0.55, 0.6, 0.65)
		e.ambient_light_energy = 0.7
		e.fog_enabled = true
		e.fog_light_color = Color(0.7, 0.75, 0.8)
		e.fog_density = 0.045
		env_node.environment = e


func on_hub_interact(role: String) -> void:
	if role == "manuscript":
		read_manuscript = true
	elif role == "door":
		if not read_manuscript:
			return
		get_tree().change_scene_to_file("res://scenes/level1.tscn")
