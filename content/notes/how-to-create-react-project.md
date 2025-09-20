---
title: How to create React project
tags:
   - react
   - vite
---

<!-- steps -->
1. [Install Node.js](how-to-install-nodejs.md)

2. Create a new React project using Vite.
   ```bash
   npm create vite react-project -- --template react-ts
   ```

3. Install the dependencies.
   ```bash
   cd react-project
   npm install
   ```

4. Install Tailwind CSS dependencies.
   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```

5. Add the `@tailwindcss/vite` plugin to your Vite configuration.
   
   ```ts title="vite.config.ts" {3,8}
   import { defineConfig } from 'vite'
   import tailwindcss from '@tailwindcss/vite'
   import react from '@vitejs/plugin-react'
   
   // https://vite.dev/config/
   export default defineConfig({
     plugins: [
       react(),
       tailwindcss()
     ],
   })
   ```

6. Add Tailwind CSS import
   ```css title="src/index.css"
   @import "tailwindcss";
   ```

7. Use Tailwind CSS in React components
   ```tsx title="src/App.tsx" {3}
   function App() {
     return (
       <div className="text-3xl font-bold underline">
         Hello world!
       </div>
     )
   }
   
   export default App
   ```

8. Start the project
   ```bash
   npm run dev
   ```

## Links

- [`create-vite`](https://github.com/vitejs/vite/tree/main/packages/create-vite#readme)
- [Install Tailwind CSS using Vite](https://tailwindcss.com/docs/installation/using-vite)
