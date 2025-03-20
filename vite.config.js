/* eslint-disable no-undef */
import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts"; // You'll need to install this

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        object: resolve(__dirname, "src/object/index.ts"),
        dataqueue: resolve(__dirname, "src/dataqueue/index.ts"),
        strings: resolve(__dirname, "src/strings/index.ts"),
        mime: resolve(__dirname, "src/mime/index.ts"),
        base64: resolve(__dirname, "src/base64/index.ts"),
        promise: resolve(__dirname, "src/promise/index.ts"),
        dom: resolve(__dirname, "src/dom/index.ts"),
        i18n: resolve(__dirname, "src/i18n/index.ts"),
        logger: resolve(__dirname, "src/logger/index.ts"),
        llm: resolve(__dirname, "src/llm/index.ts"),
      },
      formats: ["es"],
      fileName: (format, entryname) => {
        if (format === "es") {
          return `${entryname}.js`;
        }
        return `${entryname}.${format}.js`;
      },
    },
    rollupOptions: {
      external: [
        "fs",
        "path",
        "url",
        "chalk",
        "semver",
        "yargs",
        "yargs/helpers",
      ],
    },
    target: "node16",
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: "dist",
    }),
  ],
});
