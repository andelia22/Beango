import { getAllAnonymousData, clearAnonymousData } from "./anonymousStorage";
import { apiRequest } from "./queryClient";

export async function migrateAnonymousDataToAccount(): Promise<void> {
  const anonymousData = getAllAnonymousData();
  
  const interestsData = localStorage.getItem("userInterests");
  const interests = interestsData ? JSON.parse(interestsData) : null;
  
  if (anonymousData.beanGoCompletions.length === 0 && !interests) {
    console.log("No anonymous data to migrate");
    return;
  }

  try {
    if (interests && Array.isArray(interests) && interests.length > 0) {
      await apiRequest("PATCH", "/api/auth/user/interests", { interests });
      localStorage.removeItem("userInterests");
      console.log(`Migrated ${interests.length} interests to account`);
    }

    for (const completion of anonymousData.beanGoCompletions) {
      await apiRequest("POST", "/api/beango-completions", {
        cityId: completion.cityId,
        cityName: completion.cityName,
        cityImageUrl: completion.cityImageUrl,
        roomCode: completion.roomCode,
        participantCount: completion.participantCount,
        completedAt: completion.completedAt,
      });
    }

    if (anonymousData.beanGoCompletions.length > 0) {
      clearAnonymousData();
      console.log(`Migrated ${anonymousData.beanGoCompletions.length} anonymous completions to account`);
    }
  } catch (error) {
    console.error("Failed to migrate anonymous data:", error);
    throw error;
  }
}
