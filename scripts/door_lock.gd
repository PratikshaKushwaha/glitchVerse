extends StaticBody3D
## Locked door between rooms — opens code pad on interact.

@export var room_index: int = 1
@export var is_final: bool = false

var unlocked: bool = false
var _pad: CanvasLayer
var _level: Node
var _awaiting: bool = false


func setup(pad: CanvasLayer, level: Node, room: int, final_door: bool = false) -> void:
	_pad = pad
	_level = level
	room_index = room
	is_final = final_door


func get_prompt() -> String:
	if unlocked:
		return ""
	if is_final:
		return "[E] Final Lock — 3-digit sequence"
	return "[E] Enter Door Code"


func interact(player: Node) -> void:
	if unlocked or _pad == null:
		return
	if player.has_method("set_look_locked"):
		player.set_look_locked(true)
	_awaiting = true
	if not _pad.submitted.is_connected(_on_code_submitted):
		_pad.submitted.connect(_on_code_submitted)
	if not _pad.cancelled.is_connected(_on_pad_cancelled):
		_pad.cancelled.connect(_on_pad_cancelled)
	if is_final:
		var known: Array = GameState.get_known_highlight_digits()
		var hint := "Assemble the 3 highlighted digits. Known: %s  (3! = 6 orders)" % "".join(PackedStringArray(known))
		_pad.open_pad("FINAL SEQUENCE", 3, true, hint)
	else:
		_pad.open_pad("ROOM %d LOCK" % room_index, 4, false, "Find the code hidden in this room.")


func _disconnect_pad() -> void:
	if _pad == null:
		return
	if _pad.submitted.is_connected(_on_code_submitted):
		_pad.submitted.disconnect(_on_code_submitted)
	if _pad.cancelled.is_connected(_on_pad_cancelled):
		_pad.cancelled.disconnect(_on_pad_cancelled)
	_awaiting = false


func _on_code_submitted(code: String) -> void:
	if not _awaiting:
		return
	_disconnect_pad()
	var player := get_tree().get_first_node_in_group("player")
	var ok := false
	if is_final:
		ok = GameState.try_final_code(code)
	else:
		ok = GameState.try_unlock_door(room_index, code)
	if ok:
		unlocked = true
		if _level != null and _level.has_method("on_door_unlocked"):
			_level.on_door_unlocked(room_index, is_final)
	if player != null and player.has_method("set_look_locked"):
		player.set_look_locked(false)


func _on_pad_cancelled() -> void:
	if not _awaiting:
		return
	_disconnect_pad()
	var player := get_tree().get_first_node_in_group("player")
	if player != null and player.has_method("set_look_locked"):
		player.set_look_locked(false)
