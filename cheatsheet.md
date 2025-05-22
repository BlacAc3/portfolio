---

# 🧠 **Svelte Cheat Sheet for Complex Applications**

---

## 🔧 **Project Setup**

### Tooling

```bash
npm create svelte@latest my-app
cd my-app
npm install
```

### File Structure (Recommended)

```
src/
├── lib/              # Reusable components, stores, utilities
│   ├── components/
│   ├── stores/
│   └── utils/
├── routes/           # For SvelteKit routing
├── hooks.server.ts   # Server hooks (auth, cookies)
├── app.html
└── app.d.ts
```

---

## 📦 **Component Patterns**

### Props & Events

```svelte
<!-- Parent.svelte -->
<Child name="Ace" on:shout={handleShout} />

<!-- Child.svelte -->
<script>
  export let name;
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function shout() {
    dispatch('shout', { message: `${name} is great!` });
  }
</script>
```

### Slots & Composition

```svelte
<!-- Modal.svelte -->
<slot name="header" />
<slot /> <!-- default -->
<slot name="footer" />
```

---

## 🧠 **State Management**

### Local State

```svelte
<script>
  let count = 0;
</script>
```

### Global State (Writable Store)

```ts
// src/lib/stores/user.ts
import { writable } from 'svelte/store';
export const user = writable(null);
```

### Derived & Readable

```ts
import { derived } from 'svelte/store';

export const greeting = derived(user, $user => `Hello, ${$user?.name || 'Guest'}`);
```

### Custom Stores

```ts
function createCart() {
  const { subscribe, update } = writable([]);
  return {
    subscribe,
    add: (item) => update(cart => [...cart, item]),
    clear: () => update(() => [])
  };
}
export const cart = createCart();
```

---

## 🔄 **Reactivity**

### \$: Reactive Statements

```svelte
$: doubled = count * 2;
```

### Reactive Functions

```svelte
$: if (count > 10) alert('Too much!');
```

### Reactive Store Usage

```svelte
import { user } from '$lib/stores/user';
$: console.log($user);
```

---

## 🌐 **Routing & Layout (SvelteKit)**

### Layouts

* `+layout.svelte` — for shared headers, nav, etc.
* `+page.svelte` — route page
* `+layout.server.ts` — for load functions server-side

### Nested Routing

```
src/routes/
├── dashboard/
│   ├── +layout.svelte
│   └── +page.svelte
```

### Page Load Data

```ts
// +page.ts
export const load = async ({ fetch }) => {
  const res = await fetch('/api/data');
  return { data: await res.json() };
};
```

```svelte
<script>
  export let data;
</script>
```

---

## 🔐 **Auth & Security**

* Use `hooks.server.ts` to check session/cookies
* Protect routes using layout or page guards
* Sanitize any server-side rendering data

---

## 📡 **Networking & API**

### Using `fetch`

```ts
const res = await fetch('/api/items');
const items = await res.json();
```

### Form Actions

```ts
// +page.server.ts
export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const name = form.get('name');
    return { success: true };
  }
};
```

---

## 🧰 **Utilities**

### Debounce / Throttle

```ts
export function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
```

---

## 🖼️ **Animations & Transitions**

### Built-in

```svelte
<div transition:fade></div>
<div transition:slide></div>
```

### Custom

```ts
import { tweened } from 'svelte/motion';

const x = tweened(0, { duration: 400 });
```

---

## 📈 **Performance Tips**

* Use `bind:this` to reference DOM nodes for direct manipulation
* Avoid unnecessary reactivity (\$:) – use memoization
* Code-split large components using dynamic imports
* Use `<svelte:component>` to render components dynamically

---

## ⚙️ **Tooling and Libraries**

### Recommended Libraries

* Routing/API: SvelteKit
* State: Svelte stores, Zustand (via bridge)
* Forms: `svelte-forms-lib`, `felte`, or `@felte/validator-zod`
* UI: `skeleton`, `svelte-headlessui`, or `daisyUI + TailwindCSS`
* Validation: `zod`, `yup`
* Internationalization: `svelte-i18n`

---

## 🧪 **Testing & Debugging**

* **Unit Testing:** Vitest + Testing Library
* **E2E:** Playwright or Cypress
* **Linting:** ESLint + Prettier with Svelte plugin
* **Dev Tools:** Svelte Inspector (browser extension)

---

## 📦 **Deployment**

* **Adapters:** Use adapters like:

  * `@sveltejs/adapter-static` for static sites
  * `@sveltejs/adapter-node` for SSR
  * `@sveltejs/adapter-vercel` for Vercel
* **Environment Variables:**

  * `.env` → `VITE_PUBLIC_API_URL`
  * Access with `import.meta.env`

---

Would you like me to generate a **PDF version**, or split this into **interactive segments** to learn one section at a time, Sir?
