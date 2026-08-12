Below is a **complete Kafka + Node.js microservices project** showing:

* Kafka setup (Docker)
* Producer service (Order API)
* Multiple consumer services (Email, Inventory, Analytics)
* Full event pipeline
* Simple performance/load test script

We’ll build a real-world style system: **Order Processing System**

---

# 🧱 1. Architecture

```
Client
  |
  v
Node.js API (Producer)
  |
  v
Kafka Topic: "orders"
  |-------------------|-------------------|
  v                   v                   v
Email Service     Inventory Service   Analytics Service
(Consumer)        (Consumer)          (Consumer)
```

---

# 🐳 2. Kafka Setup (Docker Compose)

Create `docker-compose.yml`

```yaml
version: "3.8"

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"

    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181

      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

Run:

```bash
docker-compose up -d
```

Check Kafka is running:

```bash
docker ps
```

---

# 📦 3. Shared Kafka Config (Node.js)

Install dependency:

```bash
npm init -y
npm install kafkajs express
```

Create `kafka.js`

```js
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "order-system",
  brokers: ["localhost:9092"],
});

module.exports = kafka;
```

---

# 🚀 4. PRODUCER SERVICE (Order API)

## `producer-service.js`

```js
const express = require("express");
const kafka = require("./kafka");

const app = express();
app.use(express.json());

const producer = kafka.producer();

async function startProducer() {
  await producer.connect();
  console.log("Producer connected");
}

startProducer();

app.post("/order", async (req, res) => {
  const order = {
    orderId: Date.now(),
    userId: req.body.userId,
    items: req.body.items,
    amount: req.body.amount,
    timestamp: new Date().toISOString(),
  };

  try {
    await producer.send({
      topic: "orders",
      messages: [
        {
          value: JSON.stringify(order),
        },
      ],
    });

    res.json({
      status: "Order received",
      orderId: order.orderId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending order");
  }
});

app.listen(3000, () => {
  console.log("Producer API running on port 3000");
});
```

---

# 📧 5. EMAIL SERVICE (Consumer 1)

## `email-service.js`

```js
const kafka = require("./kafka");

const consumer = kafka.consumer({ groupId: "email-group" });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: "orders", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const order = JSON.parse(message.value.toString());

      console.log("📧 Sending email for order:", order.orderId);

      // simulate delay
      await new Promise((r) => setTimeout(r, 500));

      console.log(`Email sent to user ${order.userId}`);
    },
  });
}

run();
```

---

# 📦 6. INVENTORY SERVICE (Consumer 2)

## `inventory-service.js`

```js
const kafka = require("./kafka");

const consumer = kafka.consumer({ groupId: "inventory-group" });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: "orders" });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const order = JSON.parse(message.value.toString());

      console.log("📦 Updating inventory for order:", order.orderId);

      // simulate processing
      await new Promise((r) => setTimeout(r, 300));

      console.log("Inventory updated for items:", order.items);
    },
  });
}

run();
```

---

# 📊 7. ANALYTICS SERVICE (Consumer 3)

## `analytics-service.js`

```js
const kafka = require("./kafka");

const consumer = kafka.consumer({ groupId: "analytics-group" });

let orderCount = 0;

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: "orders" });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const order = JSON.parse(message.value.toString());

      orderCount++;

      console.log("📊 Analytics updated");
      console.log("Total orders processed:", orderCount);
    },
  });
}

run();
```

---

# 🧪 8. RUN EVERYTHING

Open 4 terminals:

### Terminal 1

```bash
node producer-service.js
```

### Terminal 2

```bash
node email-service.js
```

### Terminal 3

```bash
node inventory-service.js
```

### Terminal 4

```bash
node analytics-service.js
```

---

# 🧪 9. TEST ORDER API

Send request:

```bash
curl -X POST http://localhost:3000/order \
-H "Content-Type: application/json" \
-d '{
  "userId": 101,
  "items": ["phone", "charger"],
  "amount": 5000
}'
```

---

# ⚡ 10. SIMPLE PERFORMANCE TEST (Kafka vs Direct API)

Now we simulate load.

## `load-test.js`

```js
const axios = require("axios");

async function sendRequests() {
  const start = Date.now();

  const promises = [];

  for (let i = 0; i < 100; i++) {
    promises.push(
      axios.post("http://localhost:3000/order", {
        userId: i,
        items: ["item" + i],
        amount: 100 + i,
      })
    );
  }

  await Promise.all(promises);

  const end = Date.now();

  console.log(`100 requests completed in ${end - start} ms`);
}

sendRequests();
```

Run:

```bash
node load-test.js
```

---

# 📊 11. What You’ll Observe

## Without Kafka (traditional monolith):

* API waits for:

  * Email sending
  * Inventory update
  * Analytics update
* Slow response time (500ms–2000ms per request)

## With Kafka:

* API only:

  * validates request
  * sends event to Kafka
  * responds immediately (~10–20ms)

Consumers process independently.

---

# 🚀 12. Kafka Pipeline Behavior (Important Insight)

### Producer behavior:

* Fire-and-forget event publishing
* No waiting for downstream services

### Kafka behavior:

* Stores events durably
* Allows replay
* Handles buffering during spikes

### Consumers:

* Scale independently
* Can fail without breaking API
* Can reprocess messages

---

# 🔥 13. Scaling Simulation Idea

You can scale consumers like:

```bash
node email-service.js   # instance 1
node email-service.js   # instance 2
node email-service.js   # instance 3
```

Kafka will automatically distribute messages across instances (same groupId).

---

# 🧠 Key Learning Summary

Kafka gives you:

* ⚡ Fast API responses
* 🔄 Async processing
* 📈 Horizontal scaling
* 🧯 Fault tolerance
* 🔁 Replayable events

---

If you want next level, I can upgrade this into:

* Dockerized microservices setup
* Kafka UI (like Kafka UI dashboard)
* Redis caching layer
* Real payment + order saga pattern
* Dead letter queues (DLQ)
* Exactly-once processing

Just tell me 👍
