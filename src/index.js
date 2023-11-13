import { isValidElement, renderJsx } from "./jsx-runtime";

export { html } from "./html";
export { Fragment, isValidElement } from "./jsx-runtime";

export const eventMap = new Map();
const stateMap = new Map();
const effectMap = new Map();
const renderMap = new Map();

const SetState = Symbol("SetState");

globalThis.__Palm__ = { getSeededId: undefined };

let queue = queueMicrotask;

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
export async function renderHtml(component, el) {
  const seed = randomSeed();
  async function _render() {
    __Palm__.getSeededId = createIdSeeder(seed);
    let html = await component();
    el.innerHTML = html;
    applyEvents(el);
  }
  renderMap.set(seed, _render);
  await _render();
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
export async function render(component, el) {
  const seed = randomSeed();
  async function _render() {
    __Palm__.getSeededId = createIdSeeder(seed);
    let html = await component();
    if (isValidElement(html)) {
      html = await renderJsx(html);
    }
    el.innerHTML = html;
    applyEvents(el);
  }
  renderMap.set(seed, _render);
  await _render();
}

/**
 * Render a component to a string
 * This is useful for server side rendering
 * Note that this doesn't minify the html
 */
export async function renderToString(component) {
  queue = () => {};
  const seed = randomSeed();
  __Palm__.getSeededId = createIdSeeder(seed);
  let html = await component();
  if (isValidElement(html)) {
    html = await renderJsx(html);
  }
  queue = queueMicrotask;
  return html;
}

/**
 * This hook will run the callback function
 * whenever the second argument (dependencies) change
 * You can use it with an empty array to run it only once
 * Notably, the setter returned from useState is ignored
 *
 * @example
 *
 * useEffect(() => {
 *   console.log('mounted');
 * }, [])
 */
export function useEffect(cb, deps) {
  const { id } = __Palm__.getSeededId();
  if (effectMap.has(id)) {
    if (hasDepsChanged(effectMap.get(id), deps)) {
      effectMap.set(id, deps);
      cb();
    }
  } else {
    effectMap.set(id, deps);
    cb();
  }
}

function hasDepsChanged(oldDeps, deps) {
  if (oldDeps.length !== deps.length) return false;
  return oldDeps.every((d, i) => {
    if (d[SetState] && deps[i][SetState]) return false;
    return d !== deps[i];
  });
}

/**
 * Use this hook to get state in your components
 * It takes in an initial value and returns an tuple
 * with the current value and a function to set the value
 *
 * The setter can also take a function that will be passed
 * the current state, where the returned value will set
 * as the new state
 *
 * @example
 * const [count, setCount] = useState(0);
 *
 * setCount(1); // count === 1
 * setCount(c => c + 1); // count === 2
 */
export function useState(initial) {
  const { id, seed } = __Palm__.getSeededId();

  let value;
  if (!stateMap.has(id)) {
    stateMap.set(id, initial);
    value = initial;
  } else {
    value = stateMap.get(id);
  }

  function setValue(newVal) {
    let v;
    if (typeof newVal === "function") v = newVal(stateMap.get(id));
    else v = newVal;
    stateMap.set(id, v);
    queue(() => {
      renderMap.get(seed)();
    });
  }

  setValue[SetState] = true;

  return [value, setValue];
}

/**
 * This takes in a seed and creates a unique sequence of ids
 */
function createIdSeeder(seed) {
  let id = 0;
  return () => {
    id++;
    return { id: seed + id, seed };
  };
}

/**
 * Generate random string
 */
function randomSeed() {
  return Math.random().toString(36).slice(2);
}

/**
 * You probably don't need this, it's for wacky use cases
 */
export const __INTERNALS = {
  setup: () => {
    queue = () => {};
    const seed = randomSeed();
    __Palm__.getSeededId = createIdSeeder(seed);
  },
  toString: async (html) => {
    if (isValidElement(html)) {
      return await renderJsx(html);
    }
    return html;
  },
  reset: () => {
    queue = queueMicrotask;
  },
};
