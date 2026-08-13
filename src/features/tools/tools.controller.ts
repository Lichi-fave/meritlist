import { Request, Response, NextFunction } from "express";
import {
  createTool,
  getRecentTools,
  getPopularTools,
  getRelatedTools,
} from "./tools.service";

export async function submitTool(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tool = await createTool(req.body, req.userId!);
    res.status(201).json({ tool });
  } catch (err) {
    next(err);
  }
}

export async function recentTools(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tools = await getRecentTools();
    res.status(200).json({ tools });
  } catch (err) {
    next(err);
  }
}

export async function popularTools(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tools = await getPopularTools();
    res.status(200).json({ tools });
  } catch (err) {
    next(err);
  }
}

export async function relatedTools(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { target, related } = await getRelatedTools(req.params.id);
    res
      .status(200)
      .json({ target: { id: target.id, name: target.name }, related });
  } catch (err) {
    next(err);
  }
}
