import { Router } from "express";
import {
  submitTool,
  recentTools,
  popularTools,
  relatedTools,
} from "./tools.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { validateParams } from "../../middleware/validateParams.middleware";
import { submitToolSchema, toolIdParamSchema } from "./tools.validation";

const router = Router();

/**
 * @openapi
 * /tools:
 *   post:
 *     tags: [Tools]
 *     summary: Submit a new AI tool
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, category, link]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               link: { type: string }
 *           example:
 *             name: Midjourney
 *             description: Generative AI service producing highly detailed, photorealistic, and artistic visual media from text prompts.
 *             category: image-generation
 *             link: https://www.midjourney.com
 *     responses:
 *       201:
 *         description: Tool created
 *         content:
 *           application/json:
 *             example:
 *               tool:
 *                 id: 356de5a8-9e54-4a0b-a755-87e9adfe8f44
 *                 name: Midjourney
 *                 description: Generative AI service producing highly detailed, photorealistic, and artistic visual media from text prompts.
 *                 category: image-generation
 *                 link: https://www.midjourney.com
 *                 upvoteCount: 0
 *                 submittedBy: 9c4f3e2a-1234-4a5b-8c6d-abc123456789
 *                 createdAt: "2026-08-13T10:15:00.000Z"
 *       400:
 *         description: Validation failed — spam gate rejected the submission
 *         content:
 *           application/json:
 *             example:
 *               error: "description: Description must be at least 20 characters — this filters out low-effort spam submissions"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             example:
 *               error: Missing or malformed Authorization header
 */
router.post("/", requireAuth, validate(submitToolSchema), submitTool);

/**
 * @openapi
 * /tools/recent:
 *   get:
 *     tags: [Tools]
 *     summary: Get the most recently submitted tools
 *     responses:
 *       200:
 *         description: List of recent tools
 *         content:
 *           application/json:
 *             example:
 *               tools:
 *                 - id: 356de5a8-9e54-4a0b-a755-87e9adfe8f44
 *                   name: Midjourney
 *                   category: image-generation
 *                   upvoteCount: 0
 *                   createdAt: "2026-08-13T10:15:00.000Z"
 *                 - id: 798f2e03-ae1c-4f67-8058-0895f6ffd936
 *                   name: Cursor
 *                   category: code-assistant
 *                   upvoteCount: 28
 *                   createdAt: "2026-08-05T09:00:00.000Z"
 */
router.get("/recent", recentTools);

/**
 * @openapi
 * /tools/popular:
 *   get:
 *     tags: [Tools]
 *     summary: Get tools ranked by time-decay popularity score
 *     description: >
 *       score = upvote_count / (hours_since_created + 2) ^ gravity.
 *       Older tools fall in ranking over time even with high raw upvotes.
 *     responses:
 *       200:
 *         description: List of tools ranked by score
 *         content:
 *           application/json:
 *             example:
 *               tools:
 *                 - id: 75cd1e05-fd26-46e2-b91a-cace9bb1f734
 *                   name: GitHub Copilot
 *                   category: code-assistant
 *                   upvoteCount: 42
 *                   score: 6.81
 *                 - id: 5da1cfc5-7783-4751-af0a-1706f6f81fc7
 *                   name: SMMRY
 *                   category: text-generation
 *                   upvoteCount: 30
 *                   score: 0.14
 */
router.get("/popular", popularTools);

/**
 * @openapi
 * /tools/{id}/related:
 *   get:
 *     tags: [Tools]
 *     summary: Get tools related to a given tool (same category, ranked by upvotes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Related tools
 *         content:
 *           application/json:
 *             example:
 *               target:
 *                 id: 798f2e03-ae1c-4f67-8058-0895f6ffd936
 *                 name: Cursor
 *               related:
 *                 - id: 75cd1e05-fd26-46e2-b91a-cace9bb1f734
 *                   name: GitHub Copilot
 *                   category: code-assistant
 *                   upvoteCount: 42
 *                 - id: 70ed5196-fa2b-4dd4-a12e-c692638103ea
 *                   name: Claude Code
 *                   category: code-assistant
 *                   upvoteCount: 9
 *       404:
 *         description: Tool not found
 *         content:
 *           application/json:
 *             example:
 *               error: Tool not found
 */
router.get("/:id/related", validateParams(toolIdParamSchema), relatedTools);

export default router;
