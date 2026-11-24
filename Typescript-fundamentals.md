<!-- cspell:disable -->
# TypeScript Fundamentals

Vidi i ovde https://gemini.google.com/app/04427408ef439f30 

A study summary built from [first-app.ts](first-app.ts). Each section explains one concept,
shows the code from the file, and lists the gotchas worth remembering.

> Core idea: TypeScript types exist **only at compile time**. `tsc` checks them, then erases
> them. The `.js` output contains no `type`, no `interface`, no `: string`. Anything you need to
> check while the program runs (type guards) must use plain JavaScript.

---

## 1. Module scope — `export {}`

```ts
export { };
```

Without any `import`/`export`, TypeScript treats a file as a global script. Two such files
declaring `let user` would collide. An empty `export {}` turns the file into a module, so its
variables stay local.

---

## 2. Type inference

```ts
let UserName = 'Zoki'; // inferred: string
```

You don't have to write `: string` — TypeScript infers the type from the initial value.
`UserName = 5` would now be an error. Annotate explicitly only when there is no initial value
or the inferred type is too narrow/wide.

---

## 3. Union types — "this OR that"

```ts
type StringOrNum = string | number;
let userId: StringOrNum = 'zoran';
userId = 123; // OK
```

`|` allows a value to be one of several types. You can only use operations that are valid for
**all** members until you narrow it (see §11 Type guards).

---

## 4. Object types

```ts
let users: object;            // avoid — no info about the shape

let user: {
    name: string;
    age: number;
    isAdmin: boolean;
    id: string | number;
};
```

- `object` only says "not a primitive". `users.name` is an error — TS knows nothing about its keys.
- An inline object type describes the exact shape. Missing or extra properties in an object
  literal are errors.

---

## 5. Array types

```ts
let hobbies: string[];        // short form
let hobbies2: Array<string>;  // generic form — identical meaning
let brojevi: number[];
```

An array type always needs the element type. `string[]` is the common style;
`Array<string>` is the same thing written as a generic (see §12).

---

## 6. Functions — parameter and return types

```ts
function add(a: number, b: number) {
    return a + b; // return type inferred: number
}
```

- Parameters **must** be typed (otherwise they are implicitly `any`).
- The return type is usually inferred; write it (`): number {`) when you want TS to enforce it.
- `void` = the function returns nothing useful.

Gotchas from `mix(a: number, b: {}, c: string, l: [])`:

- `{}` does **not** mean "empty object" — it means "any non-null/undefined value" (even `5`).
- `[]` as a type is an **empty tuple**: only an array of length 0 is accepted.
  For "any array" use `unknown[]` or a concrete `string[]`.

---

## 7. Function types — functions as values

```ts
function calculate(
    a: number,
    b: number,
    calcFn: (a: number, b: number) => number // function type
) {
    calcFn(a, b);
}

calculate(2, 5, add);
```

`(a: number, b: number) => number` describes a function's signature: what it takes and what it
returns. Any function matching it (like `add`) can be passed in.

> Note: `calculate` calls `calcFn` but never `return`s the result, so it returns `undefined`.
> Write `return calcFn(a, b);` to get the value back.

---

## 8. Type aliases — `type`

```ts
type UserType = {
    name: string;
    age: number;
    isAdmin: boolean;
    id: string | number;
};
let user1: UserType;

type AddFnType = (a: number, b: number) => number;
function calculate1(a: number, b: number, calcFn: AddFnType) { ... }
```

`type` gives a name to **any** type: object shapes, unions, function signatures, literals.
Define once, reuse everywhere.

---

## 9. Interfaces

```ts
interface CredentaialInterface {
    password: string;
    email: string;
}

// Declaration merging: a second declaration with the same name ADDS fields
interface CredentaialInterface {
    userName: string;
}
// Result: { password; email; userName }
```

- `interface` describes **object shapes only** (no unions, no primitives).
- Same-name interfaces **merge** automatically. Two `type`s with the same name are an error.
- Both can be extended: interfaces with `extends`, types with `&` (see §10).

### `implements` — a class promises to match an interface

```ts
class AuthCredentials1 implements CredentaialInterface {
    password: string;
    email: string;
    userName: string;

    constructor(password: string, email: string, userName: string) {
        this.password = password;
        this.email = email;
        this.userName = userName;
    }
}
```

`implements` adds **nothing** to the class. It is only a checker: "does this class have all the
fields the interface lists?" If one is missing → error. The class must still declare the fields
itself, because the interface disappears after compilation.

### Parameter properties — the `public` shortcut

```ts
class AuthCredentials implements CredentaialInterface {
    constructor(
        public password: string,
        public email: string,
        public userName: string
    ) { }
}
```

`public` (or `private` / `protected` / `readonly`) in front of a constructor parameter makes TS
generate both the field declaration and `this.x = x`. Without the modifier, the parameter lives
only while the constructor runs.

### Structural typing

```ts
function login(credentials: CredentaialInterface) { ... }
login(new AuthCredentials('...', '...', 'Zoki'));
```

TypeScript compares **shapes**, not names. Any value with `password`, `email`, `userName`
fits — a class instance, or a plain object literal.

---

## 10. Combining types — `&` vs `extends`

```ts
// With types: intersection
type Admin   = { permissions: string[] };
type AppUser = { userName: string };
type AppAdmin = Admin & AppUser;     // must have BOTH

// With interfaces: extends
interface AppAdmin1 extends Admin, AppUser {}
```

- `A & B` = intersection: the value must satisfy both.
- `interface X extends A, B` does the same for interfaces.
- An interface can extend a `type` alias, as long as it is an object type — that is what
  `first-app.ts` actually does (it extends `Admin`/`AppUser`, not the unused `Admin1`/`AppUser1`).

Quick contrast:

- `|` union → value is **one of** the types
- `&` intersection → value is **all of** the types at once

---

## 11. Literal types — exact values only

```ts
type Role = 'admin' | 'user' | 'editor';
let role: Role | 123;

role = 'admin'; // OK
role = 123;     // OK
// role = 'zoki'; // error
// role = 1234;   // error
```

A literal type allows one specific value. A union of literals works like a lightweight enum and
gives editor autocomplete. Very common in React/Redux (action types, variant props).

---

## 12. Type guards — narrowing a union at runtime

Types are gone at runtime, so you narrow using real JavaScript checks. Inside each `if`, TS
knows the narrower type.

```ts
class FileAction { constructor(public fileName: string) {} }

function performAction1(
    action: string | number | FileAction | Admin | AppUser,
    role: Role
) {
    if (typeof action === 'string') { action.toUpperCase(); return; }  // string
    if (typeof action === 'number') { action.toFixed(2);   return; }  // number
    if (action instanceof FileAction) { action.fileName;  return; }  // FileAction
    if ('permissions' in action)      { action.permissions; return; } // Admin
    action.userName;                                                   // only AppUser left
}
```

Which guard to use:

- `typeof` → primitives: `string`, `number`, `boolean`, `bigint`, `symbol`, `function`, `object`
- `instanceof` → objects created from a **class** (classes exist at runtime)
- `in` → objects described by a `type`/`interface` (they don't exist at runtime, so check a property)

The early `return`s matter: each one removes a member from the union, so by the last line TS
has eliminated everything except `AppUser`.

---

## 13. Generics — types with parameters

### Built-in generic

```ts
let newRoles: Array<Role>;
let oldRoles: Role[]; // same thing
```

### Generic type

```ts
type DataStorage<T> = {
    storage: T[];
    add: (data: T) => void;
};

const textStorage: DataStorage<string> = {
    storage: [],
    add(data) { this.storage.push(data); } // data: string
};

type User = { firstName: string; lasttName: string };
const userStorage: DataStorage<User> = {
    storage: [],
    add(user) { }                           // user: User
};
```

`T` is a placeholder. A generic type works like a function **for types**: pass `string` in,
get a string storage out. One definition, many concrete types.

### Generic function

```ts
function merge<T, U>(a: T, b: U) {
    return { ...a, ...b };   // return type inferred: T & U
}

const newUser2 = merge({ name: 'Zoki' }, { age: 43 });
// newUser2: { name: string } & { age: number }
```

You don't pass `<T, U>` explicitly — TS infers them from the arguments, so `newUser2.name` and
`newUser2.age` are both known.

> Improvement: `merge<T extends object, U extends object>` would block calls like
> `merge(1, 2)`, where spreading makes no sense.

---

## Cheat sheet

- `let x = 'a'` → inferred `string`
- `string | number` → union: one of
- `A & B` → intersection: all of
- `'admin' | 'user'` → literal union: exact values only
- `string[]` = `Array<string>`
- `(a: number) => number` → function type
- `void` → returns nothing
- `type` → name for any type; cannot be redeclared
- `interface` → object shape; same-name declarations merge; `extends` to combine
- `implements` → checks a class against an interface; adds nothing
- `constructor(public x: string)` → declares and assigns the field
- `typeof` / `instanceof` / `in` → runtime narrowing
- `<T>` → generic placeholder, usually inferred
- `export {}` → make the file a module

---

## 14. React + TypeScript essentials

These concepts are not in `first-app.ts`, but you'll need them in almost every React or Redux
file. They're listed roughly in the order you'll run into them.

### 14.1 Optional properties — `?`

```ts
type CardProps = {
    title: string;
    subtitle?: string; // string | undefined — may be left out
};
```

`?` marks a property as optional. Inside the component, `subtitle` is `string | undefined`,
so check it (or give it a default) before using it.

### 14.2 Typing component props

```tsx
type CardProps = {
    title: string;
    subtitle?: string;
    onSelect: (id: string) => void;
};

function Card({ title, subtitle = 'No subtitle', onSelect }: CardProps) {
    return <h2 onClick={() => onSelect(title)}>{title} – {subtitle}</h2>;
}

<Card title="Hello" onSelect={(id) => console.log(id)} />;
// <Card />  → error: title and onSelect are missing
```

Props are just one object parameter, so you type them like any object (§4, §8). A default
value in the destructuring (`subtitle = '...'`) removes the `undefined`.

### 14.3 `children` and built-in element props

```tsx
import { type ReactNode, type ComponentPropsWithoutRef } from 'react';

type BoxProps = {
    children: ReactNode; // anything React can render: text, JSX, arrays, null
};

function Box({ children }: BoxProps) {
    return <div className="box">{children}</div>;
}

// Accept every normal <button> prop (onClick, disabled, type, ...) plus your own
type ButtonProps = ComponentPropsWithoutRef<'button'> & {
    variant: 'primary' | 'secondary';
};

function Button({ variant, ...rest }: ButtonProps) {
    return <button className={variant} {...rest} />;
}
```

`ReactNode` is the type for `children`. `ComponentPropsWithoutRef<'button'>` gives you all of a
real `<button>`'s props, so you don't retype them. `&` adds your own props (§10).

### 14.4 `useState` with a type parameter

```tsx
type User = { name: string; age: number };

const [user, setUser] = useState<User | null>(null);    // no user yet
const [tags, setTags] = useState<string[]>([]);         // empty list
const [count, setCount] = useState(0);                  // inferred: number — no <> needed
```

`useState` is a generic function (§13). When the initial value tells the whole story (`0`),
inference is enough. When it doesn't (`null`, `[]`), pass the type:

- `useState([])` → `never[]` → `setTags(['x'])` is an error
- `useState(null)` → `null` forever → `setUser({...})` is an error

### 14.5 Event types

```tsx
function Form() {
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        console.log(event.target.value);   // TS knows target is an <input>
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
    }

    return (
        <form onSubmit={handleSubmit}>
            <input onChange={handleChange} />
        </form>
    );
}
```

Common ones:

- `React.ChangeEvent<HTMLInputElement>` → `onChange` on inputs
- `React.FormEvent<HTMLFormElement>` → `onSubmit`
- `React.MouseEvent<HTMLButtonElement>` → `onClick`

Tip: when the handler is written inline (`onChange={(e) => ...}`), TS infers `e` for you.
Hover the prop in the editor to see the exact event type to copy.

### 14.6 `useRef` for DOM elements, `?.` and `!`

```tsx
const inputRef = useRef<HTMLInputElement>(null);

function readValue() {
    console.log(inputRef.current?.value);  // ?. → undefined if current is null
    console.log(inputRef.current!.value);  // !  → "trust me, it's not null"
}

return <input ref={inputRef} />;
```

- `?.` (optional chaining) is real JavaScript: it stops and returns `undefined` on `null`.
- `!` (non-null assertion) exists only in TS: it removes `null` from the type but checks
  nothing at runtime. If you're wrong, the app crashes. Prefer `?.` or an `if`.

### 14.7 Discriminated unions — the basis of reducers and Redux

```ts
type Item = { id: string; title: string };

type CartAction =
    | { type: 'ADD'; payload: Item }
    | { type: 'REMOVE'; id: string }
    | { type: 'CLEAR' };

function cartReducer(state: Item[], action: CartAction): Item[] {
    switch (action.type) {
        case 'ADD':
            return [...state, action.payload];             // TS knows: payload exists
        case 'REMOVE':
            return state.filter((i) => i.id !== action.id); // TS knows: id exists
        case 'CLEAR':
            return [];
    }
}
```

Every member of the union has a shared property (`type`) with a different literal value (§11).
Checking that one property narrows the whole object (§12), so TS knows which other fields exist.
Used by `useReducer`, Redux actions, and component variants.

### 14.8 Utility types — build new types from existing ones

```ts
type User = { id: string; name: string; email: string; age: number };

type UserUpdate  = Partial<User>;            // every field optional
type UserPreview = Pick<User, 'id' | 'name'>; // only these fields
type NewUser     = Omit<User, 'id'>;          // all except id
type UsersById   = Record<string, User>;      // { [id: string]: User }
type ReadonlyUser = Readonly<User>;           // fields can't be reassigned
```

They save you from copying fields by hand. When `User` changes, every derived type updates too.
Typical use: form state (`NewUser`), update payloads (`Partial`), lookup maps (`Record`).

### 14.9 `Promise<T>`, `unknown` vs `any`, and `as`

```ts
type Post = { id: number; title: string };

async function fetchPosts(): Promise<Post[]> {
    const response = await fetch('https://example.com/posts');
    const data: unknown = await response.json(); // we don't know what came back
    return data as Post[];                        // we tell TS what we expect
}
```

- An `async` function always returns `Promise<T>`; `T` is what you get after `await`.
- `any` turns type checking **off**: everything is allowed, mistakes go unnoticed.
- `unknown` keeps it **on**: you must narrow it (§12) or assert it before use.
- `as` (type assertion) tells TS "treat this as X". Like `!`, it checks nothing at runtime —
  if the server sends a different shape, TS won't catch it.

### 14.10 `import type`

```ts
import type { User } from './types';
import { useState, type ChangeEvent } from 'react';
```

`import type` imports a type only; the line is removed from the compiled JS. Vite's default
`tsconfig` enables `verbatimModuleSyntax`, which **requires** this for types — otherwise you
get an error.

### React cheat sheet

- `prop?: string` → optional prop
- `function C({ a }: Props)` → typed props
- `children: ReactNode` → anything renderable
- `ComponentPropsWithoutRef<'button'>` → all native button props
- `useState<T | null>(null)` / `useState<T[]>([])` → type when the initial value isn't enough
- `React.ChangeEvent<HTMLInputElement>` / `React.FormEvent<HTMLFormElement>` → event handlers
- `useRef<HTMLInputElement>(null)` + `ref.current?.value` → DOM refs
- `{ type: 'A'; ... } | { type: 'B'; ... }` + `switch` → reducers / Redux actions
- `Partial` / `Pick` / `Omit` / `Record` → derive types
- `Promise<T>` → async return type
- `unknown` over `any`; `as` and `!` check nothing at runtime
- `import type` → type-only import

---

## 15. Redux Toolkit + TypeScript

Redux Toolkit (RTK) is built so that TypeScript can **read** most types from your code instead
of you writing them. You type two things by hand — the initial state and each action's
payload — and derive the rest from the store.

Builds on: discriminated unions (§14.7), generics (§13), `import type` (§14.10).

### 15.1 A typed slice — `PayloadAction<T>`

```ts
// counterSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type CounterState = { value: number };

const initialState: CounterState = { value: 0 };

const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        increment(state) { state.value++; },
        addBy(state, action: PayloadAction<number>) { state.value += action.payload; },
    },
});

export const { increment, addBy } = counterSlice.actions;
export default counterSlice.reducer;
```

- Type the initial state explicitly (`CounterState`). Otherwise a value like `null` or `[]` gets
  a too-narrow type, the same problem as `useState` in §14.4.
- `PayloadAction<number>` → an action whose `payload` is a `number`.
- The generated action creators are typed too: `addBy(5)` is OK, `addBy('5')` is an error.

### 15.2 Store types — `typeof` and `ReturnType` at type level

```ts
// store.ts
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({ reducer: { counter: counterReducer } });

export type RootState   = ReturnType<typeof store.getState>; // { counter: { value: number } }
export type AppDispatch = typeof store.dispatch;
```

- `typeof value` in a type position → "the type of this JavaScript value".
- `ReturnType<typeof fn>` → "whatever this function returns".

You don't write `RootState` by hand. TS reads it from the store, so adding a new slice updates
it automatically and it can't get out of sync.

### 15.3 Typed hooks

```ts
// hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

```tsx
// Counter.tsx
function Counter() {
    const value = useAppSelector((state) => state.counter.value); // state: RootState
    const dispatch = useAppDispatch();

    return <button onClick={() => dispatch(addBy(2))}>{value}</button>;
}
```

Define the typed hooks once and use them everywhere instead of plain `useDispatch` /
`useSelector`. Then `state` inside a selector is known without annotating it each time.
`withTypes` needs react-redux 9.1 or newer.

### Redux cheat sheet

- `const initialState: SliceState = ...` → type the slice state explicitly
- `action: PayloadAction<T>` → typed action payload
- `ReturnType<typeof store.getState>` → `RootState`
- `typeof store.dispatch` → `AppDispatch`
- `useDispatch.withTypes<AppDispatch>()` / `useSelector.withTypes<RootState>()` → typed hooks

## Verify

Type-check the file (no output means no errors):

```bash
npx tsc --noEmit first-app.ts
```

# Section 3

## children:ReactNode
