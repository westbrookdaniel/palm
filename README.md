# @westbrookdaniel/palm

Small UI library designed for islands.

Build reactive islands in < 200 bytes!

In a similar model to react, this rendering library is "fast enough" but for this tradeof
it gains an very small bundle size. It does this through instead of diffing or another method,
I just destroy and rebuild the whole tree every time. This is appropriate for Island architecture
since the node trees are going to be small anyway. Beyond the different approach, the library
maintains the minimum needed to do reactive islands; state (useState) and a way to run things
when its dependencies change (useEffect). On the journey for a slim size, I've also chosen to
omit any form of sanitisation, so you need to do that yourself. Of course, being designed
for islands, you can also run multiple instances of the app at the same time mounted
against different elements.

As you can tell, the library follows a simliar convention to react where hooks (`use`) must
be used inside of components and be called in a consitent order.

Both JSX and tagged template literals are supported.

There is also a extra small version at `/dist/index.min.js` which is minified (unlike the rest
of the modules, since it's expected you will use a bundler), although it does not include JSX support.
This version also includes the global `Palm` with the properties `renderHtml`, `useEffect`, `useState` and `html`,
so you can easily use this without a bundler.

Try it out with `https://unpkg.com/@westbrookdaniel/palm/dist/index.min.js` (< 100 bytes)

Otherwise install the package normally using your package manager (e.g. `npm install @westbrookdaniel/palm`)

If using JSX, add `"jsx": "react-jsx", "jsxImportSource": "@westbrookdaniel/palm"` to your tsconfig.json.

## Example Code

```tsx
import {
  useState,
  useEffect,
  render,
  html,
  render,
  renderHtml,
} from "@westbrookdaniel/palm";

function App() {
  const [count, setCount] = useState(0);

  const dec = () => setCount(count - 1);
  const inc = () => setCount(count + 1);

  return (
    <>
      <h1>Count: {count}</h1>
      <button onClick={dec}>Decrement</button>
      <button onClick={inc}>Increment</button>
      <TaggedTemplateApp />
    </>
  );
}

render(App, document.getElementById("app")!);

function TaggedTemplateApp() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Only once!");
  }, []);

  const dec = () => setCount(count - 1);
  const inc = () => setCount(count + 1);

  return html`
    <h1>Count: ${count}</h1>
    <button onClick=${dec}>Decrement</button>
    <button onClick=${inc}>Increment</button>
  `;
}

renderHtml(TaggedTemplateApp, document.getElementById("taggedTemplateApp")!);
```
