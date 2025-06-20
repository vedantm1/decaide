import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session setup with enhanced security and persistence
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "decade-ai-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for better persistence
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true // Prevent client-side JS from accessing the cookie
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for username/password auth
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          // Generate a unique session identifier
          const sessionId = randomBytes(24).toString('hex');
          
          // Update last login date for streak tracking and store session ID
          const now = new Date();
          
          // Get client IP and user agent info for session tracking
          const sessionInfo = {
            id: sessionId,
            createdAt: now,
            lastActive: now
          };
          
          // Update active session for this user
          await storage.updateUserSession(user.id, sessionInfo);
          
          // Update last login date
          await storage.updateLastLogin(user.id, now);
          
          // Set justLoggedIn flag to trigger welcome animation
          const userWithSessionInfo = {
            ...user,
            sessionId,
            justLoggedIn: true
          };
          
          return done(null, userWithSessionInfo);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;
          const googleId = profile.id;

          if (!email) {
            return done(new Error("No email found in Google profile"));
          }

          // Check if user already exists with this Google ID
          let user = await storage.getUserByGoogleId(googleId);

          if (!user) {
            // Check if user exists with this email
            user = await storage.getUserByEmail(email);
            
            if (user) {
              // Link Google account to existing user
              await storage.linkGoogleAccount(user.id, googleId);
            } else {
              // Create new user
              const username = email.split('@')[0]; // Use email prefix as username
              user = await storage.createUser({
                username,
                email,
                password: "", // No password for OAuth users
                googleId,
                eventFormat: null,
                eventCode: null,
              });
            }
          }

          // Generate session ID and update login info
          const sessionId = randomBytes(24).toString('hex');
          const now = new Date();
          
          const sessionInfo = {
            id: sessionId,
            createdAt: now,
            lastActive: now
          };
          
          await storage.updateUserSession(user.id, sessionInfo);
          await storage.updateLastLogin(user.id, now);
          
          const userWithSessionInfo = {
            ...user,
            sessionId,
            justLoggedIn: true
          };
          
          return done(null, userWithSessionInfo);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Session validation middleware - protect against multiple logins from different locations
  const validateSession = async (req: Request, res: Response, next: NextFunction) => {
    // Skip for non-authenticated requests
    if (!req.isAuthenticated()) {
      return next();
    }
    
    const user = req.user;
    const sessionId = user.sessionId;
    
    // Skip validation for sessions without a sessionId (older sessions before feature was added)
    // Also temporarily disable session validation for certain paths like roleplay/test generation
    // This prevents unexpected logouts during navigation
    if (!sessionId || 
        req.path.includes('/roleplay') || 
        req.path.includes('/test') || 
        req.path.includes('/written') || 
        req.path.includes('/pi')) {
      return next();
    }
    
    try {
      // Check if the sessionId is valid for this user
      const isValid = await storage.validateUserSession(user.id, sessionId);
      
      if (!isValid) {
        // Session is invalid, force logout
        req.logout((err: any) => {
          if (err) return next(err);
          return res.status(401).json({
            error: "Your session has been invalidated because you logged in from another location.",
            code: "SESSION_INVALIDATED"
          });
        });
      } else {
        // Session is valid, continue
        next();
      }
    } catch (error) {
      // If there's an error in validation, let the request proceed rather than logging out
      console.error("Session validation error:", error);
      next();
    }
  };
  
  // Add session validation middleware
  app.use(validateSession);
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { username, password, email } = req.body;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({ 
          message: "Username and password are required" 
        });
      }

      if (username.length < 3) {
        return res.status(400).json({ 
          message: "Username must be at least 3 characters long" 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          message: "Password must be at least 6 characters long" 
        });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Username already exists" 
        });
      }

      // Check if email already exists (if provided)
      if (email) {
        const existingEmailUser = await storage.getUserByEmail(email);
        if (existingEmailUser) {
          return res.status(400).json({ 
            message: "Email already registered" 
          });
        }
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        email: email || null,
        subscriptionTier: "standard",
        uiTheme: "aquaBlue",
        theme: "light",
        colorScheme: "memphis"
      });

      // Log the user in automatically after registration
      req.login(newUser, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return next(err);
        }
        
        // Remove password from response
        const { password: _, ...userResponse } = newUser;
        res.status(201).json(userResponse);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        message: "Registration failed. Please try again." 
      });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Google OAuth routes
  app.get("/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth?error=google_auth_failed" }),
    (req, res) => {
      // Successful authentication, redirect to dashboard
      res.redirect("/");
    }
  );

  app.post("/api/logout", async (req, res, next) => {
    try {
      // If user is authenticated, invalidate their session
      if (req.isAuthenticated() && req.user.id && req.user.sessionId) {
        // Remove the session from storage
        await storage.invalidateOtherSessions(req.user.id, req.user.sessionId);
      }
      
      // Now perform the logout
      req.logout((err) => {
        if (err) return next(err);
        res.sendStatus(200);
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
