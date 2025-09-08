import { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { verifySupabaseToken } from "./supabase-auth";

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
  // Setup CORS for Replit webview compatibility
  app.use(cors({ 
    origin: true, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['X-Total-Count']
  }));

  // Session management removed - using Supabase JWT tokens instead
  app.set("trust proxy", 1);

  // All Passport.js authentication strategies removed - using Supabase JWT tokens

  // Session validation removed - using Supabase JWT tokens instead
  
  // Old Passport.js authentication routes removed - using Supabase instead

  // Get user data with Supabase authentication
  app.get("/api/user", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req as any).user?.id;
      if (!authId) {
        console.error("❌ No auth ID found in request:", { user: (req as any).user });
        return res.status(401).json({ error: "No authentication ID found" });
      }

      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        console.error(`❌ User not found for auth ID: ${authId}`);
        return res.status(404).json({ error: "User not found" });
      }

      console.log(`✅ User data loaded successfully for ${authId}:`, {
        selectedEvent: user.selectedEvent,
        selectedCluster: user.selectedCluster
      });

      res.json(user);
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
