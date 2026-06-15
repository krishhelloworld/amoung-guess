This is a very good way to think about React effects:

> **If something lives outside React, React won't automatically destroy it.**
>
> You must tell React how to clean it up in the `return` function.

---

# 1. React vs Browser: Who Owns What?

| React Manages                  | Browser / JS Runtime Manages         |
| ------------------------------ | ------------------------------------ |
| Components                     | Timers (`setInterval`, `setTimeout`) |
| State (`useState`)             | Event Listeners                      |
| Props                          | Network Requests (`fetch`)           |
| Re-renders                     | WebSockets                           |
| Context                        | Server-Sent Events                   |
| Virtual DOM                    | DOM Events                           |
| Effect lifecycle (`useEffect`) | Geolocation                          |
| Memoization (`useMemo`)        | Media Streams (Camera/Mic)           |
| Refs (`useRef`)                | Web Workers                          |
| Custom Hooks                   | Animation Frames                     |
| Component Mounting             | IndexedDB Connections                |
| Component Unmounting           | Broadcast Channels                   |
| Dependency Tracking            | MutationObserver                     |
| State Updates                  | ResizeObserver                       |
| Rendering UI                   | IntersectionObserver                 |

---

## Example

React owns:

```jsx
const [count, setCount] = useState(0);
```

When component dies:

```jsx
<Component />
```

React automatically destroys:

* state
* props
* virtual DOM

No cleanup needed.

---

But for:

```jsx
setInterval(() => {
  console.log("tick");
}, 1000);
```

The browser owns it.

React has no idea when to stop it.

You must do:

```jsx
return () => clearInterval(id);
```

---

# 2. Common Browser APIs We Create and How to Clean Them Up

## Timers

| Create          | Cleanup           |
| --------------- | ----------------- |
| `setInterval()` | `clearInterval()` |
| `setTimeout()`  | `clearTimeout()`  |

Example:

```jsx
useEffect(() => {
  const id = setInterval(run, 1000);

  return () => clearInterval(id);
}, []);
```

---

## Event Listeners

| Create               | Cleanup                 |
| -------------------- | ----------------------- |
| `addEventListener()` | `removeEventListener()` |

Example:

```jsx
useEffect(() => {
  const handleResize = () => {};

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
```

---

## Network Requests

| Create    | Cleanup                   |
| --------- | ------------------------- |
| `fetch()` | `AbortController.abort()` |

Example:

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetch("/users", {
    signal: controller.signal,
  });

  return () => controller.abort();
}, []);
```

---

## WebSockets

| Create            | Cleanup          |
| ----------------- | ---------------- |
| `new WebSocket()` | `socket.close()` |

```jsx
useEffect(() => {
  const socket = new WebSocket(url);

  return () => socket.close();
}, []);
```

---

## Animation Frames

Used for games and animations.

| Create                    | Cleanup                  |
| ------------------------- | ------------------------ |
| `requestAnimationFrame()` | `cancelAnimationFrame()` |

```jsx
useEffect(() => {
  const id = requestAnimationFrame(run);

  return () => cancelAnimationFrame(id);
}, []);
```

---

## Geolocation Watch

| Create            | Cleanup        |
| ----------------- | -------------- |
| `watchPosition()` | `clearWatch()` |

```jsx
useEffect(() => {
  const id = navigator.geolocation.watchPosition(
    console.log
  );

  return () => navigator.geolocation.clearWatch(id);
}, []);
```

---

## Mutation Observer

Tracks DOM changes.

| Create                   | Cleanup        |
| ------------------------ | -------------- |
| `new MutationObserver()` | `disconnect()` |

```jsx
useEffect(() => {
  const observer = new MutationObserver(cb);

  observer.observe(node);

  return () => observer.disconnect();
}, []);
```

---

## Resize Observer

Tracks element size changes.

| Create                 | Cleanup        |
| ---------------------- | -------------- |
| `new ResizeObserver()` | `disconnect()` |

```jsx
return () => observer.disconnect();
```

---

## Intersection Observer

Tracks visibility.

| Create                       | Cleanup        |
| ---------------------------- | -------------- |
| `new IntersectionObserver()` | `disconnect()` |

```jsx
return () => observer.disconnect();
```

---

## Server Sent Events (SSE)

| Create              | Cleanup   |
| ------------------- | --------- |
| `new EventSource()` | `close()` |

```jsx
return () => source.close();
```

---

## Web Worker

Runs JS in background thread.

| Create         | Cleanup       |
| -------------- | ------------- |
| `new Worker()` | `terminate()` |

```jsx
return () => worker.terminate();
```

---

## Media Stream (Camera/Microphone)

| Create           | Cleanup        |
| ---------------- | -------------- |
| `getUserMedia()` | `track.stop()` |

```jsx
return () => {
  stream.getTracks().forEach(track => track.stop());
};
```

---

# 3. Backend Resources (Node.js) and Their Cleanup

These are common in repositories.

| Create                | Cleanup                      |
| --------------------- | ---------------------------- |
| `setInterval()`       | `clearInterval()`            |
| `setTimeout()`        | `clearTimeout()`             |
| Database Connection   | `close()` / `disconnect()`   |
| Redis Client          | `quit()` / `disconnect()`    |
| RabbitMQ Channel      | `close()`                    |
| Kafka Consumer        | `disconnect()`               |
| HTTP Server           | `server.close()`             |
| File Stream           | `stream.destroy()`           |
| Read Stream           | `stream.close()`             |
| Write Stream          | `stream.end()`               |
| Socket Connection     | `socket.destroy()`           |
| EventEmitter Listener | `removeListener()` / `off()` |
| Cron Job              | `job.stop()`                 |

---

## Express Server

Create:

```js
const server = app.listen(3000);
```

Cleanup:

```js
server.close();
```

---

## MongoDB

Create:

```js
await mongoose.connect(url);
```

Cleanup:

```js
await mongoose.disconnect();
```

---

## Redis

Create:

```js
const client = createClient();
```

Cleanup:

```js
await client.quit();
```

---

# 4. The Senior Developer Mental Model

Whenever you see something created, immediately ask:

| Question                            | Example                         |
| ----------------------------------- | ------------------------------- |
| Who owns this?                      | React? Browser? Node? Database? |
| Will it continue running by itself? | Timer, socket, listener         |
| How do I stop it?                   | clearInterval, close, abort     |
| Where should I stop it?             | `useEffect` cleanup             |

---

### Quick Cheat Sheet

| Started This           | Stop With              |
| ---------------------- | ---------------------- |
| `setInterval`          | `clearInterval`        |
| `setTimeout`           | `clearTimeout`         |
| `addEventListener`     | `removeEventListener`  |
| `fetch`                | `abort`                |
| `WebSocket`            | `close`                |
| `EventSource`          | `close`                |
| `Worker`               | `terminate`            |
| `watchPosition`        | `clearWatch`           |
| `MutationObserver`     | `disconnect`           |
| `ResizeObserver`       | `disconnect`           |
| `IntersectionObserver` | `disconnect`           |
| Camera/Mic             | `track.stop()`         |
| DB Connection          | `disconnect` / `close` |
| Redis                  | `quit`                 |
| Server                 | `close`                |

A useful rule for React interviews and real projects:

> If your `useEffect` creates something that can keep working after the component disappears, it probably needs a cleanup function.
