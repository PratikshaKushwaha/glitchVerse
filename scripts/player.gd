extends CharacterBody3D
## First-person explorer for Glitch escape rooms.

const SPEED := 5.0
const SPRINT_MULT := 1.55
const JUMP_VELOCITY := 4.2
const MOUSE_SENS := 0.0024
const INTERACT_RANGE := 3.2

@onready var head: Node3D = $Head
@onready var camera: Camera3D = $Head/Camera3D
@onready var ray: RayCast3D = $Head/Camera3D/InteractRay
@onready var prompt_label: Label = $HUD/Prompt

var look_locked: bool = false


func _ready() -> void:
	add_to_group("player")
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	ray.target_position = Vector3(0, 0, -INTERACT_RANGE)
	ray.enabled = true
	prompt_label.text = ""


func _unhandled_input(event: InputEvent) -> void:
	if look_locked:
		return
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		var motion := event as InputEventMouseMotion
		rotate_y(-motion.relative.x * MOUSE_SENS)
		head.rotate_x(-motion.relative.y * MOUSE_SENS)
		head.rotation.x = clampf(head.rotation.x, deg_to_rad(-85.0), deg_to_rad(85.0))
	if event.is_action_pressed("ui_cancel"):
		if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		else:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


func _physics_process(delta: float) -> void:
	if look_locked:
		velocity = Vector3.ZERO
		move_and_slide()
		_update_prompt()
		return

	if not is_on_floor():
		velocity += get_gravity() * delta

	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = JUMP_VELOCITY

	var input_dir := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var direction := (transform.basis * Vector3(input_dir.x, 0.0, input_dir.y)).normalized()
	var speed := SPEED
	if Input.is_action_pressed("sprint"):
		speed = SPEED * SPRINT_MULT

	if direction != Vector3.ZERO:
		velocity.x = direction.x * speed
		velocity.z = direction.z * speed
	else:
		velocity.x = move_toward(velocity.x, 0.0, speed)
		velocity.z = move_toward(velocity.z, 0.0, speed)

	move_and_slide()
	_update_prompt()

	if Input.is_action_just_pressed("interact"):
		_try_interact()


func set_look_locked(locked: bool) -> void:
	look_locked = locked
	if locked:
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	else:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


func _get_interactable() -> Node:
	if not ray.is_colliding():
		return null
	var collider := ray.get_collider() as Node
	if collider == null:
		return null
	if collider.has_method("interact"):
		return collider
	var parent := collider.get_parent()
	if parent != null and parent.has_method("interact"):
		return parent
	return null


func _update_prompt() -> void:
	var target := _get_interactable()
	if target != null and target.has_method("get_prompt"):
		prompt_label.text = target.get_prompt()
	elif target != null:
		prompt_label.text = "[E] Interact"
	else:
		prompt_label.text = ""


func _try_interact() -> void:
	var target := _get_interactable()
	if target != null:
		target.interact(self)
