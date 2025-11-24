import { getAllAnonymousData, clearAnonymousData } from "./anonymousStorage";
import { apiRequest } from "./queryClient";

export async function migrateAnonymousDataToAccount(): Promise<void> {
  const anonymousData = getAllAnonymousData();
  
  if (anonymousData.beanGoCompletions.length === 0) {
    console.log("No anonymous data to migrate");
    return;
  }

  try {
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

    clearAnonymousData();
    console.log(`Migrated ${anonymousData.beanGoCompletions.length} anonymous completions to account`);
  } catch (error) {
    console.error("Failed to migrate anonymous data:", error);
    throw error;
  }
}
