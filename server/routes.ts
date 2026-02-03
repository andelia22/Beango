import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./firebaseAuth";
import { insertBeangoCompletionSchema, insertRoomSchema, insertRoomParticipantSchema, type Challenge } from "@shared/schema";

function selectChallengesForGroup(
  allChallenges: Challenge[], 
  participantInterests: string[][], 
  targetCount: number
): number[] {
  if (allChallenges.length <= targetCount) {
    return allChallenges.map(c => c.id);
  }
  
  if (participantInterests.length === 0 || participantInterests.every(i => i.length === 0)) {
    const shuffled = [...allChallenges].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, targetCount).map(c => c.id);
  }
  
  const interestWeights: Map<string, number> = new Map();
  const allInterestsSet: Set<string> = new Set();
  
  for (const interests of participantInterests) {
    for (const interest of interests) {
      allInterestsSet.add(interest);
      interestWeights.set(interest, (interestWeights.get(interest) || 0) + 1);
    }
  }
  
  const challengeScores: Map<number, number> = new Map();
  for (const challenge of allChallenges) {
    let score = 0;
    const challengeInterests = challenge.interests || [];
    for (const interest of challengeInterests) {
      score += interestWeights.get(interest) || 0;
    }
    challengeScores.set(challenge.id, score);
  }
  
  const selected: Set<number> = new Set();
  const interestCovered: Set<string> = new Set();
  
  for (const interest of Array.from(allInterestsSet)) {
    if (selected.size >= targetCount) break;
    
    const matchingChallenges = allChallenges.filter(c => 
      !selected.has(c.id) && 
      (c.interests || []).includes(interest)
    );
    
    if (matchingChallenges.length > 0) {
      const randomPick = matchingChallenges[Math.floor(Math.random() * matchingChallenges.length)];
      selected.add(randomPick.id);
      interestCovered.add(interest);
    }
  }
  
  const remaining = allChallenges
    .filter(c => !selected.has(c.id))
    .sort((a, b) => {
      const scoreA = challengeScores.get(a.id) || 0;
      const scoreB = challengeScores.get(b.id) || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return Math.random() - 0.5;
    });
  
  for (const challenge of remaining) {
    if (selected.size >= targetCount) break;
    selected.add(challenge.id);
  }
  
  return Array.from(selected);
}

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
      
      const userId = (req.session as any)?.user?.uid || null;
      let hostFirstName: string | null = null;
      
      if (userId) {
        const user = await storage.getUser(userId);
        hostFirstName = user?.firstName || null;
      }
      
      const room = await storage.createRoom({
        code,
        cityId,
        cityName,
        createdBy,
        hostDeviceId: createdBy,
        hostUserId: userId,
        hostFirstName,
        totalChallenges,
        status: "waiting",
      });
      
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

  // IMPORTANT: These specific routes must come BEFORE the dynamic /api/rooms/:code route
  app.get("/api/rooms/by-device/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const rooms = await storage.getRoomsByDeviceId(deviceId);
      
      const roomsWithProgress = await Promise.all(
        rooms.map(async (room) => {
          // Count unique completed challenges from challenge_completions table
          const completions = await storage.getChallengeCompletionsByRoom(room.code);
          const uniqueChallengeIds = new Set(completions.map(c => c.challengeId));
          return {
            ...room,
            completedCount: uniqueChallengeIds.size,
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
          // Count unique completed challenges from challenge_completions table
          const completions = await storage.getChallengeCompletionsByRoom(room.code);
          const uniqueChallengeIds = new Set(completions.map(c => c.challengeId));
          return {
            ...room,
            completedCount: uniqueChallengeIds.size,
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

  app.post("/api/rooms/:code/start-hunt", async (req: any, res) => {
    try {
      const { code } = req.params;
      const { deviceId } = req.body;
      const userId = (req.session as any)?.user?.uid || null;
      
      const room = await storage.getRoom(code);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      if (room.status !== "waiting") {
        return res.status(400).json({ error: "Hunt already started" });
      }
      
      // Check if user is the host - check userId first (for cross-device sync), then deviceId
      const isHost = (userId && room.hostUserId === userId) || room.hostDeviceId === deviceId;
      if (!isHost) {
        return res.status(403).json({ error: "Only the host can start the hunt" });
      }
      
      const participantInterests = await storage.getParticipantInterests(code);
      
      const city = await storage.getCity(room.cityId);
      if (!city) {
        return res.status(404).json({ error: "City not found" });
      }
      
      const allChallenges = await storage.getCityChallenges(room.cityId);
      
      // Filter out challenges with placeholder images so they don't appear in hunts
      const availableChallenges = allChallenges.filter(c => 
        !c.imageUrl?.includes('placeholder.jpg')
      );
      
      const selectedChallengeIds = selectChallengesForGroup(availableChallenges, participantInterests, 15);
      
      const updatedRoom = await storage.startHunt(code, selectedChallengeIds);
      
      res.json(updatedRoom);
    } catch (error) {
      console.error("Error starting hunt:", error);
      res.status(500).json({ error: "Failed to start hunt" });
    }
  });

  // Get all challenge completions for a room (for real-time sync)
  app.get("/api/rooms/:code/completions", async (req, res) => {
    try {
      const { code } = req.params;
      const completions = await storage.getChallengeCompletionsByRoom(code);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching completions:", error);
      res.status(500).json({ error: "Failed to fetch completions" });
    }
  });

  // Get leaderboard for a room (aggregated completions by user)
  app.get("/api/rooms/:code/leaderboard", async (req, res) => {
    try {
      const { code } = req.params;
      const completions = await storage.getChallengeCompletionsByRoom(code);
      
      // Aggregate completions by user (using either userId or deviceId as identifier)
      const userMap = new Map<string, { id: string; name: string; tasksCompleted: number }>();
      
      for (const completion of completions) {
        // Use unique key: prefer visibleId (original deviceId) for unique user tracking
        // since the same person may complete multiple tasks
        const key = completion.completedByUserId || completion.completedByDeviceId;
        const name = completion.completedByName || "Anonymous";
        
        if (userMap.has(key)) {
          const user = userMap.get(key)!;
          user.tasksCompleted += 1;
          // Use latest name if available
          if (completion.completedByName) {
            user.name = completion.completedByName;
          }
        } else {
          userMap.set(key, {
            id: key,
            name: name,
            tasksCompleted: 1,
          });
        }
      }
      
      // Convert to array and sort by tasksCompleted descending
      const leaderboard = Array.from(userMap.values()).sort(
        (a, b) => b.tasksCompleted - a.tasksCompleted
      );
      
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Add a challenge completion
  app.post("/api/rooms/:code/challenges/:challengeId/complete", async (req: any, res) => {
    try {
      const { code, challengeId } = req.params;
      const { deviceId, userName } = req.body;
      const userId = (req.session as any)?.user?.uid || null;
      
      const room = await storage.getRoom(code);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      const completion = await storage.addChallengeCompletion({
        roomCode: code,
        challengeId: parseInt(challengeId),
        completedByDeviceId: deviceId,
        completedByUserId: userId,
        completedByName: userName || null,
      });
      
      res.json(completion);
    } catch (error) {
      console.error("Error adding completion:", error);
      res.status(500).json({ error: "Failed to add completion" });
    }
  });

  // Remove a challenge completion
  app.delete("/api/rooms/:code/challenges/:challengeId/complete", async (req: any, res) => {
    try {
      const { code, challengeId } = req.params;
      const { deviceId } = req.body;
      const userId = (req.session as any)?.user?.uid || null;
      
      await storage.removeChallengeCompletion(code, parseInt(challengeId), deviceId, userId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing completion:", error);
      res.status(500).json({ error: "Failed to remove completion" });
    }
  });

  // Swap incomplete challenges with new ones from the pool
  app.post("/api/rooms/:code/refresh-challenges", async (req: any, res) => {
    try {
      const { code } = req.params;
      const { challengeIdsToReplace } = req.body;
      
      if (!Array.isArray(challengeIdsToReplace) || challengeIdsToReplace.length === 0) {
        return res.status(400).json({ error: "challengeIdsToReplace must be a non-empty array" });
      }
      
      const room = await storage.getRoom(code);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      const cityId = room.cityId;
      const allChallenges = await storage.getCityChallenges(cityId);
      if (!allChallenges || allChallenges.length === 0) {
        return res.status(404).json({ error: "City challenges not found" });
      }
      
      const currentlySelectedSet = new Set(room.selectedChallengeIds || []);
      
      // Validate all requested IDs are actually in the room's selected challenges
      for (const id of challengeIdsToReplace) {
        if (!currentlySelectedSet.has(id)) {
          return res.status(400).json({ error: `Challenge ID ${id} is not in this room's selected challenges` });
        }
      }
      
      // Find available challenges (not currently in use, excluding ones being replaced, and no placeholders)
      const availableChallenges = allChallenges.filter(c => 
        !currentlySelectedSet.has(c.id) && !c.imageUrl?.includes('placeholder.jpg')
      );
      
      if (availableChallenges.length < challengeIdsToReplace.length) {
        return res.status(400).json({ error: "Not enough challenges available to swap" });
      }
      
      // Randomly select new challenges
      const shuffled = availableChallenges.sort(() => Math.random() - 0.5);
      const newChallengeIds = shuffled.slice(0, challengeIdsToReplace.length).map(c => c.id);
      
      if (newChallengeIds.length !== challengeIdsToReplace.length) {
        return res.status(400).json({ error: "Could not find enough replacement challenges" });
      }
      
      const updatedRoom = await storage.swapChallenges(code, challengeIdsToReplace, newChallengeIds);
      
      res.json({ 
        success: true, 
        swapped: challengeIdsToReplace.length,
        newChallengeIds,
        selectedChallengeIds: updatedRoom?.selectedChallengeIds 
      });
    } catch (error) {
      console.error("Error refreshing challenges:", error);
      res.status(500).json({ error: "Failed to refresh challenges" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
