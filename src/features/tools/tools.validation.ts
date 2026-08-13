import { z } from "zod";
import { ALLOWED_CATEGORIES } from "./tools.constants";

export const submitToolSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters — this filters out low-effort spam submissions"),
  category: z.enum(ALLOWED_CATEGORIES, {
    message: `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
  }),
  link: z.string().url("Link must be a valid URL (e.g. https://example.com)"),
});

export const toolIdParamSchema = z.object({
  id: z.string().uuid("Tool id must be a valid UUID"),
});

export type SubmitToolInput = z.infer<typeof submitToolSchema>;
