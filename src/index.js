import { isValidElement, renderJsx } from "./jsx-runtime";

export { html } from "./html";
export { Fragment, isValidElement } from "./jsx-runtime";

export const eventMap = new Map();
const stateMap = new Map();
const effectMap = new Map();
const renderMap = new Map();

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
      html = renderJsx(html);
    }
    el.innerHTML = html;
    applyEvents(el);
  }
  renderMap.set(seed, _render);
  _render();
}

/**
 * This hook will run the callback function
 * whenever the second argument (dependencies) change
 * You can use it with an empty array to run it only once
 *
 * @example
 *
 * useEffect(() => {
 *   console.log('mounted');
 * }, [])
 */
export function useEffect(cb, deps) {
  const { id } = getSeededId();
  if (effectMap.has(id)) {
    if (effectMap.get(id) !== JSON.stringify(deps)) {
      effectMap.set(id, deps);
      cb();
    }
  } else {
    mountSet.add(id, JSON.stringify(deps));
    cb();
  }
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
  const { id, seed } = getSeededId();

  let value;
  if (!stateMap.has(id)) {
    stateMap.set(id, initial);
    value = initial;
  } else {
    stateMap.get(id);
  }

  function setValue(newVal) {
    let v;
    if (typeof newVal === "function") v = newVal(stateMap.get(id));
    else v = newVal;
    stateMap.set(id, newVal);
    renderMap.get(seed)();
  }

  return [value, setValue];
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
