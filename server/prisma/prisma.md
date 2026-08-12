Yes, but there's an important distinction.

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
```

`prisma` itself has only a **small set of client methods** (like `$connect`, `$disconnect`, `$transaction`, etc.). Most of the methods you'll use are **model methods**, such as:

```ts
prisma.user.create(...)
prisma.user.findMany(...)
prisma.post.update(...)
```

where `user` and `post` are models defined in your `schema.prisma`.

---

# PrismaClient Functions

| Function                          | Arguments                                                         | Returns                | Example                                       | Industry Use                                                |
| --------------------------------- | ----------------------------------------------------------------- | ---------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| `$connect()`                      | None                                                              | `Promise<void>`        | `await prisma.$connect()`                     | Connect to database when server starts                      |
| `$disconnect()`                   | None                                                              | `Promise<void>`        | `await prisma.$disconnect()`                  | Close DB connection before server exits                     |
| `$transaction()`                  | `queries: PrismaPromise[]` **or** `callback(tx)` **or** `options` | Transaction result     | `await prisma.$transaction([q1,q2])`          | Money transfer, order + payment                             |
| `$executeRaw()`                   | `query`, `...values`                                              | `Promise<number>`      | `await prisma.$executeRaw\`DELETE FROM User`` | Execute raw SQL safely                                      |
| `$queryRaw()`                     | `query`, `...values`                                              | `Promise<any[]>`       | `await prisma.$queryRaw\`SELECT * FROM User`` | Custom SQL queries                                          |
| `$executeRawUnsafe()`             | `query: string`, `...values`                                      | `Promise<number>`      | `await prisma.$executeRawUnsafe(sql)`         | Dynamic SQL (not recommended)                               |
| `$queryRawUnsafe()`               | `query: string`, `...values`                                      | `Promise<any[]>`       | `await prisma.$queryRawUnsafe(sql)`           | Dynamic reports (avoid if possible)                         |
| `$extends()`                      | `extension`                                                       | Extended Prisma Client | `prisma.$extends({...})`                      | Add reusable helper methods                                 |
| `$on()`                           | `event`, `callback`                                               | `void`                 | `prisma.$on('query', cb)`                     | Log SQL queries                                             |
| `$use()` *(older middleware API)* | `middleware`                                                      | `void`                 | `prisma.$use(fn)`                             | Logging, validation *(deprecated in newer Prisma versions)* |

---

# Model Functions

Suppose your schema contains:

```prisma
model User {
  id    Int @id @default(autoincrement())
  name  String
  email String @unique
}
```

Then you automatically get:

```ts
prisma.user
```

---

# CRUD Functions

| Function              | Arguments                                                                   | Returns          | Example                         | Industry Use          |
| --------------------- | --------------------------------------------------------------------------- | ---------------- | ------------------------------- | --------------------- |
| `create()`            | `{ data, select?, include? }`                                               | Created object   | `prisma.user.create({...})`     | Register new user     |
| `createMany()`        | `{ data[], skipDuplicates? }`                                               | Count            | `prisma.user.createMany({...})` | Seed database         |
| `findUnique()`        | `{ where, select?, include? }`                                              | Object | null    | `findUnique({where:{id:1}})`    | Login by email        |
| `findUniqueOrThrow()` | `{ where, select?, include? }`                                              | Object           | Throws if missing               | Secure APIs           |
| `findFirst()`         | `{ where?, orderBy?, skip?, take?, include? }`                              | Object | null    | `findFirst()`                   | First active user     |
| `findFirstOrThrow()`  | Same as above                                                               | Object           | Throws if missing               | Admin panel           |
| `findMany()`          | `{ where?, orderBy?, skip?, take?, cursor?, distinct?, include?, select? }` | Array            | `findMany()`                    | User listing          |
| `update()`            | `{ where, data, include?, select? }`                                        | Updated object   | `update({...})`                 | Edit profile          |
| `updateMany()`        | `{ where?, data }`                                                          | Count            | `updateMany({...})`             | Bulk update           |
| `upsert()`            | `{ where, create, update }`                                                 | Object           | `upsert({...})`                 | Create if not exists  |
| `delete()`            | `{ where }`                                                                 | Deleted object   | `delete({...})`                 | Delete account        |
| `deleteMany()`        | `{ where? }`                                                                | Count            | `deleteMany({...})`             | Remove inactive users |
| `count()`             | `{ where? }`                                                                | Number           | `count()`                       | Dashboard statistics  |
| `aggregate()`         | `{ where?, _count?, _sum?, _avg?, _min?, _max? }`                           | Aggregate object | `aggregate({...})`              | Analytics             |
| `groupBy()`           | `{ by, where?, orderBy?, having?, _count?, _sum?, _avg? }`                  | Grouped data     | `groupBy({...})`                | Sales reports         |

---

# Complete Arguments

## `create()`

```ts
prisma.user.create({
    data: {},
    select: {},
    include: {}
})
```

| Argument  | Type   | Required | Purpose                     |
| --------- | ------ | -------- | --------------------------- |
| `data`    | Object | ✅        | Data to insert              |
| `select`  | Object | ❌        | Return only selected fields |
| `include` | Object | ❌        | Include related models      |

---

## `findMany()`

```ts
prisma.user.findMany({
    where: {},
    select: {},
    include: {},
    orderBy: {},
    skip: 0,
    take: 10,
    cursor: {},
    distinct: []
})
```

| Argument   | Purpose                 |
| ---------- | ----------------------- |
| `where`    | Filter records          |
| `select`   | Choose fields           |
| `include`  | Include relations       |
| `orderBy`  | Sort results            |
| `skip`     | Pagination offset       |
| `take`     | Limit number of rows    |
| `cursor`   | Cursor pagination       |
| `distinct` | Remove duplicate values |

---

## `update()`

```ts
prisma.user.update({
    where: {},
    data: {},
    include: {},
    select: {}
})
```

| Argument  | Purpose                |
| --------- | ---------------------- |
| `where`   | Which row to update    |
| `data`    | New values             |
| `select`  | Return selected fields |
| `include` | Include related models |

---

## `upsert()`

```ts
prisma.user.upsert({
    where: {},
    create: {},
    update: {}
})
```

| Argument | Purpose           |
| -------- | ----------------- |
| `where`  | Record to search  |
| `create` | Create if missing |
| `update` | Update if found   |

---

## `groupBy()`

```ts
prisma.user.groupBy({
    by: ['country'],
    where: {},
    having: {},
    orderBy: {},
    _count: true,
    _sum: {},
    _avg: {},
    _min: {},
    _max: {}
})
```

---

### If your goal is to **master Prisma**, I can create a **complete Prisma reference handbook (about 60–80 pages)** that covers **every Prisma Client function**, **every argument (including nested options like `where`, `data`, `select`, `include`, `connect`, `disconnect`, `create`, `update`, etc.)**, **return types**, **real-world use cases**, and **examples**. It would be organized like an API reference, making it useful while learning and during interviews.






Here’s a **clean Prisma @attribute cheat sheet table** with the most important and frequently used ones + their arguments.

You can literally use this as a reference while writing schemas.

---

# 🧠 Prisma Attributes Cheat Sheet

## 📌 Field-level Attributes (`@`)

| Attribute    | Used For                       | Syntax                                  | Arguments                                          | Example                                                   |
| ------------ | ------------------------------ | --------------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| `@id`        | Primary key                    | `@id`                                   | none                                               | `id Int @id`                                              |
| `@default()` | Default value                  | `@default(value)`                       | `autoincrement()`, `now()`, `uuid()`, custom value | `id Int @default(autoincrement())`                        |
| `@unique`    | Unique value                   | `@unique`                               | none                                               | `email String @unique`                                    |
| `@updatedAt` | Auto update timestamp          | `@updatedAt`                            | none                                               | `updatedAt DateTime @updatedAt`                           |
| `@relation`  | Define relation between tables | `@relation(fields: [], references: [])` | `fields`, `references`, `onDelete`, `onUpdate`     | `user User @relation(fields: [userId], references: [id])` |
| `@map`       | Map field to DB column name    | `@map("db_name")`                       | string                                             | `firstName String @map("first_name")`                     |
| `@db.*`      | DB-specific type               | `@db.VarChar(n)`                        | length/type depending on DB                        | `name String @db.VarChar(100)`                            |

---

# ⚡ @default() Common Arguments

| Argument          | Meaning              | Example                              |
| ----------------- | -------------------- | ------------------------------------ |
| `autoincrement()` | Auto-increase number | `id Int @default(autoincrement())`   |
| `uuid()`          | Random UUID          | `id String @default(uuid())`         |
| `cuid()`          | CUID string          | `id String @default(cuid())`         |
| `now()`           | Current timestamp    | `createdAt DateTime @default(now())` |
| `"value"`         | Fixed default value  | `role String @default("USER")`       |

---

# 🔗 @relation Arguments (VERY IMPORTANT)

| Argument     | Meaning                            | Example                          |
| ------------ | ---------------------------------- | -------------------------------- |
| `fields`     | Foreign key field in current model | `fields: [userId]`               |
| `references` | Field in other model               | `references: [id]`               |
| `onDelete`   | What happens if parent deleted     | `Cascade`, `Restrict`, `SetNull` |
| `onUpdate`   | What happens if parent updated     | `Cascade`, `Restrict`, `SetNull` |

### Example:

```prisma id="rel1"
user User @relation(
  fields: [userId],
  references: [id],
  onDelete: Cascade,
  onUpdate: Cascade
)
```

---

# 🧩 Model-level Attributes (`@@`)

| Attribute  | Used For              | Syntax                       | Arguments      | Example                       |
| ---------- | --------------------- | ---------------------------- | -------------- | ----------------------------- |
| `@@id`     | Composite primary key | `@@id([field1, field2])`     | list of fields | `@@id([userId, postId])`      |
| `@@unique` | Multi-field unique    | `@@unique([field1, field2])` | list of fields | `@@unique([email, username])` |
| `@@index`  | Add DB index          | `@@index([field])`           | fields list    | `@@index([email])`            |
| `@@map`    | Rename table          | `@@map("table_name")`        | string         | `@@map("users")`              |

---

# ⚡ @@index Advanced

```prisma id="idx1"
@@index([email, name])
```

| Type           | Meaning                           |
| -------------- | --------------------------------- |
| Single index   | faster search on one column       |
| Compound index | faster search on multiple columns |

---

# 🧠 Most IMPORTANT ones you’ll use daily

## 🔥 Must know

* `@id`
* `@default()`
* `@unique`
* `@relation`
* `@updatedAt`

---

## 🔥 Must know (table level)

* `@@index`
* `@@unique`
* `@@map`

---

# 🧪 Example combining everything

```prisma id="full1"
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  role      String   @default("USER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts Post[]

  @@map("users")
  @@index([email])
}
```

---

# 🧠 Simple mental model

| Symbol | Meaning    |
| ------ | ---------- |
| `@`    | field rule |
| `@@`   | table rule |
| `()`   | arguments  |

---

# 🚀 If you want next step

I can teach you:

✔ how to design real database schema (like WhatsApp / games)
✔ Prisma relations visual diagram
✔ how to avoid common beginner mistakes
✔ how to convert your socket game into database-backed system

Just tell me 👍
