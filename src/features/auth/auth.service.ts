import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { users } from "../../db/schema";
import { signToken } from "../../utils/jwt";
import { ApiError } from "../../utils/apiError";
import { RegisterInput, LoginInput } from "./auth.validation";

export async function registerUser(input: RegisterInput) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existing.length > 0) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await argon2.hash(input.password);

  const [newUser] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
    })
    .returning({ id: users.id, name: users.name, email: users.email });

  return newUser;
}

export async function loginUser(input: LoginInput) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await argon2.verify(
    user.passwordHash,
    input.password,
  );

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken({ userId: user.id });

  return { token, user: { id: user.id, name: user.name, email: user.email } };
}
