extends Node
## Global state for Glitch — Level 1 escape progress & final digits.

signal lives_changed(remaining: int)
signal room_unlocked(room_index: int)
signal level_reset()
signal level_cleared()
signal hint_message(text: String)

const FINAL_LIVES := 4
const ROOM_COUNT := 7
const ESCAPE_ROOM_COUNT := 6

## Fixed door codes for rooms 1–6 (index 0 unused).
var room_codes: Array[String] = ["", "4821", "7390", "1564", "9027", "3148", "6752"]

## Room indices (1–6) that carry a highlighted digit this run.
var highlight_rooms: Array[int] = []
## Digit character highlighted in that room (parallel to highlight_rooms).
var highlight_digits: Array[String] = []
## Index within the room code that is highlighted.
var highlight_digit_indices: Array[int] = []
## Correct final combination = digits sorted by ascending room number.
var final_code: String = ""

var current_room: int = 1
var unlocked_through: int = 0  ## highest door unlocked (0 = none yet)
var final_lives: int = FINAL_LIVES
var collected_highlights: Dictionary = {}  ## room_index -> digit
var is_final_unlocked: bool = false


func _ready() -> void:
	randomize()
	start_new_run()


func start_new_run() -> void:
	current_room = 1
	unlocked_through = 0
	final_lives = FINAL_LIVES
	collected_highlights.clear()
	is_final_unlocked = false
	_pick_highlights()
	lives_changed.emit(final_lives)
	level_reset.emit()


func _pick_highlights() -> void:
	highlight_rooms.clear()
	highlight_digits.clear()
	highlight_digit_indices.clear()
	var pool: Array[int] = [1, 2, 3, 4, 5, 6]
	pool.shuffle()
	highlight_rooms = [pool[0], pool[1], pool[2]]
	highlight_rooms.sort()
	for room_i in highlight_rooms:
		var code: String = room_codes[room_i]
		var digit_i: int = randi() % code.length()
		highlight_digit_indices.append(digit_i)
		highlight_digits.append(code[digit_i])
	final_code = "".join(PackedStringArray(highlight_digits))
	print("[GameState] Highlights in rooms %s → final code %s" % [highlight_rooms, final_code])


func is_highlight_room(room_index: int) -> bool:
	return room_index in highlight_rooms


func get_highlight_for_room(room_index: int) -> Dictionary:
	var i := highlight_rooms.find(room_index)
	if i < 0:
		return {}
	return {
		"digit": highlight_digits[i],
		"digit_index": highlight_digit_indices[i],
		"code": room_codes[room_index],
	}


func register_highlight_seen(room_index: int) -> void:
	if not is_highlight_room(room_index):
		return
	var data := get_highlight_for_room(room_index)
	if data.is_empty():
		return
	collected_highlights[room_index] = data["digit"]


func try_unlock_door(room_index: int, entered: String) -> bool:
	if room_index < 1 or room_index > ESCAPE_ROOM_COUNT:
		return false
	if entered != room_codes[room_index]:
		hint_message.emit("Wrong code. Keep searching the room.")
		return false
	unlocked_through = maxi(unlocked_through, room_index)
	room_unlocked.emit(room_index)
	hint_message.emit("Door %d unlocked." % room_index)
	return true


func try_final_code(entered: String) -> bool:
	if entered == final_code:
		is_final_unlocked = true
		level_cleared.emit()
		hint_message.emit("SEQUENCE ACCEPTED — The developer stirs...")
		return true
	final_lives -= 1
	lives_changed.emit(final_lives)
	if final_lives <= 0:
		hint_message.emit("All attempts spent. The glitch pulls you back...")
		start_new_run()
		return false
	hint_message.emit("Wrong permutation. Lives left: %d" % final_lives)
	return false


func get_known_highlight_digits() -> Array[String]:
	var out: Array[String] = []
	for room_i in highlight_rooms:
		if collected_highlights.has(room_i):
			out.append(str(collected_highlights[room_i]))
		else:
			out.append("?")
	return out
