import { isValidElement, renderJsx } from "./jsx-runtime";

export { html } from "./html";
export { Fragment, isValidElement } from "./jsx-runtime";

export const eventMap = new Map();
const stateMap = new Map();
const mountSet = new Set();
const renderMap = new Map();

const StateKey = Symbol("StateKey");

export let getSeededId;

/**
 * This is a helper function to create event listeners
 *
 * onClick and other event handlers will be converted to data-event={id}
 * during render, and this function will be called to add the event listener
 */
function applyEvents(el) {
  el.querySelectorAll(`[data-event]`).forEach((el) => {
    const id = el.getAttribute("data-event");
    const [event, cb] = eventMap.get(id);
    el.addEventListener(event, cb);
  });
}

/**
 * This is a render function optimised for html,
 * as it doesn't handle JSX. It also takes in
 * a component and an element for it to render to
 *
 * @example
 * function App {
 *   return html`<h1>Hello World</h1>`
 * }
 * renderHtml(App, document.getElementById('root'))
 */
export function renderHtml(component, el) {
  const seed = randomNum();
  function _render() {
    getSeededId = createIdSeeder(seed);
    let html = component();
    el.innerHTML = html;
    applyEvents(el);
  }
  renderMap.set(seed, _render);
  _render();
}

/**
 * This is the main render function, it takes in
 * a component and an element for it to render to
 *
 * @example
 * function App {
 *   return <h1>Hello World</h1>
 * }
 * render(App, document.getElementById('root'))
 */
export function render(component, el) {
  const seed = randomNum();
  function _render() {
    getSeededId = createIdSeeder(seed);
    let html = component();
    if (isValidElement(html)) {
      html = renderJsx(html.tag, html.props, ...html.children);
    }
    el.innerHTML = html;
    applyEvents(el);
  }
  renderMap.set(seed, _render);
  _render();
}

/**
 * This hook will be run once on mount
 *
 * @example
 * useMount(() => {
 *   console.log('mounted');
 * })
 */
export function useMount(cb) {
  const { id } = getSeededId();
  if (mountSet.has(id)) return;
  mountSet.add(id);
  cb();
}

/**
 * Use this hook to get state in your components
 * You must provide it with an object, and setting
 * any property will cause a rerender
 *
 * NOTE: You can't destruct the state object, you must use
 * it as is because the returned object is a proxy which
 * allows us to track changes
 *
 * @example
 * const state = useState({ count: 0 });
 * state.count++ // This will cause a rerender
 */
export function useRef(initial) {
  const { id, seed } = getSeededId();
  const data = { id };
  return new Proxy(initial, {
    get(_, prop) {
      if (prop === StateKey) {
        return data.id;
      }
      if (stateMap.has(data.id)) {
        return stateMap.get(data.id)[prop];
      }
      stateMap.set(data.id, initial);
      return initial[prop];
    },
    set(_, prop, value) {
      if (prop === StateKey) {
        data.id = value;
      } else {
        stateMap.get(data.id)[prop] = value;
        renderMap.get(seed)();
      }
      return true;
    },
  });
}

/**
 * This takes in a seed and generates a function that will return seeded random ids
 *
 * @example
 * const gen = createIdSeeder(2131238);
 * gen(); // { id: 'asdahsj', seed: 2131238 }
 * gen(); // { id: 'nsjkqwh', seed: 2131238 }
 *
 * const gen2 = createIdSeeder(2131238);
 * gen2(); // { id: 'asdahsj', seed: 2131238 }
 * gen2(); // { id: 'nsjkqwh', seed: 2131238 }
 */
function createIdSeeder(seed) {
  const originalSeed = seed;
  return function () {
    var t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const num = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return { id: num.toString(36).slice(2), seed: originalSeed };
  };
}

/**
 * Generates a large random number to use as a seed
 */
function randomNum() {
  const n = Math.random() * 4294967296;
  return Math.floor(n);
}
