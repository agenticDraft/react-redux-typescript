# react-redux-typescript — course notes

Notes on how TypeScript is installed and run, first on its own, then inside a React + Vite project.

**TypeScript exists only while you write code. The browser and Node only ever see JavaScript.**

## The problem it solves

Browsers and Node do not understand type annotations. Hand them `let age: number = 30;` and they stop with a `SyntaxError` at the first `:`.

Something has to check the types and then strip them out. In plain TypeScript, `tsc` does both. In a Vite project the work is split between two tools.

## The flow

```text
Plain TypeScript
  app.ts ── npx tsc ──┬── type check  → errors printed in the terminal
                      └── strip types → app.js  → node app.js / <script>

React + Vite
  npm run dev    → Vite strips types on the fly   (no type check)
  npm run build  → tsc -b checks types (no .js output)
                   ↓ only if there are no errors
                   vite build → dist/
```

The non-obvious part: **`npm run dev` never checks types.** During development, type errors show up only as red underlines in VS Code, or in a separate `tsc` watcher (see below).

## Install TypeScript: locally, not globally

```bash
npm install --save-dev typescript
npx tsc --version
```

- **Local install** puts `tsc` in `node_modules/.bin/`. The version is recorded in `package.json`, so everyone who clones the repo gets the same compiler.
- **Global install with nvm** (`npm install -g typescript`) belongs to one Node version only. After `nvm use <other>` the command `tsc` is gone.
- **`npx`** exists because the shell searches only `PATH`, and `node_modules/.bin` is not on it:

```text
tsc --version       → zsh: command not found: tsc
npx tsc --version   → Version 7.0.2
```

- **Inside `package.json` scripts you don't need `npx`.** `npm run` adds `node_modules/.bin` to `PATH` itself, so `"build": "tsc"` works.
- **Install first, then use `npx`.** Run `npx tsc` before `npm install`, and npx offers to download a package that happens to be named `tsc`. That is an unrelated package, not TypeScript.

## Plain TypeScript

### Compile one file

```bash
npx tsc app.ts      # writes app.js next to app.ts
node app.js
```

Input and output from an actual run:

```text
app.ts                                   app.js
let age: number = 30;                    "use strict";
function hi(n: string) {                 let age = 30;
  return "Hi " + n;                      function hi(n) { return "Hi " + n; }
}                                        console.log(hi("Ana"), age);
console.log(hi("Ana"), age);
```

```text
$ node app.js
Hi Ana 30
```

### A type error

```text
$ npx tsc bad.ts
bad.ts(1,5): error TS2322: Type 'string' is not assignable to type 'number'.
```

The exit code is 2, but **`bad.js` is still written.** If you want no output while errors exist, set `"noEmitOnError": true` in `tsconfig.json`.

### Compile a whole project with `tsconfig.json`

```bash
npx tsc --init      # creates tsconfig.json
npx tsc             # no file name: compiles everything tsconfig.json covers
```

Once `tsconfig.json` exists, passing a file name is an error:

```text
$ npx tsc app.ts
error TS5112: tsconfig.json is present but will not be loaded if files are specified on commandline. Use '--ignoreConfig' to skip this error.
```

So use `npx tsc` with a config, or `npx tsc app.ts` without one. Don't mix the two.

### Watch mode

```bash
npx tsc --watch            # with tsconfig.json
npx tsc app.ts --watch     # single file, no tsconfig.json
```

The short form is `-w`. Stop it with `Ctrl+C`.

## TypeScript with React + Vite

### Create the project

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

`typescript` comes with the template as a devDependency, so there is nothing to install separately. The `scripts` it generates (create-vite 9.3.4):

```json
"dev": "vite",
"build": "tsc -b && vite build",
"lint": "oxlint",
"preview": "vite preview"
```

### Who does what

| Command | Strips types | Checks types | Output |
| --- | --- | --- | --- |
| `npm run dev` | Vite | no | served from memory |
| `npm run build` | Vite | `tsc -b` first | `dist/` |
| `npx tsc -b --watch` | — | yes, on every save | none (`noEmit` in `tsconfig.app.json`) |

Here `tsc` never writes `.js` files. `tsconfig.app.json` sets `"noEmit": true`, so `tsc` only checks types and Vite builds the JavaScript.

A type error stops the build before Vite runs:

```text
$ npm run build
> tsc -b && vite build
src/bad.ts(1,7): error TS2322: Type 'string' is not assignable to type 'number'.
```

### Type-check watcher next to the dev server

Run it in a second terminal:

```bash
npx tsc -b --watch
```

```text
src/bad.ts(1,7): error TS2322: Type 'string' is not assignable to type 'number'.
12:22:45 AM - Found 1 error. Watching for file changes.
```

Use `-b`. The root `tsconfig.json` has `"files": []` and only points to `tsconfig.app.json` and `tsconfig.node.json`. Without `-b`, `npx tsc --noEmit` checks nothing and exits 0, **even when there are type errors.**

### Several config files

- `tsconfig.json` — no files of its own; references the other two.
- `tsconfig.app.json` — your code in `src/` (browser, JSX).
- `tsconfig.node.json` — `vite.config.ts`, which runs in Node.

## Limits you should know

- **Versions change.** These notes were checked with Node 24.12.0, TypeScript 7.0.2, create-vite 9.3.4 and Vite 8.3.8. Older tutorials mention esbuild as Vite's TypeScript transformer. Vite 8 uses Rolldown instead. The split is the same: Vite strips, `tsc` checks.
- **`tsc --init` output differs between versions.** TypeScript 7 turns on `strict`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` by default. Course code written for older defaults may show errors that the course video does not.
- **VS Code needs no extension for TypeScript.** Type checking, autocomplete and auto-imports are built in. React snippet extensions are optional.
