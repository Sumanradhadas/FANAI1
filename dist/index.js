var __defProp = Object.defineProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";
import multer from "multer";
import fs3 from "fs";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  campaigns: () => campaigns,
  campaignsRelations: () => campaignsRelations,
  celebrities: () => celebrities,
  celebritiesRelations: () => celebritiesRelations,
  celebrityRequests: () => celebrityRequests,
  celebrityRequestsRelations: () => celebrityRequestsRelations,
  generations: () => generations,
  generationsRelations: () => generationsRelations,
  insertCampaignSchema: () => insertCampaignSchema,
  insertCelebrityRequestSchema: () => insertCelebrityRequestSchema,
  insertCelebritySchema: () => insertCelebritySchema,
  insertGenerationSchema: () => insertGenerationSchema,
  insertTemplateSchema: () => insertTemplateSchema,
  plans: () => plans,
  sessions: () => sessions,
  templates: () => templates,
  templatesRelations: () => templatesRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  // 'user' or 'admin'
  credits: integer("credits").notNull().default(0),
  // Generation credits
  plan: varchar("plan", { length: 20 }).default("free"),
  // 'free', 'basic', 'silver', 'gold', 'diamond', 'campaign'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var celebrities = pgTable("celebrities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  // GitHub URL to celebrity image
  category: varchar("category", { length: 100 }),
  // 'actor', 'politician', 'sports', etc.
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertCelebritySchema = createInsertSchema(celebrities).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var celebrityRequests = pgTable("celebrity_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  // 'actor', 'politician', 'sports', etc.
  imageUrl: varchar("image_url"),
  // Uploaded celebrity image URL
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  // 'pending', 'approved', 'rejected'
  adminNotes: text("admin_notes"),
  // Optional feedback from admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertCelebrityRequestSchema = createInsertSchema(celebrityRequests).omit({
  id: true,
  status: true,
  adminNotes: true,
  createdAt: true,
  updatedAt: true
});
var templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  prompt: text("prompt").notNull(),
  // AI generation prompt template
  description: text("description"),
  category: varchar("category", { length: 100 }),
  // 'birthday', 'festival', 'campaign', etc.
  tags: text("tags").array(),
  // ['diwali', 'celebration', etc.]
  previewUrl: varchar("preview_url"),
  // Sample preview image URL
  isFree: boolean("is_free").notNull().default(false),
  // Free templates don't require credits
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var generations = pgTable("generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  celebrityId: varchar("celebrity_id").references(() => celebrities.id, { onDelete: "set null" }),
  templateId: varchar("template_id").references(() => templates.id, { onDelete: "set null" }),
  campaignId: varchar("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  userImageUrl: varchar("user_image_url"),
  // Uploaded user photo
  generatedImageUrl: varchar("generated_image_url"),
  // Final generated image
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  // 'pending', 'processing', 'completed', 'failed'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertGenerationSchema = createInsertSchema(generations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  // URL slug for campaign link
  description: text("description"),
  candidateName: varchar("candidate_name", { length: 255 }),
  celebrityId: varchar("celebrity_id").references(() => celebrities.id, { onDelete: "set null" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  // Campaign creator
  isActive: boolean("is_active").notNull().default(true),
  totalGenerations: integer("total_generations").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  totalGenerations: true,
  createdAt: true,
  updatedAt: true
});
var plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  price: integer("price").notNull(),
  // Price in rupees
  credits: integer("credits").notNull(),
  // Number of generations (-1 for unlimited)
  features: text("features").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  generations: many(generations),
  campaigns: many(campaigns)
}));
var celebritiesRelations = relations(celebrities, ({ many }) => ({
  generations: many(generations),
  campaigns: many(campaigns)
}));
var celebrityRequestsRelations = relations(celebrityRequests, ({ one }) => ({
  user: one(users, {
    fields: [celebrityRequests.userId],
    references: [users.id]
  })
}));
var templatesRelations = relations(templates, ({ many }) => ({
  generations: many(generations)
}));
var generationsRelations = relations(generations, ({ one }) => ({
  user: one(users, {
    fields: [generations.userId],
    references: [users.id]
  }),
  celebrity: one(celebrities, {
    fields: [generations.celebrityId],
    references: [celebrities.id]
  }),
  template: one(templates, {
    fields: [generations.templateId],
    references: [templates.id]
  }),
  campaign: one(campaigns, {
    fields: [generations.campaignId],
    references: [campaigns.id]
  })
}));
var campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id]
  }),
  celebrity: one(celebrities, {
    fields: [campaigns.celebrityId],
    references: [celebrities.id]
  }),
  generations: many(generations)
}));

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, ilike, desc, and, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async deductUserCredits(userId, amount) {
    await db.update(users).set({ credits: sql2`${users.credits} - ${amount}` }).where(eq(users.id, userId));
  }
  // Celebrity operations
  async getCelebrity(slug) {
    const [celebrity] = await db.select().from(celebrities).where(and(eq(celebrities.slug, slug), eq(celebrities.isActive, true)));
    return celebrity;
  }
  async getCelebrityById(id) {
    const [celebrity] = await db.select().from(celebrities).where(eq(celebrities.id, id));
    return celebrity;
  }
  async listCelebrities() {
    return await db.select().from(celebrities).where(eq(celebrities.isActive, true)).orderBy(desc(celebrities.createdAt));
  }
  async searchCelebrities(query) {
    return await db.select().from(celebrities).where(
      and(
        ilike(celebrities.name, `%${query}%`),
        eq(celebrities.isActive, true)
      )
    ).orderBy(desc(celebrities.createdAt));
  }
  async createCelebrity(celebrity) {
    const [created] = await db.insert(celebrities).values(celebrity).returning();
    return created;
  }
  async updateCelebrity(id, celebrity) {
    const [updated] = await db.update(celebrities).set({ ...celebrity, updatedAt: /* @__PURE__ */ new Date() }).where(eq(celebrities.id, id)).returning();
    return updated;
  }
  async deleteCelebrity(id) {
    await db.delete(celebrities).where(eq(celebrities.id, id));
  }
  // Celebrity Request operations
  async getCelebrityRequest(id) {
    const [request] = await db.select().from(celebrityRequests).where(eq(celebrityRequests.id, id));
    return request;
  }
  async listCelebrityRequests(status) {
    if (status) {
      return await db.select().from(celebrityRequests).where(eq(celebrityRequests.status, status)).orderBy(desc(celebrityRequests.createdAt));
    }
    return await db.select().from(celebrityRequests).orderBy(desc(celebrityRequests.createdAt));
  }
  async createCelebrityRequest(request) {
    const [created] = await db.insert(celebrityRequests).values(request).returning();
    return created;
  }
  async updateCelebrityRequestStatus(id, status, adminNotes) {
    const [updated] = await db.update(celebrityRequests).set({
      status,
      adminNotes: adminNotes || null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(celebrityRequests.id, id)).returning();
    return updated;
  }
  async deleteCelebrityRequest(id) {
    await db.delete(celebrityRequests).where(eq(celebrityRequests.id, id));
  }
  // Template operations
  async getTemplate(slug) {
    const [template] = await db.select().from(templates).where(and(eq(templates.slug, slug), eq(templates.isActive, true)));
    return template;
  }
  async getTemplateById(id) {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }
  async listTemplates() {
    return await db.select().from(templates).where(eq(templates.isActive, true)).orderBy(desc(templates.createdAt));
  }
  async createTemplate(template) {
    const [created] = await db.insert(templates).values(template).returning();
    return created;
  }
  async updateTemplate(id, template) {
    const [updated] = await db.update(templates).set({ ...template, updatedAt: /* @__PURE__ */ new Date() }).where(eq(templates.id, id)).returning();
    return updated;
  }
  async deleteTemplate(id) {
    await db.delete(templates).where(eq(templates.id, id));
  }
  // Generation operations
  async getGeneration(id) {
    const [generation] = await db.select().from(generations).where(eq(generations.id, id));
    return generation;
  }
  async listGenerations(userId) {
    return await db.select().from(generations).where(eq(generations.userId, userId)).orderBy(desc(generations.createdAt));
  }
  async createGeneration(generation) {
    const [created] = await db.insert(generations).values(generation).returning();
    return created;
  }
  async updateGeneration(id, updates) {
    const [updated] = await db.update(generations).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(generations.id, id)).returning();
    return updated;
  }
  // Campaign operations
  async getCampaign(slug) {
    const [campaign] = await db.select().from(campaigns).where(and(eq(campaigns.slug, slug), eq(campaigns.isActive, true)));
    return campaign;
  }
  async listCampaigns() {
    return await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }
  async createCampaign(campaign) {
    const [created] = await db.insert(campaigns).values(campaign).returning();
    return created;
  }
  async deleteCampaign(id) {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }
  async incrementCampaignGenerations(id) {
    await db.update(campaigns).set({ totalGenerations: sql2`${campaigns.totalGenerations} + 1` }).where(eq(campaigns.id, id));
  }
  // Analytics
  async getAnalytics() {
    const [userCount] = await db.select({ count: sql2`count(*)` }).from(users);
    const [genCount] = await db.select({ count: sql2`count(*)` }).from(generations);
    const [celebCount] = await db.select({ count: sql2`count(*)` }).from(celebrities);
    const [campCount] = await db.select({ count: sql2`count(*)` }).from(campaigns);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
    const [recentCount] = await db.select({ count: sql2`count(*)` }).from(generations).where(sql2`${generations.createdAt} > ${oneDayAgo}`);
    return {
      totalUsers: Number(userCount.count) || 0,
      totalGenerations: Number(genCount.count) || 0,
      totalCelebrities: Number(celebCount.count) || 0,
      totalCampaigns: Number(campCount.count) || 0,
      recentGenerations: Number(recentCount.count) || 0
    };
  }
};
var storage = new DatabaseStorage();

// server/firebaseAuth.ts
import session from "express-session";
import connectPg from "connect-pg-simple";
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
}
var isAuthenticated = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.userId = req.session.userId;
  next();
};
var isAdmin = async (req, res, next) => {
  if (!req.session || !req.session.isAdmin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// server/imageProcessor.ts
import sharp from "sharp";
import { promisify } from "util";
import fs from "fs";
var readFile = promisify(fs.readFile);
var writeFile = promisify(fs.writeFile);
async function cropMargin(imageBuffer) {
  try {
    return await sharp(imageBuffer).trim({
      background: { r: 255, g: 255, b: 255 },
      threshold: 10
      // Allow slight color variation
    }).png().toBuffer();
  } catch (error) {
    console.error("Error cropping margin:", error);
    return imageBuffer;
  }
}
async function addWatermark(imageBuffer, watermarkText = "FanAI") {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions");
  }
  const fontSize = Math.max(32, Math.floor(metadata.width / 20));
  const padding = 20;
  const watermarkSvg = Buffer.from(`
    <svg width="${metadata.width}" height="${metadata.height}">
      <style>
        .watermark {
          font-family: 'Inter', sans-serif;
          font-size: ${fontSize}px;
          font-weight: 600;
          fill: white;
          fill-opacity: 0.6;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
      </style>
      <text
        x="${metadata.width - padding}"
        y="${metadata.height - padding}"
        text-anchor="end"
        class="watermark"
      >${watermarkText}</text>
    </svg>
  `);
  return await sharp(imageBuffer).composite([{
    input: watermarkSvg,
    gravity: "southeast"
  }]).png().toBuffer();
}
async function processGeneratedImage(generatedImagePath, outputPath) {
  const generatedImage = await readFile(generatedImagePath);
  const croppedImage = await cropMargin(generatedImage);
  const finalImage = await addWatermark(croppedImage);
  await writeFile(outputPath, finalImage);
}

// server/gemini.ts
import * as fs2 from "fs";
import { GoogleGenAI } from "@google/genai";
var ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
async function generateCelebrityPhoto(userImagePath, celebImagePath, prompt, outputPath) {
  try {
    console.log("[DEMO MODE] Simulating AI photo generation...");
    console.log(`Prompt: ${prompt}`);
    const userImageBytes = fs2.readFileSync(userImagePath);
    const celebImageBytes = fs2.readFileSync(celebImagePath);
    const contents = [
      {
        inlineData: {
          data: userImageBytes.toString("base64"),
          mimeType: "image/jpeg"
        }
      },
      {
        inlineData: {
          data: celebImageBytes.toString("base64"),
          mimeType: "image/jpeg"
        }
      },
      `Analyze these two images. The first is the user, the second is a celebrity. 
       Describe what a realistic combined photo would look like based on this prompt: ${prompt}`
    ];
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents
      });
      console.log("[DEMO] Gemini analysis:", response.text);
    } catch (geminiError) {
      console.warn("[DEMO] Gemini analysis skipped:", geminiError);
    }
    const sharp2 = __require("sharp");
    const userImage = sharp2(userImagePath);
    const celebImage = sharp2(celebImagePath);
    const userMeta = await userImage.metadata();
    const celebMeta = await celebImage.metadata();
    const targetHeight = 800;
    const userWidth = Math.floor(userMeta.width / userMeta.height * targetHeight);
    const celebWidth = Math.floor(celebMeta.width / celebMeta.height * targetHeight);
    const totalWidth = userWidth + celebWidth + 40;
    const resizedUser = await userImage.resize(userWidth, targetHeight).toBuffer();
    const resizedCeleb = await celebImage.resize(celebWidth, targetHeight).toBuffer();
    await sharp2({
      create: {
        width: totalWidth,
        height: targetHeight,
        channels: 4,
        background: { r: 245, g: 245, b: 250, alpha: 1 }
      }
    }).composite([
      { input: resizedUser, left: 0, top: 0 },
      { input: resizedCeleb, left: userWidth + 40, top: 0 }
    ]).png().toFile(outputPath);
    console.log("[DEMO] Simulated generation complete - created side-by-side composite");
    console.log("[PRODUCTION] Replace with real face-swap/generation API!");
  } catch (error) {
    throw new Error(`Failed to generate celebrity photo: ${error}`);
  }
}
async function analyzeUploadedImage(imagePath) {
  try {
    const imageBytes = fs2.readFileSync(imagePath);
    const contents = [
      {
        inlineData: {
          data: imageBytes.toString("base64"),
          mimeType: "image/jpeg"
        }
      },
      `Analyze this image and determine if it's suitable for AI photo generation. 
       Check for: single person clearly visible, face not obscured, good lighting, adequate quality.
       Respond with JSON: {"is_valid": boolean, "reason": string}`
    ];
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            is_valid: { type: "boolean" },
            reason: { type: "string" }
          },
          required: ["is_valid", "reason"]
        }
      },
      contents
    });
    const result = JSON.parse(response.text || "{}");
    return {
      isValid: result.is_valid || false,
      reason: result.reason
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      isValid: true,
      // Default to true if analysis fails
      reason: "Could not analyze image quality"
    };
  }
}

// server/githubClient.ts
async function fetchGitHubFile(owner, repo, path3) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("GITHUB_TOKEN not configured - GitHub integration disabled");
    return null;
  }
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path3}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.content && data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return null;
  } catch (error) {
    console.error(`Error fetching file from GitHub: ${path3}`, error);
    return null;
  }
}
async function fetchTemplatesFromGitHub(owner, repo, templatesPath = "templates/templates.json") {
  const content = await fetchGitHubFile(owner, repo, templatesPath);
  if (!content) {
    return [];
  }
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Error parsing templates.json:", error);
    return [];
  }
}
async function syncTemplatesFromGitHub(owner, repo, storage2) {
  const templates2 = await fetchTemplatesFromGitHub(owner, repo);
  const errors = [];
  let synced = 0;
  for (const template of templates2) {
    try {
      const existing = await storage2.getTemplate(template.slug || template.id);
      const templateData = {
        name: template.name,
        slug: template.slug || template.id,
        prompt: template.prompt,
        description: template.description,
        category: template.category,
        tags: template.tags,
        previewUrl: template.sample,
        isActive: true
      };
      if (existing) {
        await storage2.updateTemplate(existing.id, templateData);
      } else {
        await storage2.createTemplate(templateData);
      }
      synced++;
    } catch (error) {
      errors.push(`Failed to sync template ${template.name}: ${error.message}`);
    }
  }
  return { synced, errors };
}

// server/routes.ts
var upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG and PNG are allowed."));
    }
  }
});
var ensureDirectories = () => {
  const dirs = ["uploads", "uploads/processed", "uploads/generated"];
  dirs.forEach((dir) => {
    if (!fs3.existsSync(dir)) {
      fs3.mkdirSync(dir, { recursive: true });
    }
  });
};
async function registerRoutes(app2) {
  ensureDirectories();
  await setupAuth(app2);
  app2.post("/api/auth/login", express.json(), async (req, res) => {
    try {
      const { uid, email, displayName } = req.body;
      if (!uid) {
        return res.status(400).json({ message: "Firebase UID required" });
      }
      await storage.upsertUser({
        id: uid,
        email: email || "",
        firstName: displayName?.split(" ")[0] || "",
        lastName: displayName?.split(" ").slice(1).join(" ") || "",
        profileImageUrl: null
      });
      req.session.userId = uid;
      req.session.isAdmin = false;
      const user = await storage.getUser(uid);
      res.json(user);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/admin/login", express.json(), async (req, res) => {
    try {
      const { userId, password } = req.body;
      const adminUserId = process.env.ADMIN_USER_ID;
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminUserId || !adminPassword) {
        return res.status(500).json({ message: "Admin credentials not configured" });
      }
      if (userId !== adminUserId || password !== adminPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = "admin";
      req.session.isAdmin = true;
      res.json({
        message: "Admin login successful",
        role: "admin"
      });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId || req.session.userId;
      if (req.session.isAdmin) {
        return res.json({
          id: "admin",
          role: "admin",
          email: "admin@fanai.com",
          firstName: "Admin",
          lastName: "",
          credits: 999999
        });
      }
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/github/celebrity-image/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const githubToken = process.env.GITHUB_TOKEN;
      if (!githubToken) {
        return res.status(503).json({ message: "GitHub integration not configured" });
      }
      const owner = "Sumanradhadas";
      const repo = "fan-ai-celebs";
      const imagePath = `celebs/${slug}.jpg`;
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/main/${imagePath}`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`
          }
        }
      );
      if (!response.ok) {
        return res.status(404).json({ message: "Celebrity image not found" });
      }
      const imageBuffer = await response.arrayBuffer();
      res.set("Content-Type", "image/jpeg");
      res.set("Cache-Control", "public, max-age=86400");
      res.send(Buffer.from(imageBuffer));
    } catch (error) {
      console.error("Error fetching celebrity image from GitHub:", error);
      res.status(500).json({ message: "Failed to fetch image" });
    }
  });
  app2.get("/api/celebrities", async (req, res) => {
    try {
      const celebrities2 = await storage.listCelebrities();
      const celebritiesWithGitHubImages = celebrities2.map((celeb) => ({
        ...celeb,
        imageUrl: `/api/github/celebrity-image/${celeb.slug}`
      }));
      res.json(celebritiesWithGitHubImages);
    } catch (error) {
      console.error("Error fetching celebrities:", error);
      res.status(500).json({ message: "Failed to fetch celebrities" });
    }
  });
  app2.get("/api/celebrities/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      const results = await storage.searchCelebrities(query);
      const resultsWithGitHubImages = results.map((celeb) => ({
        ...celeb,
        imageUrl: `/api/github/celebrity-image/${celeb.slug}`
      }));
      res.json(resultsWithGitHubImages);
    } catch (error) {
      console.error("Error searching celebrities:", error);
      res.status(500).json({ message: "Failed to search celebrities" });
    }
  });
  app2.get("/api/celebrities/:slug", async (req, res) => {
    try {
      const celebrity = await storage.getCelebrity(req.params.slug);
      if (!celebrity) {
        return res.status(404).json({ message: "Celebrity not found" });
      }
      const celebrityWithGitHubImage = {
        ...celebrity,
        imageUrl: `/api/github/celebrity-image/${celebrity.slug}`
      };
      res.json(celebrityWithGitHubImage);
    } catch (error) {
      console.error("Error fetching celebrity:", error);
      res.status(500).json({ message: "Failed to fetch celebrity" });
    }
  });
  app2.post("/api/celebrity-requests", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
      const userId = req.userId || req.session.userId;
      const { name, description, category } = req.body;
      const uploadedFile = req.file;
      if (!name) {
        return res.status(400).json({ message: "Celebrity name is required" });
      }
      if (!uploadedFile) {
        return res.status(400).json({ message: "Celebrity image is required" });
      }
      const request = await storage.createCelebrityRequest({
        userId,
        name,
        description: description || null,
        category: category || null,
        imageUrl: `/uploads/${uploadedFile.filename}`
      });
      res.json({
        message: "Celebrity request submitted successfully. Admin will review it soon.",
        request
      });
    } catch (error) {
      console.error("Error submitting celebrity request:", error);
      res.status(500).json({ message: "Failed to submit celebrity request" });
    }
  });
  app2.get("/api/admin/celebrity-requests", isAdmin, async (req, res) => {
    try {
      const status = req.query.status;
      const requests = await storage.listCelebrityRequests(status);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching celebrity requests:", error);
      res.status(500).json({ message: "Failed to fetch celebrity requests" });
    }
  });
  app2.patch("/api/admin/celebrity-requests/:id/approve", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { slug, adminNotes } = req.body;
      const request = await storage.getCelebrityRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Celebrity request not found" });
      }
      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request has already been processed" });
      }
      if (!slug) {
        return res.status(400).json({ message: "Slug is required for approval" });
      }
      const celebrity = await storage.createCelebrity({
        name: request.name,
        slug,
        description: request.description,
        imageUrl: request.imageUrl,
        category: request.category,
        isActive: true
      });
      await storage.updateCelebrityRequestStatus(id, "approved", adminNotes);
      res.json({
        message: "Celebrity request approved and added to database",
        celebrity
      });
    } catch (error) {
      console.error("Error approving celebrity request:", error);
      res.status(500).json({ message: "Failed to approve celebrity request" });
    }
  });
  app2.patch("/api/admin/celebrity-requests/:id/reject", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;
      const request = await storage.getCelebrityRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Celebrity request not found" });
      }
      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request has already been processed" });
      }
      await storage.updateCelebrityRequestStatus(id, "rejected", adminNotes);
      res.json({ message: "Celebrity request rejected" });
    } catch (error) {
      console.error("Error rejecting celebrity request:", error);
      res.status(500).json({ message: "Failed to reject celebrity request" });
    }
  });
  app2.delete("/api/admin/celebrity-requests/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCelebrityRequest(id);
      res.json({ message: "Celebrity request deleted" });
    } catch (error) {
      console.error("Error deleting celebrity request:", error);
      res.status(500).json({ message: "Failed to delete celebrity request" });
    }
  });
  app2.get("/api/templates", async (req, res) => {
    try {
      const templates2 = await storage.listTemplates();
      res.json(templates2);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  app2.get("/api/templates/:slug", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.slug);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });
  app2.post("/api/generate", isAuthenticated, upload.single("photo"), async (req, res) => {
    try {
      const userId = req.userId || req.session.userId;
      const { celebrityId, templateId, campaignId } = req.body;
      const uploadedFile = req.file;
      if (!uploadedFile) {
        return res.status(400).json({ message: "Photo upload required" });
      }
      if (!celebrityId || !templateId) {
        return res.status(400).json({ message: "Celebrity and template required" });
      }
      const user = await storage.getUser(userId);
      if (!user || user.credits < 1) {
        return res.status(403).json({ message: "Insufficient credits" });
      }
      const celebrity = await storage.getCelebrityById(celebrityId);
      const template = await storage.getTemplateById(templateId);
      if (!celebrity || !template) {
        return res.status(404).json({ message: "Celebrity or template not found" });
      }
      const analysis = await analyzeUploadedImage(uploadedFile.path);
      if (!analysis.isValid) {
        fs3.unlinkSync(uploadedFile.path);
        return res.status(400).json({ message: analysis.reason || "Invalid image" });
      }
      const generation = await storage.createGeneration({
        userId,
        celebrityId,
        templateId,
        campaignId: campaignId || void 0,
        userImageUrl: `/uploads/${uploadedFile.filename}`,
        status: "pending"
      });
      await storage.deductUserCredits(userId, 1);
      if (campaignId) {
        await storage.incrementCampaignGenerations(campaignId);
      }
      setImmediate(async () => {
        try {
          await storage.updateGeneration(generation.id, { status: "processing" });
          const outputPath = `uploads/generated/${generation.id}.png`;
          const processedPath = `uploads/processed/${generation.id}.png`;
          const prompt = template.prompt.replace(/\{\{celeb_name\}\}/g, celebrity.name);
          await generateCelebrityPhoto(
            uploadedFile.path,
            celebrity.imageUrl || uploadedFile.path,
            // Fallback if no celeb image
            prompt,
            outputPath
          );
          await processGeneratedImage(outputPath, processedPath);
          await storage.updateGeneration(generation.id, {
            generatedImageUrl: `/uploads/processed/${generation.id}.png`,
            status: "completed"
          });
        } catch (error) {
          console.error("Generation error:", error);
          await storage.updateGeneration(generation.id, {
            status: "failed",
            errorMessage: error.message || "Generation failed"
          });
        }
      });
      res.json({ generationId: generation.id });
    } catch (error) {
      console.error("Generate error:", error);
      res.status(500).json({ message: error.message || "Generation failed" });
    }
  });
  app2.get("/api/generations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId || req.session.userId;
      const generations2 = await storage.listGenerations(userId);
      res.json(generations2);
    } catch (error) {
      console.error("Error fetching generations:", error);
      res.status(500).json({ message: "Failed to fetch generations" });
    }
  });
  app2.get("/api/generations/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId || req.session.userId;
      const generation = await storage.getGeneration(req.params.id);
      if (!generation) {
        return res.status(404).json({ message: "Generation not found" });
      }
      if (generation.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(generation);
    } catch (error) {
      console.error("Error fetching generation:", error);
      res.status(500).json({ message: "Failed to fetch generation" });
    }
  });
  app2.get("/api/admin/celebrities", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const celebrities2 = await storage.listCelebrities();
      res.json(celebrities2);
    } catch (error) {
      console.error("Error fetching celebrities:", error);
      res.status(500).json({ message: "Failed to fetch celebrities" });
    }
  });
  app2.post("/api/admin/celebrities", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertCelebritySchema.parse(req.body);
      const celebrity = await storage.createCelebrity(validated);
      res.status(201).json(celebrity);
    } catch (error) {
      console.error("Error creating celebrity:", error);
      res.status(400).json({ message: error.message || "Failed to create celebrity" });
    }
  });
  app2.patch("/api/admin/celebrities/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const celebrity = await storage.updateCelebrity(req.params.id, req.body);
      res.json(celebrity);
    } catch (error) {
      console.error("Error updating celebrity:", error);
      res.status(400).json({ message: error.message || "Failed to update celebrity" });
    }
  });
  app2.delete("/api/admin/celebrities/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteCelebrity(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting celebrity:", error);
      res.status(500).json({ message: "Failed to delete celebrity" });
    }
  });
  app2.get("/api/admin/templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templates2 = await storage.listTemplates();
      res.json(templates2);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  app2.post("/api/admin/templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validated);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(400).json({ message: error.message || "Failed to create template" });
    }
  });
  app2.patch("/api/admin/templates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const template = await storage.updateTemplate(req.params.id, req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(400).json({ message: error.message || "Failed to update template" });
    }
  });
  app2.delete("/api/admin/templates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });
  app2.get("/api/campaigns/:slug", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.slug);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });
  app2.get("/api/admin/campaigns", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const campaigns2 = await storage.listCampaigns();
      res.json(campaigns2);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });
  app2.post("/api/admin/campaigns", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.userId || req.session.userId;
      const validated = insertCampaignSchema.parse({ ...req.body, userId });
      const campaign = await storage.createCampaign(validated);
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(400).json({ message: error.message || "Failed to create campaign" });
    }
  });
  app2.delete("/api/admin/campaigns/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteCampaign(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });
  app2.get("/api/admin/analytics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.post("/api/admin/sync-templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { owner, repo } = req.body;
      if (!owner || !repo) {
        return res.status(400).json({
          message: "GitHub owner and repo are required"
        });
      }
      const result = await syncTemplatesFromGitHub(owner, repo, storage);
      res.json({
        message: `Successfully synced ${result.synced} templates`,
        synced: result.synced,
        errors: result.errors
      });
    } catch (error) {
      console.error("Error syncing templates from GitHub:", error);
      res.status(500).json({
        message: "Failed to sync templates from GitHub",
        error: error.message
      });
    }
  });
  app2.use("/uploads", express.static("uploads"));
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs4 from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    strictPort: false,
    hmr: {
      clientPort: 443
    },
    allowedHosts: ["all"],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs4.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs4.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
