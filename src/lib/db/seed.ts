import { defaultCategories } from "../default-categories";
import * as schema from "./schema";
import type { DB } from "./index";

const DEFAULT_BLOCKED_LOCATIONS = [
  "us", "usa", "united states", "canada", "uk", "united kingdom",
  "europe", "eu", "germany", "france", "india", "israel",
  "australia", "japan", "china", "korea", "singapore", "brazil",
  "bellevue", "san francisco", "new york", "london", "berlin",
];

const DEFAULT_SETTINGS: Record<string, string> = {
  anthropic_api_key: "",
  ai_model: "claude-sonnet-4-6",
  ai_max_tokens: "500",
  cache_ttl_ms: "300000",
  blocked_locations: JSON.stringify(DEFAULT_BLOCKED_LOCATIONS),
};

export async function seed(db: DB) {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.insert(schema.settings)
      .values({ key, value })
      .onConflictDoNothing()
      .run();
  }

  for (let i = 0; i < defaultCategories.length; i++) {
    const cat = defaultCategories[i];
    await db.insert(schema.categories)
      .values({
        id: cat.id,
        label: cat.label,
        query: cat.query,
        proposalTemplate: cat.proposalTemplate,
        sortOrder: i,
      })
      .onConflictDoNothing()
      .run();
  }
}
