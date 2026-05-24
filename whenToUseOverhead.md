Perfect — this is the exact point where most React developers get confused.

The issue is:

```txt
All 3 are related to rendering optimization
BUT
they optimize DIFFERENT things
```

So now I'll show you:

1. Correct usage of all 3 together
2. Wrong usage
3. What breaks
4. Why it breaks
5. When one cannot replace another

This will make it crystal clear.

---

# FIRST: The Visual Mental Model

---

# `React.memo`

Optimizes:

```txt
COMPONENT RE-RENDERING
```

---

# `useMemo`

Optimizes:

```txt
EXPENSIVE VALUES / CALCULATIONS
```

---

# `useCallback`

Optimizes:

```txt
FUNCTION REFERENCES
```

---

# THE MOST IMPORTANT THING

These are NOT interchangeable.

You cannot replace:

* `useCallback` with `React.memo`
* `useMemo` with `useCallback`
* `React.memo` with `useMemo`

Because each solves a different problem.

---

# REAL WORLD EXAMPLE

Imagine an ecommerce app.

We have:

* product list
* expensive filtering
* memoized cards
* add to cart button

---

# STEP 1 — WITHOUT ANY OPTIMIZATION

```jsx id="qsy2ys"
function ProductCard({ product, onAdd }) {
  console.log("Card render:", product.name);

  return (
    <div>
      <h3>{product.name}</h3>

      <button onClick={() => onAdd(product.id)}>
        Add
      </button>
    </div>
  );
}

export default function Store({ products }) {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter(p =>
    p.name.includes(search)
  );

  const handleAdd = (id) => {
    console.log("Added:", id);
  };

  return (
    <>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={handleAdd}
        />
      ))}
    </>
  );
}
```

---

# PROBLEMS

Every keystroke:

* Store re-renders
* filtering recalculates
* ALL ProductCards re-render
* new handleAdd function created

Very expensive in large lists.

---

# NOW LET'S FIX IT PROPERLY

---

# STEP 2 — ADD `React.memo`

```jsx id="xhmx6x"
const ProductCard = React.memo(function ProductCard({
  product,
  onAdd
}) {
  console.log("Card render:", product.name);

  return (
    <div>
      <h3>{product.name}</h3>

      <button onClick={() => onAdd(product.id)}>
        Add
      </button>
    </div>
  );
});
```

---

# WHAT WE EXPECT

```txt
"Cards should stop re-rendering"
```

BUT THEY STILL RE-RENDER.

Why?

Because THIS changes every render:

```jsx id="j7d0w3"
const handleAdd = (id) => {}
```

New function reference every render.

`React.memo` compares props shallowly.

So:

```txt
old onAdd !== new onAdd
```

Therefore:

* ProductCard re-renders anyway

---

# IMPORTANT LESSON

`React.memo` CANNOT stabilize functions.

That is NOT its job.

---

# STEP 3 — FIX WITH `useCallback`

```jsx id="0k9fxf"
const handleAdd = useCallback((id) => {
  console.log("Added:", id);
}, []);
```

NOW:

* same function reference
* ProductCard props stable
* `React.memo` works properly

---

# THIS IS THE RELATIONSHIP

| Tool          | Responsibility            |
| ------------- | ------------------------- |
| `React.memo`  | Skip child render         |
| `useCallback` | Keep function prop stable |

They often work TOGETHER.

---

# STEP 4 — FILTERING STILL EXPENSIVE

Even now:

```jsx id="qj97dh"
products.filter(...)
```

runs every render.

This is NOT a rendering problem.

This is a:

```txt
calculation problem
```

---

# FIX WITH `useMemo`

```jsx id="m1xctj"
const filteredProducts = useMemo(() => {
  return products.filter(p =>
    p.name.includes(search)
  );
}, [products, search]);
```

Now filtering only runs when:

* products change
* search changes

---

# FINAL OPTIMIZED VERSION

```jsx id="3kpwbq"
const ProductCard = React.memo(function ProductCard({
  product,
  onAdd
}) {
  console.log("Card render:", product.name);

  return (
    <div>
      <h3>{product.name}</h3>

      <button onClick={() => onAdd(product.id)}>
        Add
      </button>
    </div>
  );
});

export default function Store({ products }) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    console.log("Filtering...");
    
    return products.filter(p =>
      p.name.includes(search)
    );
  }, [products, search]);

  const handleAdd = useCallback((id) => {
    console.log("Added:", id);
  }, []);

  return (
    <>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={handleAdd}
        />
      ))}
    </>
  );
}
```

---

# NOW LET'S SEE WRONG USAGE

THIS is where understanding becomes deep.

---

# WRONG CASE 1

## Using `React.memo` instead of `useCallback`

---

## ❌ WRONG

```jsx id="spkj0x"
const handleAdd = React.memo((id) => {
  console.log(id);
});
```

---

# WHY WRONG?

`React.memo` only works on:

```txt
COMPONENTS
```

NOT functions.

It expects:

```jsx
<Component />
```

not:

```js
() => {}
```

---

# WRONG CASE 2

## Using `useMemo` instead of `useCallback`

---

## ❌ Technically Works But Wrong

```jsx id="4lr0zc"
const handleAdd = useMemo(() => {
  return (id) => {
    console.log(id);
  };
}, []);
```

---

# WHY BAD?

Because:

* harder to read
* intention unclear
* `useCallback` exists specifically for this

---

# CORRECT

```jsx id="d9a7z5"
const handleAdd = useCallback((id) => {
  console.log(id);
}, []);
```

Cleaner semantic meaning.

---

# WRONG CASE 3

## Using `useCallback` for expensive calculations

---

## ❌ WRONG

```jsx id="2z8vk9"
const filtered = useCallback(() => {
  return products.filter(p => p.active);
}, [products]);
```

---

# WHY WRONG?

This memoizes:

```txt
THE FUNCTION
```

NOT the result.

So every time you call:

```jsx id="m4ycjm"
filtered()
```

it recalculates again.

---

# CORRECT

```jsx id="pxv0ut"
const filtered = useMemo(() => {
  return products.filter(p => p.active);
}, [products]);
```

Now RESULT is cached.

---

# WRONG CASE 4

## Using `useMemo` to stop component renders

---

## ❌ WRONG

```jsx id="pyrv73"
const card = useMemo(() => {
  return <ProductCard product={product} />;
}, [product]);
```

---

# WHY BAD?

This memoizes:

```txt
JSX VALUE
```

NOT component render lifecycle properly.

Very awkward optimization.

---

# CORRECT

```jsx id="a5l22k"
const ProductCard = React.memo(...)
```

---

# THE BIGGEST CONFUSION

---

# `useCallback` DOES NOT prevent renders

People think:

```txt
useCallback = component optimization
```

No.

It ONLY stabilizes function references.

The render skipping happens because of:

```txt
React.memo
```

---

# Think of It Like a Team

---

# `React.memo`

Says:

```txt
"I can skip rendering IF props stay same"
```

---

# `useCallback`

Says:

```txt
"I'll keep this function prop same"
```

---

# `useMemo`

Says:

```txt
"I'll keep this calculated value same"
```

---

# Another SUPER CLEAR Example

---

# Dashboard Widget

Imagine:

* dashboard rerenders every second
* chart component expensive

---

# ❌ BAD

```jsx id="v3ixlh"
<Chart
  data={processData(rawData)}
  onZoom={() => console.log("zoom")}
/>
```

Problems:

* processData runs every render
* onZoom recreated every render

---

# ✅ GOOD

```jsx id="jpd5c5"
const processedData = useMemo(() => {
  return processData(rawData);
}, [rawData]);

const handleZoom = useCallback(() => {
  console.log("zoom");
}, []);

const Chart = React.memo(ChartComponent);

<Chart
  data={processedData}
  onZoom={handleZoom}
/>
```

---

# PERFECT MENTAL CHECKLIST

Before using one, ask:

---

# Is the problem:

## "Component rerenders too much?"

Use:

```txt
React.memo
```

---

# Is the problem:

## "Expensive calculation reruns?"

Use:

```txt
useMemo
```

---

# Is the problem:

## "Function prop changes every render?"

Use:

```txt
useCallback
```

---

# FINAL SENIOR-LEVEL ADVICE

Most apps should NOT aggressively use all three everywhere.

Overusing them causes:

* memory overhead
* dependency bugs
* stale closures
* harder debugging
* readability loss

Use them ONLY when:

* profiler shows render issues
* expensive computations exist
* memoized children need stable props

Otherwise:

```txt
simple React is usually fastest React
```
