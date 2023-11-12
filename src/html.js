import { eventMap, getSeededId } from "./";

export function html(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    const value = values[i] ?? "";
    const curr = acc + str;
    if (typeof value === "function") {
      const { id } = getSeededId();
      const index = curr.lastIndexOf("on");
      const event = curr.slice(index + 2, -1).toLowerCase();
      if (event.includes(" ")) throw new Error("Invalid event: " + event);
      const before = curr.slice(0, index);
      eventMap.set(id, [event, value]);
      return before + `data-event="${id}"`;
    }
    return curr + value;
  }, "");
}
