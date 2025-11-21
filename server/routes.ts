import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);

  return httpServer;
}
