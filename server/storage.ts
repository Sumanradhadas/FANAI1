// Blueprint: javascript_log_in_with_replit and javascript_database
import {
  users,
  celebrities,
  celebrityRequests,
  templates,
  generations,
  campaigns,
  plans,
  type User,
  type UpsertUser,
  type Celebrity,
  type InsertCelebrity,
  type CelebrityRequest,
  type InsertCelebrityRequest,
  type Template,
  type InsertTemplate,
  type Generation,
  type InsertGeneration,
  type Campaign,
  type InsertCampaign,
  type Plan,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  deductUserCredits(userId: string, amount: number): Promise<void>;

  // Celebrity operations
  getCelebrity(slug: string): Promise<Celebrity | undefined>;
  getCelebrityById(id: string): Promise<Celebrity | undefined>;
  listCelebrities(): Promise<Celebrity[]>;
  searchCelebrities(query: string): Promise<Celebrity[]>;
  createCelebrity(celebrity: InsertCelebrity): Promise<Celebrity>;
  updateCelebrity(id: string, celebrity: Partial<InsertCelebrity>): Promise<Celebrity>;
  deleteCelebrity(id: string): Promise<void>;

  // Celebrity Request operations
  getCelebrityRequest(id: string): Promise<CelebrityRequest | undefined>;
  listCelebrityRequests(status?: string): Promise<CelebrityRequest[]>;
  createCelebrityRequest(request: InsertCelebrityRequest): Promise<CelebrityRequest>;
  updateCelebrityRequestStatus(id: string, status: string, adminNotes?: string): Promise<CelebrityRequest>;
  deleteCelebrityRequest(id: string): Promise<void>;

  // Template operations
  getTemplate(slug: string): Promise<Template | undefined>;
  getTemplateById(id: string): Promise<Template | undefined>;
  listTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template>;
  deleteTemplate(id: string): Promise<void>;

  // Generation operations
  getGeneration(id: string): Promise<Generation | undefined>;
  listGenerations(userId: string): Promise<Generation[]>;
  createGeneration(generation: InsertGeneration): Promise<Generation>;
  updateGeneration(id: string, updates: Partial<Generation>): Promise<Generation>;

  // Campaign operations
  getCampaign(slug: string): Promise<Campaign | undefined>;
  listCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  deleteCampaign(id: string): Promise<void>;
  incrementCampaignGenerations(id: string): Promise<void>;

  // Analytics
  getAnalytics(): Promise<{
    totalUsers: number;
    totalGenerations: number;
    totalCelebrities: number;
    totalCampaigns: number;
    recentGenerations: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async deductUserCredits(userId: string, amount: number): Promise<void> {
    await db
      .update(users)
      .set({ credits: sql`${users.credits} - ${amount}` })
      .where(eq(users.id, userId));
  }

  // Celebrity operations
  async getCelebrity(slug: string): Promise<Celebrity | undefined> {
    const [celebrity] = await db
      .select()
      .from(celebrities)
      .where(and(eq(celebrities.slug, slug), eq(celebrities.isActive, true)));
    return celebrity;
  }

  async getCelebrityById(id: string): Promise<Celebrity | undefined> {
    const [celebrity] = await db.select().from(celebrities).where(eq(celebrities.id, id));
    return celebrity;
  }

  async listCelebrities(): Promise<Celebrity[]> {
    return await db
      .select()
      .from(celebrities)
      .where(eq(celebrities.isActive, true))
      .orderBy(desc(celebrities.createdAt));
  }

  async searchCelebrities(query: string): Promise<Celebrity[]> {
    return await db
      .select()
      .from(celebrities)
      .where(
        and(
          ilike(celebrities.name, `%${query}%`),
          eq(celebrities.isActive, true)
        )
      )
      .orderBy(desc(celebrities.createdAt));
  }

  async createCelebrity(celebrity: InsertCelebrity): Promise<Celebrity> {
    const [created] = await db.insert(celebrities).values(celebrity).returning();
    return created;
  }

  async updateCelebrity(id: string, celebrity: Partial<InsertCelebrity>): Promise<Celebrity> {
    const [updated] = await db
      .update(celebrities)
      .set({ ...celebrity, updatedAt: new Date() })
      .where(eq(celebrities.id, id))
      .returning();
    return updated;
  }

  async deleteCelebrity(id: string): Promise<void> {
    await db.delete(celebrities).where(eq(celebrities.id, id));
  }

  // Celebrity Request operations
  async getCelebrityRequest(id: string): Promise<CelebrityRequest | undefined> {
    const [request] = await db
      .select()
      .from(celebrityRequests)
      .where(eq(celebrityRequests.id, id));
    return request;
  }

  async listCelebrityRequests(status?: string): Promise<CelebrityRequest[]> {
    if (status) {
      return await db
        .select()
        .from(celebrityRequests)
        .where(eq(celebrityRequests.status, status))
        .orderBy(desc(celebrityRequests.createdAt));
    }
    return await db
      .select()
      .from(celebrityRequests)
      .orderBy(desc(celebrityRequests.createdAt));
  }

  async createCelebrityRequest(request: InsertCelebrityRequest): Promise<CelebrityRequest> {
    const [created] = await db.insert(celebrityRequests).values(request).returning();
    return created;
  }

  async updateCelebrityRequestStatus(id: string, status: string, adminNotes?: string): Promise<CelebrityRequest> {
    const [updated] = await db
      .update(celebrityRequests)
      .set({ 
        status, 
        adminNotes: adminNotes || null,
        updatedAt: new Date() 
      })
      .where(eq(celebrityRequests.id, id))
      .returning();
    return updated;
  }

  async deleteCelebrityRequest(id: string): Promise<void> {
    await db.delete(celebrityRequests).where(eq(celebrityRequests.id, id));
  }

  // Template operations
  async getTemplate(slug: string): Promise<Template | undefined> {
    const [template] = await db
      .select()
      .from(templates)
      .where(and(eq(templates.slug, slug), eq(templates.isActive, true)));
    return template;
  }

  async getTemplateById(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async listTemplates(): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.isActive, true))
      .orderBy(desc(templates.createdAt));
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [created] = await db.insert(templates).values(template).returning();
    return created;
  }

  async updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template> {
    const [updated] = await db
      .update(templates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    return updated;
  }

  async deleteTemplate(id: string): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  // Generation operations
  async getGeneration(id: string): Promise<Generation | undefined> {
    const [generation] = await db.select().from(generations).where(eq(generations.id, id));
    return generation;
  }

  async listGenerations(userId: string): Promise<Generation[]> {
    return await db
      .select()
      .from(generations)
      .where(eq(generations.userId, userId))
      .orderBy(desc(generations.createdAt));
  }

  async createGeneration(generation: InsertGeneration): Promise<Generation> {
    const [created] = await db.insert(generations).values(generation).returning();
    return created;
  }

  async updateGeneration(id: string, updates: Partial<Generation>): Promise<Generation> {
    const [updated] = await db
      .update(generations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(generations.id, id))
      .returning();
    return updated;
  }

  // Campaign operations
  async getCampaign(slug: string): Promise<Campaign | undefined> {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.slug, slug), eq(campaigns.isActive, true)));
    return campaign;
  }

  async listCampaigns(): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .orderBy(desc(campaigns.createdAt));
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [created] = await db.insert(campaigns).values(campaign).returning();
    return created;
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  async incrementCampaignGenerations(id: string): Promise<void> {
    await db
      .update(campaigns)
      .set({ totalGenerations: sql`${campaigns.totalGenerations} + 1` })
      .where(eq(campaigns.id, id));
  }

  // Analytics
  async getAnalytics() {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [genCount] = await db.select({ count: sql<number>`count(*)` }).from(generations);
    const [celebCount] = await db.select({ count: sql<number>`count(*)` }).from(celebrities);
    const [campCount] = await db.select({ count: sql<number>`count(*)` }).from(campaigns);
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(generations)
      .where(sql`${generations.createdAt} > ${oneDayAgo}`);

    return {
      totalUsers: Number(userCount.count) || 0,
      totalGenerations: Number(genCount.count) || 0,
      totalCelebrities: Number(celebCount.count) || 0,
      totalCampaigns: Number(campCount.count) || 0,
      recentGenerations: Number(recentCount.count) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
