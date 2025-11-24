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
        return res.status(400).json({ error: "ID token required" });
      }

      const admin = getFirebaseAdmin();
      if (!admin) {
        return res.status(500).json({ error: "Firebase not configured" });
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
    } catch (error) {
      console.error("Firebase login error:", error);
      res.status(401).json({ error: "Invalid token" });
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
