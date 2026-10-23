extends CanvasLayer
## Numeric code entry overlay (Roblox-style escape lock).

signal submitted(code: String)
signal cancelled

var title_label: Label
var display: Label
var hint_label: Label
var lives_label: Label
var panel: PanelContainer

var max_length: int = 4
var buffer: String = ""
var is_final_mode: bool = false
var _built: bool = false


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	layer = 20
	_build_ui()
	hide()


func _build_ui() -> void:
	if _built:
		return
	_built = true
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(root)

	var dim := ColorRect.new()
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.color = Color(0, 0, 0, 0.65)
	root.add_child(dim)

	panel = PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.custom_minimum_size = Vector2(360, 420)
	panel.offset_left = -180
	panel.offset_top = -210
	panel.offset_right = 180
	panel.offset_bottom = 210
	root.add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 10)
	panel.add_child(vbox)

	title_label = Label.new()
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_label.add_theme_font_size_override("font_size", 22)
	vbox.add_child(title_label)

	display = Label.new()
	display.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	display.add_theme_font_size_override("font_size", 36)
	vbox.add_child(display)

	hint_label = Label.new()
	hint_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(hint_label)

	lives_label = Label.new()
	lives_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lives_label.visible = false
	vbox.add_child(lives_label)

	var grid := GridContainer.new()
	grid.columns = 3
	grid.add_theme_constant_override("h_separation", 8)
	grid.add_theme_constant_override("v_separation", 8)
	vbox.add_child(grid)

	for d in range(1, 10):
		var b := Button.new()
		b.text = str(d)
		b.custom_minimum_size = Vector2(70, 44)
		var digit := d
		b.pressed.connect(func() -> void: _append_digit(str(digit)))
		grid.add_child(b)

	var clear_btn := Button.new()
	clear_btn.text = "C"
	clear_btn.pressed.connect(_on_clear_pressed)
	grid.add_child(clear_btn)

	var zero := Button.new()
	zero.text = "0"
	zero.pressed.connect(func() -> void: _append_digit("0"))
	grid.add_child(zero)

	var back := Button.new()
	back.text = "<"
	back.pressed.connect(_on_back_pressed)
	grid.add_child(back)

	var row := HBoxContainer.new()
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_child(row)

	var enter_btn := Button.new()
	enter_btn.text = "ENTER"
	enter_btn.custom_minimum_size = Vector2(120, 40)
	enter_btn.pressed.connect(_on_enter_pressed)
	row.add_child(enter_btn)

	var cancel_btn := Button.new()
	cancel_btn.text = "CANCEL"
	cancel_btn.custom_minimum_size = Vector2(120, 40)
	cancel_btn.pressed.connect(_on_cancel_pressed)
	row.add_child(cancel_btn)


func open_pad(title: String, length: int, final_mode: bool = false, hint: String = "") -> void:
	_build_ui()
	max_length = length
	is_final_mode = final_mode
	buffer = ""
	title_label.text = title
	hint_label.text = hint
	lives_label.visible = final_mode
	if final_mode:
		lives_label.text = "Attempts left: %d" % GameState.final_lives
	_refresh_display()
	show()
	get_tree().paused = true


func close_pad() -> void:
	hide()
	get_tree().paused = false
	cancelled.emit()


func _refresh_display() -> void:
	var chars: PackedStringArray = []
	for i in max_length:
		if i < buffer.length():
			chars.append(buffer[i])
		else:
			chars.append("_")
	display.text = " ".join(chars)


func _append_digit(d: String) -> void:
	if buffer.length() >= max_length:
		return
	buffer += d
	_refresh_display()
	if buffer.length() == max_length:
		_submit()


func _backspace() -> void:
	if buffer.is_empty():
		return
	buffer = buffer.substr(0, buffer.length() - 1)
	_refresh_display()


func _submit() -> void:
	var code := buffer
	buffer = ""
	_refresh_display()
	hide()
	get_tree().paused = false
	submitted.emit(code)


func _on_clear_pressed() -> void:
	buffer = ""
	_refresh_display()


func _on_back_pressed() -> void:
	_backspace()


func _on_enter_pressed() -> void:
	if buffer.length() == max_length:
		_submit()


func _on_cancel_pressed() -> void:
	close_pad()


func _unhandled_input(event: InputEvent) -> void:
	if not visible:
		return
	if event is InputEventKey and event.pressed and not event.echo:
		var key := event as InputEventKey
		if key.keycode >= KEY_0 and key.keycode <= KEY_9:
			_append_digit(str(key.keycode - KEY_0))
			get_viewport().set_input_as_handled()
		elif key.keycode >= KEY_KP_0 and key.keycode <= KEY_KP_9:
			_append_digit(str(key.keycode - KEY_KP_0))
			get_viewport().set_input_as_handled()
		elif key.keycode == KEY_BACKSPACE:
			_backspace()
			get_viewport().set_input_as_handled()
		elif key.keycode == KEY_ENTER or key.keycode == KEY_KP_ENTER:
			_on_enter_pressed()
			get_viewport().set_input_as_handled()
		elif key.keycode == KEY_ESCAPE:
			close_pad()
			get_viewport().set_input_as_handled()
