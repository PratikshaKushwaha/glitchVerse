extends StaticBody3D

@export var role: String = ""

var _hub: Node


func setup(hub: Node) -> void:
	_hub = hub


func get_prompt() -> String:
	if role == "manuscript":
		return "[E] Read manuscript"
	if role == "door":
		if _hub != null and bool(_hub.get("read_manuscript")):
			return "[E] Enter the Abandoned Wing"
		return "[E] Door (read the manuscript first)"
	return "[E] Interact"


func interact(_player: Node) -> void:
	if _hub != null and _hub.has_method("on_hub_interact"):
		_hub.on_hub_interact(role)
