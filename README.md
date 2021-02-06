# didact
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