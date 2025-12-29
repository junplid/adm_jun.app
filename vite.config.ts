import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import * as path from "path";
import tailwindcss from "@tailwindcss/vite";
import obfuscator from "vite-plugin-javascript-obfuscator";

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ["1272e34b509a.ngrok-free.app"],
  },
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    obfuscator({
      apply: "build",
      options: {
        compact: true, // mantém
        identifierNamesGenerator: "hexadecimal",
        renameGlobals: true,

        /* ⚙️  ajustes de performance */
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.25, // ~25 % das funções já confunde bastante
        deadCodeInjection: false, // desliga – é o pior vilão de CPU
        // string array faz papel parecido, mas é mais leve:
        stringArray: true,
        stringArrayThreshold: 0.6, // mistura 60 % das strings
        stringArrayEncoding: ["base64"],

        debugProtection: false, // laço freeze → OFF
        selfDefending: false, // exige eval em runtime → OFF
        disableConsoleOutput: false,

        log: false,
        sourceMap: false,
      },
    }),
  ],
  build: {
    target: "es2020",
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 3,
        // drop_console: true,
        // drop_debugger: true,
      },
      mangle: { toplevel: true },
      format: { comments: false },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
