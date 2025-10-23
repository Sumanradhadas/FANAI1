// Firebase Admin SDK for backend authentication
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Session configuration (without Replit Auth)
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
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
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

// Middleware to check if user is authenticated via Firebase
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  // Check if user session exists with Firebase UID
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Attach user ID to request
  req.userId = req.session.userId;
  next();
};

// Admin middleware - checks admin credentials from environment
export const isAdmin: RequestHandler = async (req: any, res, next) => {
  // Check if admin session exists
  if (!req.session || !req.session.isAdmin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
};
