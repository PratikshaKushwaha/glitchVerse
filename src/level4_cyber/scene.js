export const Scenes = {
    stack: [],
    push(s) { this.stack.push(s); },
    pop() { this.stack.pop(); },
    set(s) { this.stack = [s]; },
    get top() { return this.stack[this.stack.length - 1]; }
};