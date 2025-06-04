/// <reference types="vitest/config" />

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    target: "esnext",
    outDir: 'dist',
    minify: true,
    sourcemap: false,
    emptyOutDir: true,
  },
  esbuild: {
    tsconfigRaw: '{"compilerOptions":{"skipLibCheck":true,"ignoreDeprecations":"5.0"}}',
  },
  // This is added as a temporary fix for the `process is not defined` issue
  // (https://github.com/reown-com/appkit/issues/3926)
  // appearing in our dependency: reown/appkit
  define: {
    "process.env": {},
  },
  test: {
    environment: "jsdom",
    include: ["./tests/**/*.unit.ts", "./tests/**/*.unit.tsx"],
    setupFiles: ["./tests/vitest.setup.ts"],
  },
});
