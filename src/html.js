import { eventMap } from "./";

export async function html(strings, ...values) {
  let acc = "";
  for (let i = 0; i < strings.length; i++) {
    const str = strings[i];
    __Palm__.getSeededId(); // This is help stop state from colliding
    const value = (await values[i]) ?? "";
    const curr = acc + str;
    if (typeof value === "function") {
      const { id } = __Palm__.getSeededId();
      const index = curr.lastIndexOf(" on");
      const event = curr.slice(index + 3, -1).toLowerCase();
      if (event.includes(" ")) throw new Error("Invalid event: " + event);
      const before = curr.slice(0, index);
      eventMap.set(id, [event, value]);
      acc = before + ` data-event="${id}"`;
    } else {
      acc = curr + value;
    }
  }
  return acc;
}
