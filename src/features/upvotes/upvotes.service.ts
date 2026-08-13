import { eq, sql } from "drizzle-orm";
import { db } from "../../config/db";
import { tools, upvotes } from "../../db/schema";
import { ApiError } from "../../utils/apiError";

export async function upvoteTool(toolId: string, userId: string) {
  const [tool] = await db
    .select()
    .from(tools)
    .where(eq(tools.id, toolId))
    .limit(1);

  if (!tool) {
    throw new ApiError(404, "Tool not found");
  }

  try {
    const updatedTool = await db.transaction(async (tx) => {
      // Unique(user_id, tool_id) constraint on the upvotes table
      // is what actually stops double-upvoting — this insert will
      // throw if this user already upvoted this tool.
      await tx.insert(upvotes).values({ userId, toolId });

      const [updated] = await tx
        .update(tools)
        .set({ upvoteCount: sql`${tools.upvoteCount} + 1` })
        .where(eq(tools.id, toolId))
        .returning();

      return updated;
    });

    return updatedTool;
  } catch (err: any) {
    // Postgres unique_violation error code
    if (err?.code === "23505") {
      throw new ApiError(409, "You have already upvoted this tool");
    }
    throw err;
  }
}
