import { Request, Response, NextFunction } from "express";
import { upvoteTool } from "./upvotes.service";

export async function upvote(req: Request, res: Response, next: NextFunction) {
  try {
    const tool = await upvoteTool(req.params.id, req.userId!);
    res.status(200).json({ tool });
  } catch (err) {
    next(err);
  }
}
