import { eventMap } from "./";

export function html(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    __Palm__.getSeededId(); // This is help stop state from colliding
    const value = values[i] ?? "";
    const curr = acc + str;
    if (typeof value === "function") {
      const { id } = __Palm__.getSeededId();
      const index = curr.lastIndexOf(" on");
      const event = curr.slice(index + 3, -1).toLowerCase();
      if (event.includes(" ")) throw new Error("Invalid event: " + event);
      const before = curr.slice(0, index);
      eventMap.set(id, [event, value]);
      return before + ` data-event="${id}"`;
    }
    return curr + value;
  }, "");
}
