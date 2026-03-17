import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { mochaPlugins } from "@getmocha/vite-plugins";

function spaFallback() {
  return {
    name: "spa-fallback",
    configureServer(server: any) {
      const spaMiddleware = (req: any, res: any, next: any) => {
        const { url, method } = req;
        if (method !== "GET") return next();
        if (!url) return next();
        if (url.startsWith("/@") || url.startsWith("/__") || url.startsWith("/api")) return next();

        const pathName = url.split("?")[0];
        // If the URL looks like a static asset request (has an extension), skip fallback.
        if (path.extname(pathName)) return next();

        const resolved = path.join(server.config.root, pathName);
        if (fs.existsSync(resolved)) return next();

        const html = fs.readFileSync(path.join(server.config.root, "index.html"), "utf-8");
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      };

      // Add SPA fallback at the beginning of middleware chain so it runs before Vite's 404 handler.
      if (server.middlewares && Array.isArray(server.middlewares.stack)) {
        server.middlewares.stack.unshift({ route: "", handle: spaMiddleware });
      } else {
        server.middlewares.use(spaMiddleware);
      }
    },
  };
}

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [
    spaFallback(),
    ...mochaPlugins(process.env as any),
    react(),
    cloudflare({}),
  ],
  server: {
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
