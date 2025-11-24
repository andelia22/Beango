import type { Express, RequestHandler} from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { getFirebaseAdmin } from "./firebaseAdmin";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post("/api/auth/firebase-login", async (req, res) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: "ID token required" });
      }

      const admin = getFirebaseAdmin();
      if (!admin) {
        console.error("Firebase Admin SDK not initialized");
        return res.status(500).json({ message: "Authentication service unavailable" });
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      const user = await admin.auth().getUser(decodedToken.uid);
      
      await storage.upsertUser({
        id: user.uid,
        email: user.email || null,
        firstName: user.displayName?.split(' ')[0] || null,
        lastName: user.displayName?.split(' ').slice(1).join(' ') || null,
        profileImageUrl: user.photoURL || null,
      });

      (req.session as any).user = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };

      res.json({ success: true });
    } catch (error: any) {
      console.error("Firebase login error:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
        details: error
      });
      
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ message: "Session expired. Please sign in again." });
      }
      if (error.code === 'auth/invalid-id-token' || error.code === 'auth/argument-error') {
        return res.status(401).json({ message: "Invalid authentication token" });
      }
      if (error.code === 'auth/user-not-found') {
        return res.status(401).json({ message: "User account not found" });
      }
      if (error.code === 'auth/network-request-failed' || error.code === 'auth/network-error') {
        return res.status(503).json({ message: "Network error. Please check your connection and try again." });
      }
      if (error.code === 'auth/internal-error' || error.code === 'auth/invalid-credential') {
        return res.status(500).json({ message: "Internal error. Please try again later." });
      }
      
      console.error("Unmapped Firebase error code:", error.code);
      res.status(500).json({ message: "Authentication failed. Please try again." });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req.session as any).user;

  if (!user || !user.uid) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return next();
};
