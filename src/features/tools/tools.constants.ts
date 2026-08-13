// Centralized category list — keeps categories consistent across
// submission validation and any future filtering/related-tools logic.
export const ALLOWED_CATEGORIES = [
  "text-generation",
  "image-generation",
  "code-assistant",
  "audio-speech",
  "video-generation",
  "productivity",
  "data-analysis",
  "chatbot",
  "design",
  "marketing",
  "other",
] as const;

export type ToolCategory = (typeof ALLOWED_CATEGORIES)[number];
