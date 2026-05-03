import { defineConfig, loadEnv, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { list, del } from "@vercel/blob";

const blobsApiPlugin = (token: string): Plugin => ({
  name: "blobs-api-dev",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const pathname = (req.url || "").split("?")[0];
      if (pathname !== "/api/blobs" && pathname !== "/api/blobs/") {
        next();
        return;
      }
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-store");
      try {
        if (req.method === "GET") {
          const { blobs } = await list({ token });
          const pdfBlobs = blobs
            .filter((b) => b.pathname.endsWith(".pdf"))
            .map((b) => ({
              url: b.url,
              pathname: b.pathname,
              size: b.size,
              uploadedAt: b.uploadedAt,
            }));
          res.end(JSON.stringify(pdfBlobs));
          return;
        }
        if (req.method === "DELETE") {
          const url = new URL(req.url || "", "http://localhost").searchParams.get("url");
          if (!url) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "url is required" }));
            return;
          }
          await del(url, { token });
          res.end(JSON.stringify({ success: true }));
          return;
        }
        res.statusCode = 405;
        res.end(JSON.stringify({ error: "Method not allowed" }));
      } catch (error) {
        res.statusCode = 500;
        res.end(
          JSON.stringify({
            error: error instanceof Error ? error.message : "Failed to handle blob request",
          })
        );
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const blobToken =
    env.BLOB_READ_WRITE_TOKEN || env.VITE_BLOB_READ_WRITE_TOKEN || "";

  return {
    plugins: [vue(), tailwindcss(), blobsApiPlugin(blobToken)],
  };
});
