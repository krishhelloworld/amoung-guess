# Important JavaScript Object Methods for React

| Method / Feature | What it Does | Basic Example | Common React Use |
|---|---|---|---|
| `Object.keys()` | Gets all keys from object | `Object.keys(user)` | Looping field names |
| `Object.values()` | Gets all values | `Object.values(user)` | Rendering values |
| `Object.entries()` | Gets key-value pairs | `Object.entries(user)` | Most common for dynamic UI |
| `Object.assign()` | Merges objects | `Object.assign({}, a, b)` | Updating objects |
| Spread Operator `...` | Copies/merges objects | `const newObj = { ...obj }` | Updating React state |
| Destructuring | Extracts values | `const { name } = user` | Props and state |
| `delete` | Removes property | `delete user.age` | Removing fields |
| `hasOwnProperty()` | Checks if key exists | `user.hasOwnProperty("name")` | Validation |
| Optional Chaining `?.` | Prevents crashes | `user.address?.city` | API data |
| Dynamic Access `[]` | Access dynamic keys | `user[key]` | Dynamic forms |
| `Object.fromEntries()` | Array → Object | `Object.fromEntries(arr)` | Transforming data |
| `Object.freeze()` | Makes object readonly | `Object.freeze(user)` | Prevent accidental edits |

---

# 1. Object.keys()

## Object

```js
const user = {
  name: "Rahul",
  age: 25
};
```

## Code

```js
Object.keys(user);
```

## Output

```js
["name", "age"]
```

---

# 2. Object.values()

## Code

```js
Object.values(user);
```

## Output

```js
["Rahul", 25]
```

---

# 3. Object.entries()

## Code

```js
Object.entries(user);
```

## Output

```js
[
  ["name", "Rahul"],
  ["age", 25]
]
```

---

# 4. Looping with entries

```js
Object.entries(user).forEach(([key, value]) => {
  console.log(key, value);
});
```

---

# 5. Spread Operator ...

## Old Object

```js
const user = {
  name: "Rahul",
  age: 25
};
```

## Update Object

```js
const updatedUser = {
  ...user,
  age: 26
};
```

## Output

```js
{
  name: "Rahul",
  age: 26
}
```

---

# 6. React State Update Example

```jsx
const [user, setUser] = useState({
  name: "Rahul",
  age: 25
});

setUser({
  ...user,
  age: 26
});
```

---

# 7. Destructuring

## Code

```js
const user = {
  name: "Rahul",
  age: 25
};

const { name, age } = user;

console.log(name);
```

## Output

```js
Rahul
```

---

# 8. Dynamic Property Access

```js
const key = "name";

console.log(user[key]);
```

## Output

```js
Rahul
```

---

# 9. Optional Chaining

```js
const user = {};

console.log(user.address?.city);
```

## Output

```js
undefined
```

No crash happens.

---

# 10. Adding Properties

```js
const user = {};

user.name = "Rahul";

console.log(user);
```

---

# 11. Removing Properties

```js
delete user.name;
```

---

# 12. Nested Object

```js
const user = {
  name: "Rahul",
  address: {
    city: "Kanpur"
  }
};

console.log(user.address.city);
```

---

# 13. Updating Nested Object in React

```jsx
setUser({
  ...user,
  address: {
    ...user.address,
    city: "Delhi"
  }
});
```

---

# 14. Convert Array → Object

```js
const arr = [
  ["name", "Rahul"],
  ["age", 25]
];

const obj = Object.fromEntries(arr);

console.log(obj);
```

---

# 15. MOST IMPORTANT ARRAY METHODS FOR REACT

| Array Method | Purpose | Example |
|---|---|---|
| `map()` | Create UI | `arr.map()` |
| `filter()` | Remove items | `arr.filter()` |
| `find()` | Find one item | `arr.find()` |
| `forEach()` | Loop only | `arr.forEach()` |
| `reduce()` | Totals/calculations | `arr.reduce()` |

---

# React Example Using Everything

```jsx
function App() {
  const products = {
    101: {
      name: "Laptop",
      price: 50000
    },
    102: {
      name: "Phone",
      price: 20000
    }
  };

  return (
    <div>
      {Object.entries(products).map(([id, product]) => (
        <div key={id}>
          <h2>{product.name}</h2>
          <p>{product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

---

# Most Common React Patterns

| Pattern | Example |
|---|---|
| Render lists | `arr.map()` |
| Update state | `setState({...state})` |
| Read props | `function Card({title})` |
| Safe API access | `user?.profile?.name` |
| Dynamic fields | `obj[key]` |