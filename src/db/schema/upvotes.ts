import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { tools } from "./tools";

export const upvotes = pgTable(
  "upvotes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    toolId: uuid("tool_id")
      .references(() => tools.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // Prevents the same user from upvoting the same tool twice
    userToolUnique: unique().on(table.userId, table.toolId),
  }),
);
