import { type User, type UpsertUser, type City, type Challenge, type BeangoCompletion, type InsertBeangoCompletion, type Room, type InsertRoom, type RoomParticipant, type InsertRoomParticipant, citySchema, challengeSchema } from "@shared/schema";
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
  
  createRoom(room: InsertRoom): Promise<Room>;
  getRoom(code: string): Promise<Room | undefined>;
  updateRoomStatus(code: string, status: string): Promise<Room | undefined>;
  getRoomsByDeviceId(deviceId: string): Promise<Room[]>;
  getRoomsByUserId(userId: string): Promise<Room[]>;
  
  addParticipant(participant: InsertRoomParticipant): Promise<RoomParticipant>;
  getParticipant(roomCode: string, deviceId: string): Promise<RoomParticipant | undefined>;
  getParticipantsByRoom(roomCode: string): Promise<RoomParticipant[]>;
  updateParticipantProgress(roomCode: string, deviceId: string, completedChallengeIds: number[]): Promise<RoomParticipant | undefined>;
  linkParticipantToUser(deviceId: string, userId: string): Promise<void>;
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

  async createRoom(_room: InsertRoom): Promise<Room> {
    throw new Error("Not implemented in MemStorage");
  }
  async getRoom(_code: string): Promise<Room | undefined> {
    throw new Error("Not implemented in MemStorage");
  }
  async updateRoomStatus(_code: string, _status: string): Promise<Room | undefined> {
    throw new Error("Not implemented in MemStorage");
  }
  async getRoomsByDeviceId(_deviceId: string): Promise<Room[]> {
    throw new Error("Not implemented in MemStorage");
  }
  async getRoomsByUserId(_userId: string): Promise<Room[]> {
    throw new Error("Not implemented in MemStorage");
  }
  async addParticipant(_participant: InsertRoomParticipant): Promise<RoomParticipant> {
    throw new Error("Not implemented in MemStorage");
  }
  async getParticipant(_roomCode: string, _deviceId: string): Promise<RoomParticipant | undefined> {
    throw new Error("Not implemented in MemStorage");
  }
  async getParticipantsByRoom(_roomCode: string): Promise<RoomParticipant[]> {
    throw new Error("Not implemented in MemStorage");
  }
  async updateParticipantProgress(_roomCode: string, _deviceId: string, _completedChallengeIds: number[]): Promise<RoomParticipant | undefined> {
    throw new Error("Not implemented in MemStorage");
  }
  async linkParticipantToUser(_deviceId: string, _userId: string): Promise<void> {
    throw new Error("Not implemented in MemStorage");
  }
}

import { db } from "./db";
import { users as usersTable, beangoCompletions as beangoCompletionsTable, rooms as roomsTable, roomParticipants as roomParticipantsTable } from "@shared/schema";
import { eq, desc, or } from "drizzle-orm";

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
    
    let existing: User | undefined;
    
    if (userData.email) {
      const resultByEmail = await db.select().from(usersTable).where(eq(usersTable.email, userData.email));
      existing = resultByEmail[0];
    }
    
    if (!existing) {
      existing = await this.getUser(userId);
    }
    
    if (existing) {
      const updated = await db
        .update(usersTable)
        .set({
          id: userId,
          email: userData.email ?? existing.email,
          firstName: userData.firstName ?? existing.firstName,
          lastName: userData.lastName ?? existing.lastName,
          profileImageUrl: userData.profileImageUrl ?? existing.profileImageUrl,
          interests: userData.interests ?? existing.interests,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, existing.id))
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

  async createRoom(roomData: InsertRoom): Promise<Room> {
    const inserted = await db
      .insert(roomsTable)
      .values(roomData)
      .returning();
    return inserted[0];
  }

  async getRoom(code: string): Promise<Room | undefined> {
    const result = await db.select().from(roomsTable).where(eq(roomsTable.code, code));
    return result[0];
  }

  async updateRoomStatus(code: string, status: string): Promise<Room | undefined> {
    const updated = await db
      .update(roomsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(roomsTable.code, code))
      .returning();
    return updated[0];
  }

  async getRoomsByDeviceId(deviceId: string): Promise<Room[]> {
    const participants = await db
      .select()
      .from(roomParticipantsTable)
      .where(eq(roomParticipantsTable.deviceId, deviceId));
    
    if (participants.length === 0) return [];
    
    const roomCodes = participants.map(p => p.roomCode);
    const rooms: Room[] = [];
    for (const code of roomCodes) {
      const room = await this.getRoom(code);
      if (room) rooms.push(room);
    }
    return rooms.sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async getRoomsByUserId(userId: string): Promise<Room[]> {
    const participants = await db
      .select()
      .from(roomParticipantsTable)
      .where(eq(roomParticipantsTable.userId, userId));
    
    if (participants.length === 0) return [];
    
    const roomCodes = participants.map(p => p.roomCode);
    const rooms: Room[] = [];
    for (const code of roomCodes) {
      const room = await this.getRoom(code);
      if (room) rooms.push(room);
    }
    return rooms.sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async addParticipant(participantData: InsertRoomParticipant): Promise<RoomParticipant> {
    const existing = await this.getParticipant(participantData.roomCode, participantData.deviceId);
    if (existing) return existing;
    
    const inserted = await db
      .insert(roomParticipantsTable)
      .values(participantData)
      .returning();
    return inserted[0];
  }

  async getParticipant(roomCode: string, deviceId: string): Promise<RoomParticipant | undefined> {
    const result = await db
      .select()
      .from(roomParticipantsTable)
      .where(eq(roomParticipantsTable.roomCode, roomCode));
    return result.find(p => p.deviceId === deviceId);
  }

  async getParticipantsByRoom(roomCode: string): Promise<RoomParticipant[]> {
    return await db
      .select()
      .from(roomParticipantsTable)
      .where(eq(roomParticipantsTable.roomCode, roomCode));
  }

  async updateParticipantProgress(roomCode: string, deviceId: string, completedChallengeIds: number[]): Promise<RoomParticipant | undefined> {
    const participant = await this.getParticipant(roomCode, deviceId);
    if (!participant) return undefined;
    
    const updated = await db
      .update(roomParticipantsTable)
      .set({ 
        completedChallengeIds, 
        updatedAt: new Date() 
      })
      .where(eq(roomParticipantsTable.id, participant.id))
      .returning();
    
    await db
      .update(roomsTable)
      .set({ updatedAt: new Date() })
      .where(eq(roomsTable.code, roomCode));
    
    return updated[0];
  }

  async linkParticipantToUser(deviceId: string, userId: string): Promise<void> {
    await db
      .update(roomParticipantsTable)
      .set({ userId, updatedAt: new Date() })
      .where(eq(roomParticipantsTable.deviceId, deviceId));
  }
}

export const storage = new DatabaseStorage();
