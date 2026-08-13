import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  popularityGravity: Number(process.env.POPULARITY_GRAVITY) || 1.5,
};

if (!config.jwtSecret) {
  throw new Error("JWT_SECRET is not set. Check your .env file.");
}
