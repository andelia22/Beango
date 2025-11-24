import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./firebaseAuth";
import { insertBeangoCompletionSchema } from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}
