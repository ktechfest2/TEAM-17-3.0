import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { OpenAIExtractionProvider } from "./extraction";
import { POST } from "../../app/api/extract/route";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
const provider = () =>
  new OpenAIExtractionProvider("test-placeholder", "gpt-4.1-mini");
function mockResponse(rows: unknown) {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({
          status: "completed",
          output: [
            {
              type: "message",
              content: [
                { type: "output_text", text: JSON.stringify({ rows }) },
              ],
            },
          ],
        }),
      ),
  );
}
describe("optional extraction boundary", () => {
  it("keeps unreadable counts null even if a provider supplies a number", async () => {
    mockResponse([{ party: "A", count: 30, confidence: "unreadable" }]);
    expect(
      (await provider().extract("data:image/png;base64,test")).rows[0].count,
    ).toBeNull();
  });
  it("rejects malformed and negative provider output", async () => {
    mockResponse([{ party: "A", count: -1, confidence: "high" }]);
    await expect(provider().extract("image")).rejects.toThrow();
  });
  it("handles refusal, failure and incomplete outputs without inventing values", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(Response.json({ status: "incomplete", output: [] })),
    );
    await expect(provider().extract("image")).rejects.toThrow();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 429 })),
    );
    await expect(provider().extract("image")).rejects.toThrow(
      "Provider unavailable",
    );
  });
  it("returns honest unavailable state without a key", async () => {
    vi.stubEnv("OCR_ENABLED", "false");
    const response = await POST(
      new Request("http://localhost/api/extract", { method: "POST" }),
    );
    expect(response.status).toBe(503);
  });
  it("rejects foreign origin, malformed JSON, forged images and oversized bodies", async () => {
    vi.stubEnv("OCR_ENABLED", "true");
    vi.stubEnv("OPENAI_API_KEY", "test-placeholder");
    const request = (body: string, origin = "http://localhost") =>
      new Request("http://localhost/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json", origin },
        body,
      });
    expect((await POST(request("{}", "https://foreign.example"))).status).toBe(
      403,
    );
    expect((await POST(request("{"))).status).toBe(400);
    expect(
      (
        await POST(
          request(JSON.stringify({ image: "data:image/png;base64,PHN2Zz4=" })),
        )
      ).status,
    ).toBe(400);
    expect((await POST(request("x".repeat(3 * 1024 * 1024 + 1)))).status).toBe(
      413,
    );
  });
});
