Here's an **industry-focused Express.js `req` and `res` cheat sheet**. The last column explains where each property or method is commonly used in real-world applications.

# `req` (Request Object)

| Property / Method   | Purpose                        | Example                      | Industry Use                                                        |
| ------------------- | ------------------------------ | ---------------------------- | ------------------------------------------------------------------- |
| `req.params`        | Get route parameters           | `req.params.id`              | Fetch a user by ID (`/users/123`), product details (`/products/45`) |
| `req.query`         | Get URL query parameters       | `req.query.page`             | Pagination (`?page=2`), filtering (`?category=mobile`), searching   |
| `req.body`          | Get request body               | `req.body.email`             | Login forms, signup forms, order creation, payment details          |
| `req.headers`       | All request headers            | `req.headers.authorization`  | JWT Authentication, API keys, language detection                    |
| `req.get(name)`     | Get a specific header          | `req.get("Authorization")`   | Reading Bearer Token, checking browser type                         |
| `req.method`        | HTTP method                    | `req.method`                 | Logging requests, middleware, API analytics                         |
| `req.url`           | Requested URL                  | `req.url`                    | Logging user activity, debugging                                    |
| `req.originalUrl`   | Original URL before middleware | `req.originalUrl`            | Logging original API path after routing                             |
| `req.path`          | URL path only                  | `req.path`                   | Route-based authorization, analytics                                |
| `req.hostname`      | Domain name                    | `req.hostname`               | Multi-tenant SaaS applications                                      |
| `req.protocol`      | http/https                     | `req.protocol`               | Force HTTPS redirects                                               |
| `req.ip`            | Client IP Address              | `req.ip`                     | Login security, rate limiting, fraud detection                      |
| `req.secure`        | HTTPS check                    | `req.secure`                 | Redirect HTTP → HTTPS                                               |
| `req.cookies`       | Read cookies                   | `req.cookies.token`          | Session management, remember-me login                               |
| `req.signedCookies` | Read signed cookies            | `req.signedCookies.user`     | Secure authentication                                               |
| `req.route`         | Current matched route          | `req.route.path`             | API debugging                                                       |
| `req.baseUrl`       | Router base path               | `req.baseUrl`                | Large projects with modular routers                                 |
| `req.accepts()`     | Accepted response type         | `req.accepts('json')`        | APIs supporting JSON/XML                                            |
| `req.is()`          | Check content type             | `req.is('application/json')` | Validate incoming API requests                                      |
| `req.xhr`           | AJAX request check             | `req.xhr`                    | Return JSON instead of HTML                                         |
| `req.fresh`         | Cache validation               | `req.fresh`                  | Browser caching                                                     |
| `req.stale`         | Opposite of fresh              | `req.stale`                  | Refresh cached content                                              |

---

# `res` (Response Object)

| Method              | Purpose             | Example                               | Industry Use                            |
| ------------------- | ------------------- | ------------------------------------- | --------------------------------------- |
| `res.send()`        | Send response       | `res.send("Hello")`                   | Return HTML or text pages               |
| `res.json()`        | Send JSON           | `res.json(user)`                      | REST APIs, mobile backend               |
| `res.status()`      | Set status code     | `res.status(404)`                     | Error handling, API responses           |
| `res.sendStatus()`  | Send only status    | `res.sendStatus(204)`                 | DELETE APIs, health checks              |
| `res.redirect()`    | Redirect user       | `res.redirect('/login')`              | Login, logout, OAuth authentication     |
| `res.render()`      | Render template     | `res.render('home')`                  | Server-side rendering with EJS/Pug      |
| `res.download()`    | Download file       | `res.download('invoice.pdf')`         | Invoice download, reports, certificates |
| `res.sendFile()`    | Send a file         | `res.sendFile('image.jpg')`           | Static files, PDFs, images              |
| `res.end()`         | End response        | `res.end()`                           | Streaming, custom HTTP servers          |
| `res.set()`         | Set response header | `res.set('Cache-Control','no-cache')` | Security headers, caching               |
| `res.get()`         | Get response header | `res.get('Content-Type')`             | Debugging middleware                    |
| `res.header()`      | Same as `res.set()` | `res.header('x-api-version','1')`     | API versioning                          |
| `res.type()`        | Set MIME type       | `res.type('json')`                    | Return XML, PDF, JSON                   |
| `res.cookie()`      | Create cookie       | `res.cookie('token',jwt)`             | Authentication, sessions                |
| `res.clearCookie()` | Delete cookie       | `res.clearCookie('token')`            | Logout functionality                    |
| `res.location()`    | Set Location header | `res.location('/profile')`            | Resource creation (`201 Created`)       |
| `res.links()`       | Set Link header     | `res.links({next:'/page2'})`          | API pagination                          |
| `res.append()`      | Append header       | `res.append('Warning','Deprecated')`  | Add custom headers                      |
| `res.vary()`        | Set Vary header     | `res.vary('Accept-Encoding')`         | CDN and browser caching                 |

---

# ⭐ Top 10 Methods Used Daily in Industry

These are the ones you'll use in almost every Express project.

| Feature          | Example                      | Real-world Use                    |
| ---------------- | ---------------------------- | --------------------------------- |
| `req.params`     | `req.params.id`              | Get product, user, blog, order ID |
| `req.query`      | `req.query.page`             | Pagination, filtering, sorting    |
| `req.body`       | `req.body.email`             | Login, signup, checkout, forms    |
| `req.headers`    | `req.headers.authorization`  | JWT authentication                |
| `req.ip`         | `req.ip`                     | Security, rate limiting           |
| `res.status()`   | `res.status(404)`            | Error handling                    |
| `res.json()`     | `res.json(data)`             | Return API responses              |
| `res.send()`     | `res.send("Success")`        | Send HTML/text                    |
| `res.cookie()`   | `res.cookie("token",jwt)`    | Login sessions                    |
| `res.redirect()` | `res.redirect("/dashboard")` | Login and OAuth flows             |

---

## Example: Login API (Uses Several Common Features)

```js
app.post('/login', (req, res) => {
// Read data from request body
    const { email, password } = req.body;
// Read authentication header
    const token = req.headers.authorization;
    console.log(req.ip);
if (email === "admin@gmail.com" && password === "1234") {
// Store JWT in a cookie
    res.cookie("token", "jwt-token");
// Return JSON response
    return res.status(200).json({ message: "Login Successful" });
    }
return res.status(401).json({ message: "Invalid Credentials" });
});
```

This example combines several of the most common `req` and `res` features used in production applications: `req.body`, `req.headers`, `req.ip`, `res.cookie()`, `res.status()`, and `res.json()`.




