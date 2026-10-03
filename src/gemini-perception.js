import {
  normalizeObservations,
  observationSchema,
  PERCEPTION_PROMPT,
  PerceptionError,
} from "./perception.js";

// Image understanding, not image generation. Only this verified Free Tier
// model is allowed; never choose a paid model or fall back to another provider.
export const GEMINI_MODEL = "gemini-2.5-flash";

export async function perceiveGeminiImage(
  image,
  { apiKey, model = GEMINI_MODEL, fetchImpl = fetch, signal } = {},
) {
  if (!apiKey)
    throw new PerceptionError(
      "not_configured",
      "Configure a Gemini Free Tier key or use manual review.",
      503,
    );
  if (model !== GEMINI_MODEL)
    throw new PerceptionError(
      "model_not_allowed",
      "Only the configured Free Tier image-understanding model is allowed. No request was sent.",
      503,
    );
  const match =
    /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(
      image.dataUrl,
    );
  if (!match)
    throw new PerceptionError(
      "image_format",
      "Use a validated JPEG, PNG or WebP image.",
    );
  let response;
  try {
    response = await fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: PERCEPTION_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "Extract visible circuit observations from this image. No intended circuit has been provided.",
                },
                {
                  inlineData: { mimeType: `image/${match[1]}`, data: match[2] },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0,
            candidateCount: 1,
            maxOutputTokens: 6000,
            thinkingConfig: { thinkingBudget: 0 },
            responseMimeType: "application/json",
            responseJsonSchema: observationSchema,
          },
        }),
        signal: signal ?? AbortSignal.timeout(60000),
      },
    );
  } catch {
    throw new PerceptionError(
      "upstream_unavailable",
      "Gemini could not be reached within 60 seconds. Manual review remains available; no automatic retries.",
      502,
    );
  }
  if (!response.ok) {
    const code =
      response.status === 429
        ? "free_quota_exhausted"
        : [401, 403].includes(response.status)
          ? "key_rejected"
          : "model_error";
    throw new PerceptionError(
      code,
      response.status === 429
        ? "Gemini Free Tier quota or rate limit reached. Try manually later or use the examples. Do not enable billing; no paid fallback or automatic retry occurs."
        : code === "key_rejected"
          ? "Gemini rejected API access. Check the Free Tier key and project restrictions; manual review remains available."
          : "Gemini could not complete recognition. Try manually later or enter connections yourself. No paid fallback occurs.",
      response.status === 429 ? 429 : 502,
    );
  }
  let data;
  try {
    const text = await response.text();
    if (text.length > 262144) throw Error();
    data = JSON.parse(text);
  } catch {
    throw new PerceptionError(
      "invalid_response",
      "Gemini returned unreadable or oversized structured data.",
      502,
    );
  }
  const candidate = data?.candidates?.[0];
  if (
    data?.promptFeedback?.blockReason ||
    data?.candidates?.length !== 1 ||
    candidate?.finishReason !== "STOP"
  )
    throw new PerceptionError(
      "incomplete_response",
      "Gemini did not produce complete observations. Try a clearer image or review manually.",
      502,
    );
  const parts = candidate.content?.parts;
  if (
    !Array.isArray(parts) ||
    !parts.length ||
    parts.some(
      (p) =>
        !p ||
        typeof p.text !== "string" ||
        p.thought ||
        p.functionCall ||
        p.inlineData,
    )
  )
    throw new PerceptionError(
      "invalid_response",
      "Gemini returned an unexpected response. Manual review remains available.",
      502,
    );
  let raw;
  try {
    raw = JSON.parse(parts.map((p) => p.text).join(""));
  } catch {
    throw new PerceptionError(
      "invalid_response",
      "Gemini returned incomplete JSON observations.",
      502,
    );
  }
  const tokenCount = (value) =>
    Number.isInteger(value) && value >= 0 ? value : null;
  return {
    observations: normalizeObservations(raw),
    provenance: {
      mode: "live",
      provider: "Google Gemini",
      model: GEMINI_MODEL,
      generated_at: new Date().toISOString(),
      image_sha256: image.hash,
      width: image.width,
      height: image.height,
      usage: {
        input_tokens: tokenCount(data.usageMetadata?.promptTokenCount),
        output_tokens: tokenCount(data.usageMetadata?.candidatesTokenCount),
      },
    },
  };
}
