import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { migrateAnonymousDataToAccount } from "@/lib/dataMigration";
import { getAllAnonymousData } from "@/lib/anonymousStorage";

export function DataMigrationHandler() {
  const { isAuthenticated } = useAuth();
  const [migrated, setMigrated] = useState(false);

  useEffect(() => {
    const performMigration = async () => {
      if (isAuthenticated && !migrated) {
        const anonymousData = getAllAnonymousData();
        
        if (anonymousData.beanGoCompletions.length > 0) {
          console.log("Migrating anonymous data to account...");
          try {
            await migrateAnonymousDataToAccount();
            setMigrated(true);
            console.log("Migration successful");
          } catch (error) {
            console.error("Migration failed:", error);
          }
        } else {
          setMigrated(true);
        }
      }
    };

    performMigration();
  }, [isAuthenticated, migrated]);

  return null;
}
