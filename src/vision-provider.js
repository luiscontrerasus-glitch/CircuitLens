import { MODEL, perceiveImage } from "./perception.js";
import {
  GEMINI_MODEL,
  GEMINI_FREE_MODELS,
  perceiveGeminiImage,
} from "./gemini-perception.js";

export function visionSettings(options = {}, env = process.env) {
  const provider = options.provider ?? env.VISION_PROVIDER ?? "gemini";
  if (!["gemini", "openai"].includes(provider))
    throw Error("VISION_PROVIDER must be gemini or openai.");
  const apiKey =
    options.apiKey ??
    (provider === "gemini" ? env.GEMINI_API_KEY : env.OPENAI_API_KEY);
  const model =
    options.model ??
    (provider === "gemini"
      ? env.GEMINI_VISION_MODEL || GEMINI_MODEL
      : env.OPENAI_VISION_MODEL || MODEL);
  const liveEnabled =
    options.liveVisionEnabled ?? env.LIVE_VISION_ENABLED === "true";
  const freeTierConfirmed =
    options.freeTierConfirmed ?? env.GEMINI_FREE_TIER_CONFIRMED === "true";
  const freeAllowed =
    provider !== "gemini" ||
    (freeTierConfirmed && GEMINI_FREE_MODELS.includes(model));
  const configured = liveEnabled && !!apiKey && freeAllowed;
  const providerLabel = provider === "gemini" ? "Google Gemini" : "OpenAI";
  const unavailableReason = !liveEnabled
    ? "Live AI photo recognition is disabled for this $0 launch. Configure a Gemini Free Tier key to enable it. All seven examples and manual circuit editing work without API credits."
    : !apiKey
      ? `${providerLabel} photo recognition is unavailable without a configured API key. Examples and manual review remain available.`
      : !freeAllowed
        ? "Gemini recognition is blocked until the project is confirmed Free Tier with billing disabled and the allowed model is selected. No request will be sent."
        : null;
  return {
    provider,
    providerLabel,
    apiKey,
    model,
    liveEnabled,
    freeTierConfirmed,
    configured,
    unavailableReason,
    perception:
      options.perception ??
      (provider === "gemini" ? perceiveGeminiImage : perceiveImage),
  };
}
