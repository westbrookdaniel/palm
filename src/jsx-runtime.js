import { eventMap, getSeededId } from "./";

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

export function renderJsx(node) {
  const { tag, props, children } = node;

  const attrs = Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === "function") {
        const { id } = getSeededId();
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
    return children.map(renderJsxChildren).join("");
  }

  if (typeof tag === "function") {
    const jsx = tag({ ...props, children });
    return renderJsxChildren(jsx);
  }

  if (emptyTags.includes(tag)) {
    return `<${tag} ${attrs} />`;
  }

  return `<${tag} ${attrs}>${children
    .map(renderJsxChildren)
    .join("")}</${tag}>`;
}

function renderJsxChildren(c) {
  if (Array.isArray(c)) {
    return c.map(renderJsxChildren).join("");
  }
  if (isValidElement(c)) {
    return renderJsx(c.tag, c.props, ...c.children);
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
