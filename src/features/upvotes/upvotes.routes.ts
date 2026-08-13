import { Router } from "express";
import { upvote } from "./upvotes.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateParams } from "../../middleware/validateParams.middleware";
import { toolIdParamSchema } from "../tools/tools.validation";

const router = Router();

/**
 * @openapi
 * /tools/{id}/upvote:
 *   post:
 *     tags: [Upvotes]
 *     summary: Upvote a tool
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Tool upvoted, returns updated tool
 *         content:
 *           application/json:
 *             example:
 *               tool:
 *                 id: 356de5a8-9e54-4a0b-a755-87e9adfe8f44
 *                 name: Midjourney
 *                 upvoteCount: 1
 *                 category: image-generation
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             example:
 *               error: Missing or malformed Authorization header
 *       404:
 *         description: Tool not found
 *         content:
 *           application/json:
 *             example:
 *               error: Tool not found
 *       409:
 *         description: Already upvoted by this user
 *         content:
 *           application/json:
 *             example:
 *               error: You have already upvoted this tool
 */
router.post(
  "/:id/upvote",
  requireAuth,
  validateParams(toolIdParamSchema),
  upvote,
);

export default router;
