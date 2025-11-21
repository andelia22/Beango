import { type User, type UpsertUser, type City, type Challenge, type BeangoCompletion, type InsertBeangoCompletion, citySchema, challengeSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
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
  const catalogPath = join(import.meta.dirname, "data", "cities.json");
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
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
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

export const storage = new MemStorage();
