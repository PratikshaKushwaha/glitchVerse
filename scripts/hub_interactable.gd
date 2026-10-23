extends StaticBody3D

@export var role: String = ""

var _hub: Node


func setup(hub: Node) -> void:
	_hub = hub


func get_prompt() -> String:
	var vn := VN.box(self)
	if vn != null and vn.is_playing():
		return ""
	if role == "manuscript":
		return "[E] Read the manuscript"
	if role == "instructions":
		return "[E] Level 1 instructions"
	if role == "door":
		if _hub != null and bool(_hub.get("heard_brief")):
			return "[E] Enter the Abandoned Wing"
		return "[E] Door — hear Level 1 instructions"
	return "[E] Interact"


func interact(_player: Node) -> void:
	var vn := VN.box(self)
	if vn != null and vn.is_playing():
		return
	if _hub != null and _hub.has_method("on_hub_interact"):
		_hub.on_hub_interact(role)
