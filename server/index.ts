import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import createMemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
const MemoryStore = createMemoryStore(session);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
    }
  }
}

const HARDCODED_USER = {
  id: "admin-001",
  username: "bsadmin",
  password: "bspass2025?"
};

passport.use(
  new LocalStrategy((username, password, done) => {
    if (username === HARDCODED_USER.username && password === HARDCODED_USER.password) {
      return done(null, { id: HARDCODED_USER.id, username: HARDCODED_USER.username });
    }
    return done(null, false, { message: "Invalid username or password" });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  if (id === HARDCODED_USER.id) {
    done(null, { id: HARDCODED_USER.id, username: HARDCODED_USER.username });
  } else {
    done(new Error("User not found"));
  }
});

const isSecureCookie = (() => {
  if (process.env.USE_SECURE_COOKIES === "true") {
    return true;
  }
  if (process.env.USE_SECURE_COOKIES === "false") {
    return false;
  }
  return process.env.NODE_ENV === "production";
})();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "interview-evaluation-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
