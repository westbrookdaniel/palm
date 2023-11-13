import { eventMap } from "./";

export function jsx(tag, props) {
  const children = props.children ?? [];
  delete props["children"];
  return { $$typeof: VNodeSymbol, tag, props, children };
}

export { jsx as jsxs, jsx as jsxDEV };

const VNodeSymbol = Symbol("vnode");

export function isValidElement(node) {
  if (typeof node !== "object") return false;
  return node.$$typeof === VNodeSymbol;
}

export async function renderJsx(node) {
  const { tag, props, children } = node;

  __Palm__.getSeededId(); // This is help stop state from colliding

  const attrs = Object.entries(props)
    .map(([key, value]) => {
      if (key === "className") {
        return `class="${value}"`;
      }
      if (typeof value === "function") {
        const { id } = __Palm__.getSeededId();
        eventMap.set(id, [key.substring(2).toLowerCase(), value]);
        return `data-event="${id}"`;
      }
      if (typeof value === "boolean") {
        if (booleanAttributes.includes(key)) {
          return value ? key : "";
        }
        return value ? `data-${key}` : "";
      }
      return `${key}="${value}"`;
    })
    .filter((attr) => attr !== "")
    .join(" ");

  if (tag === "") {
    return await renderJsxChildren(children);
  }

  if (typeof tag === "function") {
    const jsx = await tag({ ...props, children });
    return await renderJsxChildren(jsx);
  }

  if (emptyTags.includes(tag)) {
    return `<${tag} ${attrs} />`;
  }

  return `<${tag} ${attrs}>${await renderJsxChildren(children)}</${tag}>`;
}

async function renderJsxChildren(c) {
  if (c === false || c === null || c === undefined) {
    return "";
  }
  if (Array.isArray(c)) {
    return (await Promise.all(c.map(renderJsxChildren))).join("");
  }
  if (isValidElement(c)) {
    return await renderJsx(c);
  }
  return c.toString();
}

export function Fragment(props) {
  return {
    $$typeof: VNodeSymbol,
    tag: "",
    props: {},
    children: props.children ? [props.children] : [],
  };
}

const emptyTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

const booleanAttributes = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected",
];
