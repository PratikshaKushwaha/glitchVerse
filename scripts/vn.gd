class_name VN
extends Object
## Runtime lookup for the StoryDirector autoload (avoids compile-time autoload ids).


static func box(from: Node) -> Variant:
	if from == null or from.get_tree() == null:
		return null
	return from.get_tree().root.get_node_or_null("StoryDirector")
