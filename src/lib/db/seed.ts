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

export function seed(db: DB) {
  // Seed settings (only missing keys — use onConflictDoNothing for concurrency safety)
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    db.insert(schema.settings)
      .values({ key, value })
      .onConflictDoNothing()
      .run();
  }

  // Seed categories if empty (onConflictDoNothing handles race conditions)
  for (let i = 0; i < defaultCategories.length; i++) {
    const cat = defaultCategories[i];
    db.insert(schema.categories)
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
