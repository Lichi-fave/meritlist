import { eq, ne, and, desc, sql } from "drizzle-orm";
import { db } from "../../config/db";
import { tools } from "../../db/schema";
import { ApiError } from "../../utils/apiError";
import { config } from "../../config/env";
import { SubmitToolInput } from "./tools.validation";

export async function createTool(input: SubmitToolInput, submittedBy: string) {
  const [newTool] = await db
    .insert(tools)
    .values({
      name: input.name,
      description: input.description,
      category: input.category,
      link: input.link,
      submittedBy,
    })
    .returning();

  return newTool;
}

// No spam gate here — validation already happened at submission time (createTool),
// so anything in the table is guaranteed well-formed. Recent just sorts by time.
export async function getRecentTools() {
  return db.select().from(tools).orderBy(desc(tools.createdAt)).limit(20);
}

// Hacker-News-style time-decay ranking:
// score = upvotes / (hours_since_created + 2) ^ gravity
// The +2 avoids division blowing up for brand new tools (age ~0),
// and the exponent (gravity) controls how fast old tools fall off the list.
export async function getPopularTools() {
  const gravity = config.popularityGravity;

  const scoreExpr = sql<number>`
    ${tools.upvoteCount}::float /
    POWER(
      (EXTRACT(EPOCH FROM (NOW() - ${tools.createdAt})) / 3600.0) + 2,
      ${gravity}
    )
  `;

  return db
    .select({
      id: tools.id,
      name: tools.name,
      description: tools.description,
      category: tools.category,
      link: tools.link,
      upvoteCount: tools.upvoteCount,
      createdAt: tools.createdAt,
      submittedBy: tools.submittedBy,
      score: scoreExpr.as("score"),
    })
    .from(tools)
    .orderBy(desc(scoreExpr))
    .limit(20);
}

// Related = same category, excluding the tool itself, ranked by upvotes.
// Two tools in different categories (or with very different upvote tiers
// within the same category) will surface visibly different related lists.
export async function getRelatedTools(toolId: string) {
  const [target] = await db
    .select()
    .from(tools)
    .where(eq(tools.id, toolId))
    .limit(1);

  if (!target) {
    throw new ApiError(404, "Tool not found");
  }

  const related = await db
    .select()
    .from(tools)
    .where(and(eq(tools.category, target.category), ne(tools.id, target.id)))
    .orderBy(desc(tools.upvoteCount))
    .limit(5);

  return { target, related };
}
