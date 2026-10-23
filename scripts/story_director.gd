extends CanvasLayer
## Visual-novel narration bar. Story text follows The Way Out.md strictly.

signal sequence_finished

const TYPE_SPEED := 48.0

var _panel: PanelContainer
var _name_label: Label
var _body_label: Label
var _hint_label: Label
var _dim: ColorRect

var _queue: Array[Dictionary] = []
var _line_index: int = -1
var _full_text: String = ""
var _visible_chars: float = 0.0
var _typing: bool = false
var _playing: bool = false
var _callback: Callable = Callable()
var _release_on_finish: bool = true


func _ready() -> void:
	layer = 80
	process_mode = Node.PROCESS_MODE_ALWAYS
	_build_ui()
	hide()


func is_playing() -> bool:
	return _playing


func play_lines(lines: Array, on_done: Callable = Callable(), release_on_finish: bool = true) -> void:
	_queue.clear()
	for item in lines:
		if item is Dictionary:
			_queue.append(item)
		else:
			_queue.append({"name": "", "text": str(item)})
	_callback = on_done
	_release_on_finish = release_on_finish
	_line_index = -1
	_playing = true
	_lock_player(true)
	show()
	_advance()


func play_story(key: String, on_done: Callable = Callable()) -> void:
	play_lines(get_story(key), on_done)


func get_story(key: String) -> Array[Dictionary]:
	match key:
		"opening":
			return [
				_line("", "After the last submission hits send, you drop into the chair at your laptop desk."),
				_line("", "You open your favorite game."),
				_line("", "The screen glitches. Pixels tear. A voice bleeds through like a radio left between stations."),
				_line("DEVELOPER", "I built this world. I am stuck inside my own game."),
				_line("DEVELOPER", "I am asking you for help. You. Particularly you."),
				_line("DEVELOPER", "You are the Chosen One."),
				_line("", "The words are still landing when the room folds. Glass, desk, and code pull you through."),
				_line("", "You open your eyes. Cloudy. Foggy. An open world with almost nothing in it —"),
				_line("", "— except one door ahead, and a manuscript with instructions beside the teleport."),
			]
		"manuscript":
			return [
				_line("MANUSCRIPT", "SAVE THE DEVELOPER."),
				_line("MANUSCRIPT", "He is trapped in the game he built. You are the Chosen One. That is not a rumor. That is the assignment."),
				_line("MANUSCRIPT", "The door beside this page is a teleport. Read the level instructions before you step through."),
			]
		"level1_brief":
			return [
				_line("LEVEL 1", "Abandoned building. Seven rooms."),
				_line("LEVEL 1", "Each of the first six rooms hides a door code in the wreckage — furniture scattered, objects displaced."),
				_line("LEVEL 1", "Search under couches. Pull the hidden paper. Enter the code like an escape-room lock."),
				_line("LEVEL 1", "In three rooms chosen at random, one digit is marked differently. Remember those three digits."),
				_line("LEVEL 1", "Room 7 is the last lock: permute those three digits. You get four guesses. Fail, and the glitch dumps you back in Room 1."),
				_line("LEVEL 1", "Save the developer. You are the Chosen One."),
			]
		"level1_enter":
			return [
				_line("", "The teleport takes you. Dust. An abandoned wing. Codes in the displacement. Watch for the digits that do not belong."),
			]
		"level1_clear":
			return [
				_line("DEVELOPER", "The sequence holds. The wing unclenches. My signal is stronger because you were the Chosen One."),
			]
		_:
			return [_line("", key)]


func _line(speaker: String, text: String) -> Dictionary:
	return {"name": speaker, "text": text}


func _build_ui() -> void:
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)

	_dim = ColorRect.new()
	_dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	_dim.color = Color(0.02, 0.03, 0.05, 0.18)
	_dim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(_dim)

	_panel = PanelContainer.new()
	_panel.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	_panel.offset_left = 48.0
	_panel.offset_right = -48.0
	_panel.offset_top = -210.0
	_panel.offset_bottom = -28.0
	_panel.mouse_filter = Control.MOUSE_FILTER_STOP
	root.add_child(_panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 22)
	margin.add_theme_constant_override("margin_right", 22)
	margin.add_theme_constant_override("margin_top", 14)
	margin.add_theme_constant_override("margin_bottom", 14)
	_panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 8)
	margin.add_child(vbox)

	_name_label = Label.new()
	_name_label.add_theme_font_size_override("font_size", 20)
	_name_label.modulate = Color(0.55, 0.95, 1.0)
	vbox.add_child(_name_label)

	_body_label = Label.new()
	_body_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_body_label.add_theme_font_size_override("font_size", 20)
	_body_label.size_flags_vertical = Control.SIZE_EXPAND_FILL
	vbox.add_child(_body_label)

	_hint_label = Label.new()
	_hint_label.text = "E / Click  —  next"
	_hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_hint_label.modulate = Color(0.7, 0.75, 0.8, 0.8)
	vbox.add_child(_hint_label)

	_panel.gui_input.connect(_on_panel_gui_input)


func _process(delta: float) -> void:
	if not _playing or not _typing:
		return
	_visible_chars += TYPE_SPEED * delta
	var shown := mini(int(_visible_chars), _full_text.length())
	_body_label.visible_characters = shown
	if shown >= _full_text.length():
		_typing = false
		_body_label.visible_characters = -1


func _unhandled_input(event: InputEvent) -> void:
	if not _playing:
		return
	if event.is_action_pressed("interact") or event.is_action_pressed("ui_accept"):
		_on_advance_pressed()
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton:
		var mb := event as InputEventMouseButton
		if mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			_on_advance_pressed()
			get_viewport().set_input_as_handled()


func _on_panel_gui_input(event: InputEvent) -> void:
	if not _playing:
		return
	if event is InputEventMouseButton:
		var mb := event as InputEventMouseButton
		if mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			_on_advance_pressed()
			get_viewport().set_input_as_handled()


func _on_advance_pressed() -> void:
	if _typing:
		_typing = false
		_body_label.visible_characters = -1
		return
	_advance()


func _advance() -> void:
	_line_index += 1
	if _line_index >= _queue.size():
		_finish()
		return
	var entry: Dictionary = _queue[_line_index]
	var speaker := str(entry.get("name", ""))
	_full_text = str(entry.get("text", ""))
	_name_label.text = speaker if speaker != "" else " "
	_name_label.visible = speaker != ""
	_body_label.text = _full_text
	_body_label.visible_characters = 0
	_visible_chars = 0.0
	_typing = true
	if speaker == "DEVELOPER":
		_name_label.modulate = Color(1.0, 0.45, 0.4)
	elif speaker == "LEVEL 1":
		_name_label.modulate = Color(0.7, 1.0, 0.75)
	else:
		_name_label.modulate = Color(0.55, 0.95, 1.0)


func _finish() -> void:
	_playing = false
	_typing = false
	hide()
	if _release_on_finish:
		_lock_player(false)
	var cb := _callback
	_callback = Callable()
	sequence_finished.emit()
	if cb.is_valid():
		cb.call()


func _lock_player(locked: bool) -> void:
	var player := get_tree().get_first_node_in_group("player")
	if player != null and player.has_method("set_look_locked"):
		player.set_look_locked(locked)
		if locked:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		else:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
