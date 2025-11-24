import { type User, type UpsertUser, type City, type Challenge, type BeangoCompletion, type InsertBeangoCompletion, citySchema, challengeSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

interface CityCatalog {
  cities: Array<City & { challenges: Challenge[] }>;
}

const cityCatalogSchema = z.object({
  cities: z.array(
    citySchema.extend({
      challenges: z.array(challengeSchema),
    })
  ),
});

function loadCityCatalog(): CityCatalog {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const catalogPath = join(currentDir, "data", "cities.json");
  
  console.log('[DEBUG] Loading cities from:', catalogPath);
  console.log('[DEBUG] Current directory:', currentDir);
  console.log('[DEBUG] File exists:', existsSync(catalogPath));
  
  const catalogData = readFileSync(catalogPath, "utf-8");
  const rawData = JSON.parse(catalogData);
  
  const validatedData = cityCatalogSchema.parse(rawData);
  
  const normalizedCities = validatedData.cities.map((city) => ({
    ...city,
    challengeCount: city.challenges.length,
  }));
  
  return { cities: normalizedCities };
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  saveUserInterests(userId: string, interests: string[]): Promise<User>;
  getCities(): Promise<City[]>;
  getCity(cityId: string): Promise<City | undefined>;
  getCityChallenges(cityId: string): Promise<Challenge[]>;
  createBeangoCompletion(completion: InsertBeangoCompletion): Promise<BeangoCompletion>;
  getUserCompletions(userId: string): Promise<BeangoCompletion[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private completions: Map<string, BeangoCompletion>;
  private cityCatalog: CityCatalog;

  constructor() {
    this.users = new Map();
    this.completions = new Map();
    this.cityCatalog = loadCityCatalog();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id!);
    const user: User = {
      id: userData.id || randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      interests: userData.interests || null,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async saveUserInterests(userId: string, interests: string[]): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser: User = {
      ...user,
      interests,
      updatedAt: new Date(),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getCities(): Promise<City[]> {
    return this.cityCatalog.cities.map(({ challenges, ...city }) => city);
  }

  async getCity(cityId: string): Promise<City | undefined> {
    const cityData = this.cityCatalog.cities.find((c) => c.id === cityId);
    if (!cityData) return undefined;
    const { challenges, ...city } = cityData;
    return city;
  }

  async getCityChallenges(cityId: string): Promise<Challenge[]> {
    const cityData = this.cityCatalog.cities.find((c) => c.id === cityId);
    return cityData?.challenges || [];
  }

  async createBeangoCompletion(completionData: InsertBeangoCompletion): Promise<BeangoCompletion> {
    const id = randomUUID();
    const completion: BeangoCompletion = {
      id,
      ...completionData,
      cityImageUrl: completionData.cityImageUrl ?? null,
      participantCount: completionData.participantCount ?? 1,
      completedAt: new Date(),
    };
    this.completions.set(id, completion);
    return completion;
  }

  async getUserCompletions(userId: string): Promise<BeangoCompletion[]> {
    return Array.from(this.completions.values())
      .filter((c) => c.userId === userId)
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
  }
}

import { db } from "./db";
import { users as usersTable, beangoCompletions as beangoCompletionsTable } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  private cityCatalog: CityCatalog;

  constructor() {
    this.cityCatalog = loadCityCatalog();
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userId = userData.id || randomUUID();
    const existing = await this.getUser(userId);
    if (existing) {
      const updated = await db
        .update(usersTable)
        .set({
          email: userData.email ?? existing.email,
          firstName: userData.firstName ?? existing.firstName,
          lastName: userData.lastName ?? existing.lastName,
          profileImageUrl: userData.profileImageUrl ?? existing.profileImageUrl,
          interests: userData.interests ?? existing.interests,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userId))
        .returning();
      return updated[0];
    } else {
      const inserted = await db
        .insert(usersTable)
        .values({
          id: userId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          interests: userData.interests,
        })
        .returning();
      return inserted[0];
    }
  }

  async saveUserInterests(userId: string, interests: string[]): Promise<User> {
    const updated = await db
      .update(usersTable)
      .set({
        interests,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId))
      .returning();
    
    if (!updated[0]) {
      throw new Error("User not found");
    }
    
    return updated[0];
  }

  async getCities(): Promise<City[]> {
    return this.cityCatalog.cities.map(({ challenges, ...city }) => city);
  }

  async getCity(cityId: string): Promise<City | undefined> {
    const cityData = this.cityCatalog.cities.find((c) => c.id === cityId);
    if (!cityData) return undefined;
    const { challenges, ...city } = cityData;
    return city;
  }

  async getCityChallenges(cityId: string): Promise<Challenge[]> {
    const cityData = this.cityCatalog.cities.find((c) => c.id === cityId);
    return cityData?.challenges || [];
  }

  async createBeangoCompletion(completionData: InsertBeangoCompletion): Promise<BeangoCompletion> {
    const inserted = await db
      .insert(beangoCompletionsTable)
      .values({
        ...completionData,
        cityImageUrl: completionData.cityImageUrl ?? null,
        participantCount: completionData.participantCount ?? 1,
      })
      .returning();
    return inserted[0];
  }

  async getUserCompletions(userId: string): Promise<BeangoCompletion[]> {
    const completions = await db
      .select()
      .from(beangoCompletionsTable)
      .where(eq(beangoCompletionsTable.userId, userId))
      .orderBy(desc(beangoCompletionsTable.completedAt));
    return completions;
  }
}

export const storage = new DatabaseStorage();
