# @dbarone/didact

- [@dbarone/didact](#dbaronedidact)
  - [Introduction](#introduction)
  - [Comparison to React](#comparison-to-react)
  - [Components](#components)
  - [Rendering](#rendering)
    - [Packages](#packages)
    - [Webpack Configuration](#webpack-configuration)
    - [Babel Configuration](#babel-configuration)
  - [Fragments](#fragments)
  - [Hooks](#hooks)
    - [useState](#usestate)
    - [useEffect](#useeffect)
    - [useMemo](#usememo)
    - [useCallback](#usecallback)
  - [Building](#building)
    - [TypeScript Compiler (tsc)](#typescript-compiler-tsc)
    - [WebPack + tsloader](#webpack--tsloader)
  - [Linking](#linking)
  - [Versioning](#versioning)
  - [Publishing](#publishing)
  - [How the library works](#how-the-library-works)
    - [JSX and createElement()](#jsx-and-createelement)
    - [render()](#render)
    - [Walkthrough of render process](#walkthrough-of-render-process)
    - [DidactState](#didactstate)
  - [Bibliography](#bibliography)

## Introduction
Tiny React clone based on the original Didact library which can be found at: https://github.com/pomber/didact. The original Didact step-by-step tutorial can also be found at https://pomb.us/build-your-own-react/. This is my copy of didact which has also been published to npm for use in my personal projects.

*Note: if you're looking for the original Didact, please go to https://www.npmjs.com/package/didact*

The original Didact source code has been slightly modified in the following ways:
1. Conversion to TypeScript and split into multiple files for improved readability.
2. Inclusion of addition hooks (Thanks to https://github.com/manasb-uoe/didact)
3. Inclusion of tests

The code has been split into a number of TypeScript modules allowing for better understanding of the library. The build process compiles to regular .js files. These files are placed in the /dist folder.

This project has also been used to let me play around with publishing packages to the npm repository, and in particular:
1. General publishing of packages to npm
2. Including TypeScript and WebPack in the build process

## Comparison to React

| Feature             | React | Didact |
| ------------------- | ----- | ------ |
| Function Components | Yes   | Yes    |
| Class Components    | Yes   | No     |
| Fragments           | Yes   | Yes    |

## Components

Like other React clones, Components represent the basic building block in Didact. Only functional components are supported. Functional components can have an optional `props` argument.

``` javascript
import Didact from "@dbarone/didact"
const { render, useState } = Didact

function Hello(props) {
  return <div>Hello {props.location}!</div>;
}

const element = <Hello location="World" />
const container = document.getElementById("root")
render(element, container)
```

The `props` argument can be alternatively destructured:

``` javascript
import Didact from "@dbarone/didact"
const { render, useState } = Didact

function Hello({location}) {
  return <div>Hello {location}!</div>;
}

const element = <Hello location="World" />
const container = document.getElementById("root")
render(element, container)
```

## Rendering
Each function typically returns an HTML fragment used to render the component. Normally this will be JSX syntax. If using JSX, the function name must start with a capital letter, and there must be a single root fragment. The `<>..</>` syntax is not permitted. A valid element like `<div>...</div>` must be used. If using JSX, you will also need the following configuration:

### Packages
- @babel/core
- @babel/preset-env
- @babel/plugin-transform-react-jsx
- @babel-loader

### Webpack Configuration
``` javascript
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },
```

### Babel Configuration
``` javascript
{
    "presets": [
      "@babel/preset-env"
    ],
  
    "plugins": [
        ["@babel/plugin-transform-react-jsx", {
          "pragma": "Didact.createElement",
          "throwIfNamespace": false
        }]
      ]
}
```

JSX is not mandatory. The JSX syntax is simply converted to:

`Didact.createElement(component, props, ...children)`

so the above example can be rewritten without using JSX as follows:

``` javascript
import Didact from "@dbarone/didact"
const { render, useState, createElement } = Didact

function Hello({location}) {
  return createElement("div", null, `Hello ${location}!`);
}

const element = createElement(Hello, { location: "World" }, null);
const container = document.getElementById("root")
render(element, container)
```
## Fragments

JSX requires a block to have a single root element. Occasionally, this can result in invalid HTML, for example within tables. In these cases, and where you don't want to add an unnecessary `div` node, you can use the `Fragment` node:

``` javascript
import Didact from "@dbarone/didact"
const { render, Fragment } = Didact

function MyTable({ rows }) {
  return (
    <table>
      <tbody>
        <MyRows />
      </tbody>
    </table>
  )
}

function MyRows() {
  let data = [
    "apples", "bananas", "pears", "oranges"
  ];

  return (
    <Fragment>
      {data.map(d => <tr><td>{d}</td></tr>)}
    </Fragment>
  )
}

const element = <MyTable />;
const container = document.getElementById("root");
render(element, container);
```

## Hooks
Hooks are used to maintain state, and build in effects and lifecycle events. There are a number of hooks available:
- useState
- useEffect
- useMemo
- useCallback


### useState
The useState hook is used to maintain internal state within a component. Along with `props` they are the 2 mechanisms that state can be maintained. The useState hook accepts a single parameter which is the initial state. The result of invoking the hook is an array with 2 elements. The first is a getter for the state, and the second is a setter for the state.

``` javascript
import Didact from "@dbarone/didact"
const { render, useState } = Didact

const Counter = () => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  )
}

const element = <Counter />;
const container = document.getElementById("root");
render(element, container);
```

### useEffect
The useEffect hook is the main way to trigger side-effects. useEffect is often used to get data from an API. 

``` javascript
import Didact from "@dbarone/didact"
const { render, useEffect } = Didact

const Counter = () => {
  useEffect(() => { alert("in useEffect!") });

  return (
    <div>Hello World!</div>
  )
}

const element = <Counter />;
const container = document.getElementById("root");
render(element, container);
```

### useMemo
The useMemo hook is used to memoize the results of an expensive computation. The computation will only be calculated when one of the dependencies change. An example of its usage is shown below:

``` javascript
import Didact from "@dbarone/didact"
const { render, useState, createElement, useMemo } = Didact

function UseMemoExample() {
  const [value1, setValue1] = useState(0);
  const [value2, setValue2] = useState(0);
  const [value3, setValue3] = useState(0);

  function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }
  
  // Really slow implementation of multiplication operation.
  function slowMultiply(value1, value2){
    console.log('In expensive function');
    sleep(1000);
    return value1 * value2;
  }
  // memoized function
  const memoized = useMemo(
    () => slowMultiply(value1, value2),
     // Only re-run the expensive function when any of these dependencies change
    [value1, value2]
  );
  
  return (
    <div>
      <i>This example illustrates the use of useMemo. Click on the buttons to change the state of value1, value2, and value3. Only when value1 or value2 change, will an expensive computation occur.</i>
      <div>Value #1: {value1}</div>
      <div>Value #2: {value2}</div>
      <div>Value #3: {value3}</div>
      <div>Memoized (value1 * value2): {memoized}</div>
      <button onClick={() => setValue1(c => c + 1)}>Increment #1</button>
      <button onClick={() => setValue2(c => c + 1)}>Increment #2</button>
      <button onClick={() => setValue3(c => c + 1)}>Increment #3</button>
    </div>
  )
}

const element = <UseMemoExample />;
const container = document.getElementById("root");
render(element, container);
```

### useCallback
the `useCallback` hook returns a memoized callback function. The callback function will only change if one of the dependencies change. This is useful when passing callbacks to child components that rely on reference equality to prevent unnecessary renders.

`useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

An example of its usage is shown below:

``` javascript
import Didact from "@dbarone/didact"
import { useCallback } from "@dbarone/didact/dist/useCallback";
const { render } = Didact

// Could search a big list of items using a search term, e.g. an API call.
function doSearch(term) {
  return [
    'apple',
    'banana'
  ];
}

function ClickableList({ term, onItemClick }) {
  const items = doSearch(term);
  const map = item => <div onClick={onItemClick}>{item}</div>;
  return <div>{items.map(map)}</div>;
}

function UseCallbackExample({ term }) {
  const onItemClick = useCallback(event => {
    console.log('You clicked ', event.currentTarget);
  }, [term]);

  return (
    <ClickableList
      term={term}
      onItemClick={onItemClick}
    />
  );
}

const element = <UseCallbackExample term="Fruits" />;
const container = document.getElementById("root");
render(element, container);
```

## Building

This package can actually be built 2 ways:
- Using TypeScript compiler (tsc)
- Bundling using WebPack + tsloader

### TypeScript Compiler (tsc)

To compile using the TypeScript compiler, you'll need to run the **compile** npm script. This will compile all the .ts files and place native .js files and corresponding TypeScript type information (.d.ts files) into the /dist folder. The entry point is didact.js.

### WebPack + tsloader

To build using WebPack, you'll need to run the **build** npm script. This will use the **tsloader** module to compile the separate .ts files into a single bundled .js file. The entry point is also didact.js.

## Linking

This project can be included in a client package using npm install @dbarone/didact. However, if the source code is downloaded to your local PC, you can actually create a virtual symlink as follows:
- Open up this project locally, and in the package folder, run `npm link`
- Open the client ui project locally, and run `npm link @dbarone/didact`

The benefit of this approach, is that any changes to the @dbarone/didact project will be instantly available from the client ui project.

## Versioning

When publishing an update of the package to npm, the version number must be incremented

## Publishing

A test publish can be done using:

```
npm publish --dry-run
```

To perform a full publish, run:

```
npm publish
```

Note that the version number will need to be incremented first, and the Git working directory must be clean (all changes checked in). The patch level can be incremented via:

```
npm version patch
```

## How the library works

### JSX and createElement()
The first thing to understand is how JSX is automagically processed. Preprocessors like Babel take JSX and convert into a series of calls to `createElement`. The default handler is `React.createElement`, but this can be modified in the Babel configuration file:

``` javascript
"plugins": [
        ["@babel/plugin-transform-react-jsx", {
          "pragma": "Didact.createElement", // default pragma is React.createElement
          "pragmaFrag": "Didact.fragment",
          "throwIfNamespace": false // defaults to true
        }]
      ]
```

Any JSX found by the Babel preprocessor is converted to a series of calls to `Didact.createElement`, passing in 3 parameters:
- The tag name as the element type (for example 'div')
- The attributes of the node are passed in a `props` object
- The children as passed as a `children` array

### render()

React has another method `ReactDOM.render`. This is the method that actually renders the element within a parent dom node. A very simple implementation of a `render` method could theoretically take the JSX object and execute `document.createElement` and `parent.appendChild` JavaScript statements to add real elements to the DOM. However, this would only create a one-time static representation of the JSX, and would not allow reactive updates to the DOM as components are freely allowed to update JSX conditionally.

To create a reactive implementation, React and other libraries utilise a virtual DOM and a a reconciliation process which compares the virtual DOM to the browser DOM, and add, update, and delete nodes as necessary. The rendering can require a large node hierarchy to be processed, and to avoid blocking issues, any tree-rendering is broken into small chunks known as `Fibers`. A Fiber tree is generated, and looped through. The rough series of steps is shown below:

### Walkthrough of render process

**Render(element, container)** called
- State initialised using DidactState object:
- wipRoot set to new Fiber
- wipRoot.dom set to container
- wipRoot.props.children set to element
- wipRoot.alternate set to currentRoot (undefined)
- nextUnitOfWork set to wipRoot
- window.requestIdleCallback(workLoop) set up to call WorkLook in loop

**WorkLoop** performed single unit of work, repeatedly. Each look iteration does:
- Calls performUnitOfWork, which returns the next unit, and grooms the fiber tree.
- When no more units of work returned by perUnitOfWork, calls commitRoot()

**PerformUnitOfWork**
- Updates either:
  - Normal component: updateHostComponent(fiber)
  - Function component: updateFunctionComponent(fiber)

**UpdateHostComponent**
- Creates dom node for fiber (if no dom property)
- Performs reconcileChildren between the fiber's dom node, and its children properties

**updateFunctionComponent**
- Calls the function to derive the children of the function
- Performs reconcileChildren between the fiber's dom node, and its children properties

**reconcileChildren**
- Compares the document dom to the virtual dom and creates/updates/deletes new dom nodes as necessary.

**CommitRoot**
- Perform physical deletions from dom
- If any child record in state, commit that, calling CommitWork()

**CommitWork**
- Physically appends doms to their parent doms

Rendering a very simple test component called `Test` with the following JSX:

``` javascript
<>
  xyz
</>
```

results in the following iterative calls in `workLoop`:

| Iteration | wipRoot.dom | nextUnitOfWork   | wipRoot.props.children |
| --------- | ----------- | ---------------- | ---------------------- |
| 1         | #root       | #root            | [fn Test()]            |
| 2         | #root       | fn Test()        | fn Fragment()          |
| 3         | #root       | fn Fragment()    | nodeValue('xyz')       |
| 4         | #root       | nodeValue('xyz') | []                     |

### DidactState

The DidactState object persists all the state of the reconciliation and rendering work. The object has the following properties:
- wipRoot: Fiber object that represents the root of the tree
- currentRoot: Fiber representing the current root during reconciliation?
- deletions: An array of Fiber objects that keep track of nodes we want to remove from the dom based on the reconciliation process
- wipFiber: Fiber object representing the current Fiber object being processed
- nextUnitOfWork: Fiber object representing the next Fiber object to process
- hookIndex: number

## Bibliography
- **Self-contained Didact tutorial:** https://pomb.us/build-your-own-react/
- **Original Didact source:** https://github.com/pomber/didact
- **Fork of Didact converted to TypeScript and including hooks:** https://github.com/manasb-uoe/didact
- **Npm link reference:** https://docs.npmjs.com/cli/v6/commands/npm-link
- **How to create + publish an npm package built with TypeScript:** https://dev.to/charperbonaroo/creating-a-ts-written-npm-package-for-use-in-node-js-or-browser-5gm3
- **How to develop, test, run and publish npm packages:** https://medium.com/javascript-in-plain-english/how-to-develop-test-run-and-publish-an-npm-module-react-and-webpack-f436adb54bbb
- **Incrementing the package.json version number:** https://docs.npmjs.com/updating-your-published-package-version-number
- **Publishing TypeScript packages to npm:** https://medium.com/cameron-nokes/the-30-second-guide-to-publishing-a-typescript-package-to-npm-89d93ff7bccd
- **useMemo and useCallback**: https://kentcdodds.com/blog/usememo-and-usecallback
- **useCallback example**: https://dmitripavlutin.com/dont-overuse-react-usecallback/
- **React Hooks reference**: https://reactjs.org/docs/hooks-reference.html
- **Preact Guide**: https://preactjs.com/guide/v10/getting-started