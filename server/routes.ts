import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./firebaseAuth";
import { insertBeangoCompletionSchema, insertRoomSchema, insertRoomParticipantSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get("/api/auth/user", async (req: any, res) => {
    const sessionUser = (req.session as any).user;
    if (!sessionUser || !sessionUser.uid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const userId = sessionUser.uid;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/auth/user/interests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.uid;
      const { interests } = req.body;
      
      if (!Array.isArray(interests)) {
        return res.status(400).json({ error: "Interests must be an array" });
      }
      
      const user = await storage.saveUserInterests(userId, interests);
      res.json(user);
    } catch (error) {
      console.error("Error saving interests:", error);
      res.status(500).json({ error: "Failed to save interests" });
    }
  });

  app.get("/api/cities", async (_req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ error: "Failed to fetch cities" });
    }
  });

  app.get("/api/cities/:cityId/challenges", async (req, res) => {
    try {
      const { cityId } = req.params;
      const city = await storage.getCity(cityId);
      
      if (!city) {
        return res.status(404).json({ error: `City '${cityId}' not found` });
      }
      
      const challenges = await storage.getCityChallenges(cityId);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });

  app.post("/api/beango-completions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.uid;
      const validatedData = insertBeangoCompletionSchema.parse({
        ...req.body,
        userId,
      });
      const completion = await storage.createBeangoCompletion(validatedData);
      res.json(completion);
    } catch (error) {
      console.error("Error creating completion:", error);
      res.status(400).json({ error: "Failed to create completion" });
    }
  });

  app.get("/api/beango-completions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.uid;
      const completions = await storage.getUserCompletions(userId);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching completions:", error);
      res.status(500).json({ error: "Failed to fetch completions" });
    }
  });

  app.post("/api/rooms", async (req: any, res) => {
    try {
      const { code, cityId, cityName, createdBy, totalChallenges } = req.body;
      
      const existingRoom = await storage.getRoom(code);
      if (existingRoom) {
        return res.status(409).json({ error: "Room code already exists" });
      }
      
      const room = await storage.createRoom({
        code,
        cityId,
        cityName,
        createdBy,
        totalChallenges,
        status: "in_progress",
      });
      
      const userId = (req.session as any)?.user?.uid || null;
      
      await storage.addParticipant({
        roomCode: code,
        deviceId: createdBy,
        userId,
        completedChallengeIds: [],
      });
      
      res.json(room);
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  app.get("/api/rooms/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const room = await storage.getRoom(code);
      
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      const participants = await storage.getParticipantsByRoom(code);
      res.json({ ...room, participants });
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ error: "Failed to fetch room" });
    }
  });

  app.post("/api/rooms/:code/join", async (req: any, res) => {
    try {
      const { code } = req.params;
      const { deviceId } = req.body;
      
      const room = await storage.getRoom(code);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      const userId = (req.session as any)?.user?.uid || null;
      
      const participant = await storage.addParticipant({
        roomCode: code,
        deviceId,
        userId,
        completedChallengeIds: [],
      });
      
      const participants = await storage.getParticipantsByRoom(code);
      res.json({ ...room, participants, myProgress: participant });
    } catch (error) {
      console.error("Error joining room:", error);
      res.status(500).json({ error: "Failed to join room" });
    }
  });

  app.patch("/api/rooms/:code/progress", async (req: any, res) => {
    try {
      const { code } = req.params;
      const { deviceId, completedChallengeIds } = req.body;
      const userId = (req.session as any)?.user?.uid || null;
      
      const room = await storage.getRoom(code);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      const participant = await storage.updateParticipantProgress(code, deviceId, userId, completedChallengeIds);
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }
      
      res.json(participant);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  app.patch("/api/rooms/:code/complete", async (req, res) => {
    try {
      const { code } = req.params;
      
      const room = await storage.updateRoomStatus(code, "completed");
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      res.json(room);
    } catch (error) {
      console.error("Error completing room:", error);
      res.status(500).json({ error: "Failed to complete room" });
    }
  });

  app.get("/api/rooms/by-device/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const rooms = await storage.getRoomsByDeviceId(deviceId);
      
      const roomsWithProgress = await Promise.all(
        rooms.map(async (room) => {
          const participant = await storage.getParticipant(room.code, deviceId);
          return {
            ...room,
            completedCount: participant?.completedChallengeIds?.length || 0,
          };
        })
      );
      
      res.json(roomsWithProgress);
    } catch (error) {
      console.error("Error fetching rooms by device:", error);
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  app.get("/api/rooms/by-user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.uid;
      const rooms = await storage.getRoomsByUserId(userId);
      
      const roomsWithProgress = await Promise.all(
        rooms.map(async (room) => {
          const participant = await storage.getParticipantByUserId(room.code, userId);
          return {
            ...room,
            completedCount: participant?.completedChallengeIds?.length || 0,
          };
        })
      );
      
      res.json(roomsWithProgress);
    } catch (error) {
      console.error("Error fetching rooms by user:", error);
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms/link-user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.uid;
      const { deviceId } = req.body;
      
      await storage.linkParticipantToUser(deviceId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error linking user:", error);
      res.status(500).json({ error: "Failed to link user" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
