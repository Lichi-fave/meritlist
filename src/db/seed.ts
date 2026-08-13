import argon2 from "argon2";
import { db, pool } from "../config/db";
import { users, tools, upvotes } from "./schema";

async function seed() {
  console.log("Seeding database...");

  // 1. Demo user
  const passwordHash = await argon2.hash("password123");
  const [demoUser] = await db
    .insert(users)
    .values({
      name: "Demo User",
      email: "demo@meritlist.com",
      passwordHash,
    })
    .returning();

  // A second user so upvotes can come from someone other than the submitter
  const [voterUser] = await db
    .insert(users)
    .values({
      name: "Voter User",
      email: "voter@meritlist.com",
      passwordHash: await argon2.hash("password123"),
    })
    .returning();

  console.log(
    "Demo login -> email: demo@meritlist.com | password: password123",
  );

  // 2. Seed tools across multiple categories, with deliberately varied
  // upvote counts so popular/related results look meaningfully different.
  const seedTools = [
    // code-assistant cluster (high popularity tier)
    {
      name: "GitHub Copilot",
      description:
        "AI pair programmer that autocompletes code and generates functions from natural language comments.",
      category: "code-assistant",
      link: "https://github.com/features/copilot",
      upvoteCount: 42,
    },
    {
      name: "Cursor",
      description:
        "AI-first code editor designed for intelligent auto-completion, multi-file refactoring, and code generation.",
      category: "code-assistant",
      link: "https://www.cursor.com",
      upvoteCount: 28,
    },
    {
      name: "Claude Code",
      description:
        "Command-line AI coding agent capable of navigating complex codebases, running terminal tasks, and debugging.",
      category: "code-assistant",
      link: "https://www.anthropic.com/claude",
      upvoteCount: 9,
    },

    // image-generation cluster
    {
      name: "Midjourney",
      description:
        "Generative AI service producing highly detailed, photorealistic, and artistic visual media from text prompts.",
      category: "image-generation",
      link: "https://www.midjourney.com",
      upvoteCount: 5,
    },
    {
      name: "Flux",
      description:
        "Open-weight text-to-image model known for exceptional optical quality, natural lighting, and photorealism.",
      category: "image-generation",
      link: "https://blackforestlabs.ai",
      upvoteCount: 3,
    },
    {
      name: "Ideogram",
      description:
        "Generative image model specializing in accurate, stylish text and typography rendering within images.",
      category: "image-generation",
      link: "https://ideogram.ai",
      upvoteCount: 1,
    },

    // productivity cluster
    {
      name: "Notion AI",
      description:
        "Connected AI workspace assistant that drafts documents, summarizes notes, and automates workflow database tasks.",
      category: "productivity",
      link: "https://www.notion.so/product/ai",
      upvoteCount: 15,
    },
    {
      name: "Wispr Flow",
      description:
        "Context-aware voice-to-text writing tool that formats dictated spoken thoughts into polished text anywhere.",
      category: "productivity",
      link: "https://flow.wispr.ai",
      upvoteCount: 11,
    },

    // chatbot cluster
    {
      name: "ChatGPT",
      description:
        "Conversational AI model powered by OpenAI for versatile reasoning, coding, writing, and research assistance.",
      category: "chatbot",
      link: "https://chatgpt.com",
      upvoteCount: 7,
    },

    // data-analysis cluster
    {
      name: "Julius AI",
      description:
        "Data science assistant that interprets datasets, writes Python code, and creates charts from plain English instructions.",
      category: "data-analysis",
      link: "https://julius.ai",
      upvoteCount: 19,
    },

    // old + low upvotes (for testing time-decay algorithms)
    {
      name: "SMMRY",
      description:
        "An early web-based automatic text summarizer that reduces articles to key sentences using classical NLP algorithms.",
      category: "text-generation",
      link: "https://smmry.com",
      upvoteCount: 30,
      old: true,
    },
  ];

  const insertedTools = [];
  for (const t of seedTools) {
    const { old, ...values } = t as any;
    const [row] = await db
      .insert(tools)
      .values({
        ...values,
        submittedBy: demoUser.id,
        // backdate "old" tools so the time-decay formula visibly demotes them
        // despite a relatively high upvote count
        createdAt: old
          ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          : undefined,
      })
      .returning();
    insertedTools.push(row);
  }

  // 3. Seed a few real upvote rows (not just the counter) so the
  // unique-constraint / "already upvoted" behavior is demoable
  const toolsToUpvote = insertedTools.slice(0, 3);
  for (const tool of toolsToUpvote) {
    await db.insert(upvotes).values({ userId: voterUser.id, toolId: tool.id });
  }

  console.log(
    `Seeded ${insertedTools.length} tools across ${new Set(seedTools.map((t) => t.category)).size} categories.`,
  );
  console.log("Tool IDs for your Postman demo:");
  insertedTools.forEach((t) =>
    console.log(`  ${t.category.padEnd(18)} ${t.name.padEnd(20)} ${t.id}`),
  );

  await pool.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
