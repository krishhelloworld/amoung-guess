This is a great question because **the way routing is taught in tutorials is very different from how large React applications are organized**.

In a real company, `App.jsx` is usually tiny. Almost everything is moved into separate route files, layouts, providers, and feature folders.

I'll teach this from beginner to enterprise level.

---

# Level 2 Folder Structure

A common structure is

```
src/

    app/
        App.jsx

    routes/
        index.jsx
        auth.routes.jsx
        dashboard.routes.jsx
        admin.routes.jsx

    layouts/
        RootLayout.jsx
        DashboardLayout.jsx
        AdminLayout.jsx

    pages/
        Home.jsx
        Login.jsx
        Dashboard.jsx
```

Notice routing has its own folder.

---

# Level 3 Root Layout

Suppose every page should have

```
Navbar

Content

Footer
```

Instead of writing

```jsx
<>
<Navbar />
<Home />
<Footer />
```

everywhere...

We create

```jsx
// layouts/RootLayout.jsx
import { Outlet } from "react-router-dom";
function RootLayout() {
    return ( <>
            <Navbar />
            <Outlet />
            <Footer />
        </>); }
export default RootLayout;
```
---

```jsx
<Route path="/" element={<RootLayout />}>
    <Route index element={<Home />} />
    <Route path="about" element={<About />} />
    <Route path="contact" element={<Contact />} />
</Route>
```
When visiting /

React renders

```
RootLayout
Navbar
Home
Footer
```

because

```
<Home />
```
goes into

```
<Outlet />
```

---

Visiting

```
/about
```

renders

```
Navbar
About
Footer
```

---

# Visual

```
RootLayout

------------------
Navbar
------------------

Outlet

------------------
Footer
------------------
```

Outlet becomes

```
Home
```

or

```
About
```

or

```
Contact
```

---

# Level 5 Multiple Layouts

Suppose

```
/
```

uses public layout

while

```
/dashboard
```

uses sidebar.

```
Home

Navbar

Footer
```

Dashboard

```
Sidebar

Topbar

Dashboard Content
```

Create another layout.

```jsx
function DashboardLayout() {
return ( <>

            <Sidebar />
            <div>
                <Topbar />
                <Outlet />
            </div>
        </>); }
```

Routes

```jsx
<Route element={<DashboardLayout />}>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="profile" element={<Profile />} />
    <Route path="settings" element={<Settings />} />
</Route>
```

Now every dashboard page automatically gets

```
Sidebar

Topbar

Child page
```

---

# Level 6 Nested Layouts

This is where enterprise apps shine.

Example URL

```
/dashboard/projects/15/settings
```

Tree

```
RootLayout

    DashboardLayout

        ProjectLayout

            ProjectSettings
```

Each layout has its own Outlet.

```
RootLayout

Navbar

Outlet
```

↓

```
DashboardLayout

Sidebar

Outlet
```

↓

```
ProjectLayout

Project Menu

Outlet
```

↓

```
Settings Page
```

Final UI

```
Navbar

Sidebar

Project Menu

Settings
```

Nobody manually renders these.

Outlet handles everything.

---

# Level 7 Route File

Instead of App.jsx

companies create

```jsx
// routes/index.jsx

export const routes = [

];
```

or

```jsx
createBrowserRouter([
]);
```

Example

```jsx
const router = createBrowserRouter([
{
    path:"/",
    element:<RootLayout />,
    children:[
        {
            index:true,
            element:<Home />
        },
        {
            path:"about",
            element:<About />
        }

    ]
} ]);
```

Now App.jsx

```jsx
function App(){

    return <RouterProvider router={router} />

}
```

Only one line.

---

# Level 8 Splitting Route Files

Instead of one huge route array.

```
routes/

    auth.routes.js

    dashboard.routes.js

    admin.routes.js

    user.routes.js

    index.js
```

Example

```jsx
// auth.routes.js

export const authRoutes = [

{
    path:"login",
    element:<Login />
},

{
    path:"register",
    element:<Register />
}

];
```

Dashboard

```jsx
export const dashboardRoutes=[

{
    path:"dashboard",
    element:<DashboardLayout />,
    children:[

        {
            index:true,
            element:<Dashboard />
        },

        {
            path:"profile",
            element:<Profile />
        }

    ]
}

];
```

Then

```jsx
export const router=createBrowserRouter([

...authRoutes,

...dashboardRoutes,

...adminRoutes

]);
```

Much cleaner.

---

# Level 9 Context Providers

Beginners write

```jsx
<App>

<AuthProvider>

<ThemeProvider>

<CartProvider>

<QueryClientProvider>

<SocketProvider>

<NotificationProvider>

<Router>

</Router>

</NotificationProvider>

</SocketProvider>

</QueryClientProvider>

</CartProvider>

</ThemeProvider>

</AuthProvider>

</App>
```

Huge mess.

Companies create

```jsx
// providers/index.jsx

export default function Providers({children}){

return(

<AuthProvider>

<ThemeProvider>

<QueryClientProvider>

<SocketProvider>

{children}

</SocketProvider>

</QueryClientProvider>

</ThemeProvider>

</AuthProvider>

);

}
```

Now App.jsx

```jsx
<Providers>

<RouterProvider router={router} />

</Providers>
```

Much cleaner.

---

# Level 10 Route Loaders

Suppose before opening

```
/dashboard
```

you need user data.

Instead of

```jsx
useEffect(()=>{
fetch(...)
},[])
```

inside the component,

React Router lets you fetch first:

```jsx
{
    path: "dashboard",
    element: <Dashboard />,
    loader: async () => {
        return fetch("/api/user");
    },
}
```

Inside the component:

```jsx
import { useLoaderData } from "react-router-dom";

function Dashboard() {
    const user = useLoaderData();

    return <h1>{user.name}</h1>;
}
```

Benefits:

* Data is ready before rendering.
* Errors can be handled by route error boundaries.
* Better loading experience.

---

# Level 11 Actions

Instead of handling form submissions manually:

```jsx
<form onSubmit={handleSubmit}>
```

React Router supports route actions:

```jsx
{
    path: "login",
    element: <Login />,
    action: async ({ request }) => {
        const formData = await request.formData();

        return login(formData);
    },
}
```

Component:

```jsx
import { Form } from "react-router-dom";

<Form method="post">
    ...
</Form>
```

Submitting the form automatically calls the route's `action`.

---

# Level 12 Lazy Routes

For large apps, don't load every page upfront.

```jsx
{
    path: "analytics",
    lazy: async () => {
        const module = await import("../pages/Analytics");

        return {
            Component: module.default,
        };
    },
}
```

The analytics bundle is downloaded only when the user visits `/analytics`.

---

# Level 13 A Typical Enterprise Structure

```
src
│
├── app
│   ├── App.jsx
│   └── Providers.jsx
│
├── routes
│   ├── index.jsx
│   ├── auth.routes.jsx
│   ├── dashboard.routes.jsx
│   └── admin.routes.jsx
│
├── layouts
│   ├── RootLayout.jsx
│   ├── DashboardLayout.jsx
│   ├── AdminLayout.jsx
│   └── AuthLayout.jsx
│
├── features
│   ├── auth
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── auth.api.js
│   ├── dashboard
│   ├── users
│   └── projects
│
├── components
├── hooks
├── services
├── contexts
└── utils
```

This keeps routes, layouts, features, and shared code organized as the application grows.

---

## How `<Outlet />` works conceptually

Imagine your route configuration as a tree:

```
RootLayout
│
├── Home
│
├── About
│
└── DashboardLayout
      │
      ├── DashboardHome
      │
      ├── Profile
      │
      └── ProjectLayout
             │
             ├── Overview
             └── Settings
```

When the URL is:

```
/dashboard/project/settings
```

React Router renders from the top down:

```
RootLayout
  └── <Outlet />
       ↓
DashboardLayout
  └── <Outlet />
       ↓
ProjectLayout
  └── <Outlet />
       ↓
Settings
```

So each layout contributes its own UI (like a navbar, sidebar, or project menu), and `<Outlet />` marks where the next matched child route should appear.

This nesting is what allows large applications to reuse layouts without repeating code on every page.

For modern React Router (v6.4+ and v7), many teams prefer the **Data Router APIs** (`createBrowserRouter`, `RouterProvider`, `loader`, `action`, `lazy`, and route modules) because they centralize routing, data loading, and error handling in one system that scales well to enterprise applications.
