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
    - [useMemo](#usememo)
    - [useCallback](#usecallback)
  - [Building](#building)
    - [TypeScript Compiler (tsc)](#typescript-compiler-tsc)
    - [WebPack + tsloader](#webpack--tsloader)
  - [Linking](#linking)
  - [Versioning](#versioning)
  - [Publishing](#publishing)
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
| React <> fragment   | Yes   | No     |

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
- useMemo
- useCallback
- useEffect

### useState

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