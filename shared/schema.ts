import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).notNull().default('user'), // 'user' or 'admin'
  credits: integer("credits").notNull().default(0), // Generation credits
  plan: varchar("plan", { length: 20 }).default('free'), // 'free', 'basic', 'silver', 'gold', 'diamond', 'campaign'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Celebrities table
export const celebrities = pgTable("celebrities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"), // GitHub URL to celebrity image
  category: varchar("category", { length: 100 }), // 'actor', 'politician', 'sports', etc.
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCelebritySchema = createInsertSchema(celebrities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCelebrity = z.infer<typeof insertCelebritySchema>;
export type Celebrity = typeof celebrities.$inferSelect;

// Celebrity Requests table (user-submitted celebrities pending admin approval)
export const celebrityRequests = pgTable("celebrity_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // 'actor', 'politician', 'sports', etc.
  imageUrl: varchar("image_url"), // Uploaded celebrity image URL
  status: varchar("status", { length: 50 }).notNull().default('pending'), // 'pending', 'approved', 'rejected'
  adminNotes: text("admin_notes"), // Optional feedback from admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCelebrityRequestSchema = createInsertSchema(celebrityRequests).omit({
  id: true,
  status: true,
  adminNotes: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCelebrityRequest = z.infer<typeof insertCelebrityRequestSchema>;
export type CelebrityRequest = typeof celebrityRequests.$inferSelect;

// Templates table
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  prompt: text("prompt").notNull(), // AI generation prompt template
  description: text("description"),
  category: varchar("category", { length: 100 }), // 'birthday', 'festival', 'campaign', etc.
  tags: text("tags").array(), // ['diwali', 'celebration', etc.]
  previewUrl: varchar("preview_url"), // Sample preview image URL
  isFree: boolean("is_free").notNull().default(false), // Free templates don't require credits
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Generations table (user generation history)
export const generations = pgTable("generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  celebrityId: varchar("celebrity_id").references(() => celebrities.id, { onDelete: 'set null' }),
  templateId: varchar("template_id").references(() => templates.id, { onDelete: 'set null' }),
  campaignId: varchar("campaign_id").references(() => campaigns.id, { onDelete: 'set null' }),
  userImageUrl: varchar("user_image_url"), // Uploaded user photo
  generatedImageUrl: varchar("generated_image_url"), // Final generated image
  status: varchar("status", { length: 50 }).notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGenerationSchema = createInsertSchema(generations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type Generation = typeof generations.$inferSelect;

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL slug for campaign link
  description: text("description"),
  candidateName: varchar("candidate_name", { length: 255 }),
  celebrityId: varchar("celebrity_id").references(() => celebrities.id, { onDelete: 'set null' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }), // Campaign creator
  isActive: boolean("is_active").notNull().default(true),
  totalGenerations: integer("total_generations").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  totalGenerations: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

// Plans table (for demo purposes)
export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  price: integer("price").notNull(), // Price in rupees
  credits: integer("credits").notNull(), // Number of generations (-1 for unlimited)
  features: text("features").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Plan = typeof plans.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  generations: many(generations),
  campaigns: many(campaigns),
}));

export const celebritiesRelations = relations(celebrities, ({ many }) => ({
  generations: many(generations),
  campaigns: many(campaigns),
}));

export const celebrityRequestsRelations = relations(celebrityRequests, ({ one }) => ({
  user: one(users, {
    fields: [celebrityRequests.userId],
    references: [users.id],
  }),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  generations: many(generations),
}));

export const generationsRelations = relations(generations, ({ one }) => ({
  user: one(users, {
    fields: [generations.userId],
    references: [users.id],
  }),
  celebrity: one(celebrities, {
    fields: [generations.celebrityId],
    references: [celebrities.id],
  }),
  template: one(templates, {
    fields: [generations.templateId],
    references: [templates.id],
  }),
  campaign: one(campaigns, {
    fields: [generations.campaignId],
    references: [campaigns.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
  celebrity: one(celebrities, {
    fields: [campaigns.celebrityId],
    references: [celebrities.id],
  }),
  generations: many(generations),
}));
