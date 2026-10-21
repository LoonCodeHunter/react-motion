# Kovari Motion interactive showcase

A **standalone Vite + React 19 example project** that consumes the sibling `@kovari/react-motion` package using a local `file:../..` dependency. The demo includes presence, drag, hover, focus, and spring-derived styles.

From the extracted **source project root**:

```sh
npm ci
npm run build
cd examples/react-showcase
npm install
npm run dev
```

Open the URL Vite prints. To test a React 18 consumer, change `react`, `react-dom` and the corresponding `@types/*` dependencies in this example to their 18.x versions, then reinstall.

The demo is **not** a browser integration test and the code is a source example, not a server-rendered Next.js route.
