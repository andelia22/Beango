import { type User, type UpsertUser, type City, type Challenge, type BeangoCompletion, type InsertBeangoCompletion, type Room, type InsertRoom, type RoomParticipant, type InsertRoomParticipant, type ChallengeCompletion, type InsertChallengeCompletion, citySchema, challengeSchema } from "@shared/schema";
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
  startHunt(code: string, selectedChallengeIds: number[]): Promise<Room | undefined>;
  swapChallenges(code: string, oldChallengeIds: number[], newChallengeIds: number[]): Promise<Room | undefined>;
  getRoomsByDeviceId(deviceId: string): Promise<Room[]>;
  getRoomsByUserId(userId: string): Promise<Room[]>;
  getParticipantInterests(roomCode: string): Promise<string[][]>;
  
  addParticipant(participant: InsertRoomParticipant): Promise<RoomParticipant>;
  getParticipant(roomCode: string, deviceId: string): Promise<RoomParticipant | undefined>;
  getParticipantByUserId(roomCode: string, userId: string): Promise<RoomParticipant | undefined>;
  getParticipantsByRoom(roomCode: string): Promise<RoomParticipant[]>;
  updateParticipantProgress(roomCode: string, deviceId: string, userId: string | null, completedChallengeIds: number[]): Promise<RoomParticipant | undefined>;
  linkParticipantToUser(deviceId: string, userId: string): Promise<void>;
  
  addChallengeCompletion(completion: InsertChallengeCompletion): Promise<ChallengeCompletion>;
  removeChallengeCompletion(roomCode: string, challengeId: number, deviceId: string, userId?: string | null): Promise<void>;
  getChallengeCompletionsByRoom(roomCode: string): Promise<ChallengeCompletion[]>;
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
  async startHunt(_code: string, _selectedChallengeIds: number[]): Promise<Room | undefined> {
    throw new Error("Not implemented");
  }
  async swapChallenges(_code: string, _oldChallengeIds: number[], _newChallengeIds: number[]): Promise<Room | undefined> {
    throw new Error("Not implemented in MemStorage");
  }
  async getRoomsByDeviceId(_deviceId: string): Promise<Room[]> {
    throw new Error("Not implemented in MemStorage");
  }
  async getRoomsByUserId(_userId: string): Promise<Room[]> {
    throw new Error("Not implemented in MemStorage");
  }
  async getParticipantInterests(_roomCode: string): Promise<string[][]> {
    throw new Error("Not implemented in MemStorage");
  }
  async addParticipant(_participant: InsertRoomParticipant): Promise<RoomParticipant> {
    throw new Error("Not implemented in MemStorage");
  }
  async getParticipant(_roomCode: string, _deviceId: string): Promise<RoomParticipant | undefined> {
    throw new Error("Not implemented in MemStorage");
  }
  async getParticipantByUserId(_roomCode: string, _userId: string): Promise<RoomParticipant | undefined> {
    throw new Error("Not implemented in MemStorage");
  }
  async getParticipantsByRoom(_roomCode: string): Promise<RoomParticipant[]> {
    throw new Error("Not implemented in MemStorage");
  }
  async updateParticipantProgress(_roomCode: string, _deviceId: string, _userId: string | null, _completedChallengeIds: number[]): Promise<RoomParticipant | undefined> {
    throw new Error("Not implemented in MemStorage");
  }
  async linkParticipantToUser(_deviceId: string, _userId: string): Promise<void> {
    throw new Error("Not implemented in MemStorage");
  }
  async addChallengeCompletion(_completion: InsertChallengeCompletion): Promise<ChallengeCompletion> {
    throw new Error("Not implemented in MemStorage");
  }
  async removeChallengeCompletion(_roomCode: string, _challengeId: number, _deviceId: string, _userId?: string | null): Promise<void> {
    throw new Error("Not implemented in MemStorage");
  }
  async getChallengeCompletionsByRoom(_roomCode: string): Promise<ChallengeCompletion[]> {
    throw new Error("Not implemented in MemStorage");
  }
}

import { db } from "./db";
import { users as usersTable, beangoCompletions as beangoCompletionsTable, rooms as roomsTable, roomParticipants as roomParticipantsTable, challengeCompletions as challengeCompletionsTable } from "@shared/schema";
import { eq, desc, or, and } from "drizzle-orm";

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

  async startHunt(code: string, selectedChallengeIds: number[]): Promise<Room | undefined> {
    const updated = await db
      .update(roomsTable)
      .set({ 
        status: "in_progress", 
        selectedChallengeIds,
        totalChallenges: selectedChallengeIds.length,
        updatedAt: new Date() 
      })
      .where(eq(roomsTable.code, code))
      .returning();
    return updated[0];
  }

  async swapChallenges(code: string, oldChallengeIds: number[], newChallengeIds: number[]): Promise<Room | undefined> {
    const room = await this.getRoom(code);
    if (!room || !room.selectedChallengeIds) return undefined;
    
    const currentIds = [...room.selectedChallengeIds];
    const oldSet = new Set(oldChallengeIds);
    
    let newIdx = 0;
    const updatedIds = currentIds.map(id => {
      if (oldSet.has(id) && newIdx < newChallengeIds.length) {
        return newChallengeIds[newIdx++];
      }
      return id;
    });
    
    const updated = await db
      .update(roomsTable)
      .set({ 
        selectedChallengeIds: updatedIds,
        updatedAt: new Date() 
      })
      .where(eq(roomsTable.code, code))
      .returning();
    return updated[0];
  }

  async getParticipantInterests(roomCode: string): Promise<string[][]> {
    const participants = await db
      .select()
      .from(roomParticipantsTable)
      .where(eq(roomParticipantsTable.roomCode, roomCode));
    
    const interestsArrays: string[][] = [];
    
    for (const participant of participants) {
      if (participant.userId) {
        const user = await this.getUser(participant.userId);
        if (user?.interests && user.interests.length > 0) {
          interestsArrays.push(user.interests);
        }
      }
    }
    
    return interestsArrays;
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
    // Check if participant exists by deviceId
    const existingByDevice = await this.getParticipant(participantData.roomCode, participantData.deviceId);
    if (existingByDevice) {
      // If user is now authenticated but participant wasn't linked, link them
      if (participantData.userId && !existingByDevice.userId) {
        const updated = await db
          .update(roomParticipantsTable)
          .set({ userId: participantData.userId, updatedAt: new Date() })
          .where(eq(roomParticipantsTable.id, existingByDevice.id))
          .returning();
        return updated[0];
      }
      return existingByDevice;
    }
    
    // For authenticated users, check if they already have a participant record by userId
    if (participantData.userId) {
      const existingByUser = await this.getParticipantByUserId(participantData.roomCode, participantData.userId);
      if (existingByUser) {
        return existingByUser;
      }
    }
    
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

  async getParticipantByUserId(roomCode: string, userId: string): Promise<RoomParticipant | undefined> {
    const result = await db
      .select()
      .from(roomParticipantsTable)
      .where(eq(roomParticipantsTable.roomCode, roomCode));
    return result.find(p => p.userId === userId);
  }

  async getParticipantsByRoom(roomCode: string): Promise<RoomParticipant[]> {
    return await db
      .select()
      .from(roomParticipantsTable)
      .where(eq(roomParticipantsTable.roomCode, roomCode));
  }

  async updateParticipantProgress(roomCode: string, deviceId: string, userId: string | null, completedChallengeIds: number[]): Promise<RoomParticipant | undefined> {
    // Try to find participant by deviceId first
    let participant = await this.getParticipant(roomCode, deviceId);
    
    // If not found by deviceId but user is authenticated, try finding by userId
    if (!participant && userId) {
      participant = await this.getParticipantByUserId(roomCode, userId);
    }
    
    if (!participant) return undefined;
    
    // If user is authenticated and participant wasn't linked, link them now
    const updateData: any = { 
      completedChallengeIds, 
      updatedAt: new Date() 
    };
    if (userId && !participant.userId) {
      updateData.userId = userId;
    }
    
    const updated = await db
      .update(roomParticipantsTable)
      .set(updateData)
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

  async addChallengeCompletion(completion: InsertChallengeCompletion): Promise<ChallengeCompletion> {
    // Check if completion already exists for this user/challenge
    const existing = await db
      .select()
      .from(challengeCompletionsTable)
      .where(
        and(
          eq(challengeCompletionsTable.roomCode, completion.roomCode),
          eq(challengeCompletionsTable.challengeId, completion.challengeId),
          eq(challengeCompletionsTable.completedByDeviceId, completion.completedByDeviceId)
        )
      );
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    const result = await db
      .insert(challengeCompletionsTable)
      .values(completion)
      .returning();
    return result[0];
  }

  async removeChallengeCompletion(roomCode: string, challengeId: number, deviceId: string, userId: string | null = null): Promise<void> {
    // For authenticated users, also try to match by userId (for cross-device sync)
    if (userId) {
      await db
        .delete(challengeCompletionsTable)
        .where(
          and(
            eq(challengeCompletionsTable.roomCode, roomCode),
            eq(challengeCompletionsTable.challengeId, challengeId),
            or(
              eq(challengeCompletionsTable.completedByDeviceId, deviceId),
              eq(challengeCompletionsTable.completedByUserId, userId)
            )
          )
        );
    } else {
      await db
        .delete(challengeCompletionsTable)
        .where(
          and(
            eq(challengeCompletionsTable.roomCode, roomCode),
            eq(challengeCompletionsTable.challengeId, challengeId),
            eq(challengeCompletionsTable.completedByDeviceId, deviceId)
          )
        );
    }
  }

  async getChallengeCompletionsByRoom(roomCode: string): Promise<ChallengeCompletion[]> {
    return await db
      .select()
      .from(challengeCompletionsTable)
      .where(eq(challengeCompletionsTable.roomCode, roomCode))
      .orderBy(challengeCompletionsTable.completedAt);
  }
}

export const storage = new DatabaseStorage();
