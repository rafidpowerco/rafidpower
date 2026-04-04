import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
    app.use((req, res, next) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
      if (req.secure) {
        res.setHeader(
          "Strict-Transport-Security",
          "max-age=31536000; includeSubDomains",
        );
      }
      next();
    });
  }

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(
    express.static(staticPath, {
      setHeaders(res, filePath) {
        if (filePath.endsWith("site.webmanifest")) {
          res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
        }
      },
    }),
  );

  app.get("/health", (_req, res) => {
    res.status(200).type("text/plain").send("ok");
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    const indexFile = path.join(staticPath, "index.html");
    res.sendFile(indexFile, (err) => {
      if (err) {
        console.error(err);
        if (!res.headersSent) {
          res.status(500).type("text/plain").send("Internal Server Error");
        }
      }
    });
  });

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || "0.0.0.0";

  server.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}/`);
  });
}

startServer().catch(console.error);
