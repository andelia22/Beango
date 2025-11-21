import { type User, type InsertUser, type City, type Challenge, citySchema, challengeSchema } from "@shared/schema";
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
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getCities(): Promise<City[]>;
  getCity(cityId: string): Promise<City | undefined>;
  getCityChallenges(cityId: string): Promise<Challenge[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cityCatalog: CityCatalog;

  constructor() {
    this.users = new Map();
    this.cityCatalog = loadCityCatalog();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
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
}

export const storage = new MemStorage();
