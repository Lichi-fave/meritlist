import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Unhandled error
  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Internal server error" });
}
