import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { createServer } from "http";
import path from "path";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// Enable CORS for all origins
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Mount AI routes
app.use("/api/ai", aiRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/dist"));
  
  // Catch-all handler for SPA
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  console.error(err);
});

const port = process.env.PORT || 5000;
const server = createServer(app);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;