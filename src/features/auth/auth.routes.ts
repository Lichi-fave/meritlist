import { Router } from "express";
import { register, login } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { registerSchema, loginSchema } from "./auth.validation";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *           example:
 *             name: Oluchi Anakor
 *             email: oluchi@test.com
 *             password: testpass123
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             example:
 *               user:
 *                 id: 9c4f3e2a-1234-4a5b-8c6d-abc123456789
 *                 name: Oluchi Anakor
 *                 email: oluchi@test.com
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             example:
 *               error: An account with this email already exists
 */
router.post("/register", validate(registerSchema), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *           example:
 *             email: oluchi@test.com
 *             password: testpass123
 *     responses:
 *       200:
 *         description: Returns JWT token and user info
 *         content:
 *           application/json:
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               user:
 *                 id: 9c4f3e2a-1234-4a5b-8c6d-abc123456789
 *                 name: Oluchi Anakor
 *                 email: oluchi@test.com
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid email or password
 */
router.post("/login", validate(loginSchema), login);

export default router;
