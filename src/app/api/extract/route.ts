import { z } from "zod";
import { imageSignature } from "@/lib/images";
import { OpenAIExtractionProvider } from "@/lib/server/extraction";
export const runtime = "nodejs";
export const maxDuration = 30;
const maxBodyBytes = 3 * 1024 * 1024;
const requestSchema = z.object({
  image: z
    .string()
    .max(maxBodyBytes)
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/),
});
const error = (message: string, status: number) =>
  Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
export async function POST(request: Request) {
  if (process.env.OCR_ENABLED !== "true" || !process.env.OPENAI_API_KEY)
    return error(
      "AI extraction is not configured. Enter and review the figures manually; the complete comparison works without AI.",
      503,
    );
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return error("Extraction requires a same-origin browser request.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return error("Send JSON with an image.", 415);
  const reader = request.body?.getReader();
  if (!reader) return error("Image body missing.", 400);
  let total = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBodyBytes) {
        await reader.cancel();
        return error(
          "Compressed image request exceeds 3 MB. Use manual entry or a smaller source.",
          413,
        );
      }
      chunks.push(value);
    }
    const body = requestSchema.safeParse(
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
    if (!body.success)
      return error("Invalid image request. Use JPEG, PNG or WebP.", 400);
    const [prefix, base64] = body.data.image.split(",");
    const bytes = Buffer.from(base64, "base64");
    if (imageSignature(bytes) !== prefix.slice(5, prefix.indexOf(";")))
      return error("Image contents do not match its declared type.", 400);
    const provider = new OpenAIExtractionProvider(
      process.env.OPENAI_API_KEY,
      process.env.OPENAI_VISION_MODEL || "gpt-4.1-mini",
    );
    const result = await provider.extract(body.data.image);
    return Response.json(
      {
        ...result,
        provider: "OpenAI",
        model: process.env.OPENAI_VISION_MODEL || "gpt-4.1-mini",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return error(
      e instanceof SyntaxError
        ? "Malformed JSON request."
        : "Extraction failed, timed out or returned unreadable data. Continue with manual entry.",
      e instanceof SyntaxError ? 400 : 502,
    );
  }
}
