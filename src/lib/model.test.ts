import { describe, expect, it } from "vitest";
import {
  compare,
  countSchema,
  documentErrors,
  emptyIdentity,
  identityIssues,
  normalizeParty,
  type DocumentRecord,
} from "./model";
import {
  imageSignature,
  MAX_IMAGE_BYTES,
  validateImageMetadata,
} from "./images";
const doc = (): DocumentRecord => ({
  kind: "EC60(E)",
  identity: {
    election: "Demo election",
    year: "2026",
    contest: "Chair",
    state: "State",
    lga: "LGA",
    ward: "01",
    unit: "001",
  },
  identityReviewed: true,
  reviewNote: "",
  confirmedAt: "2026-11-19T00:00:00Z",
  votes: [
    { party: "Party A", count: "120" },
    { party: "Party B", count: "85" },
  ],
  evidence: {
    name: "synthetic.png",
    original: "",
    preview: "",
    hash: "demo",
    bytes: 10,
    addedAt: "",
    provenance: "synthetic demo",
  },
});
describe("comparison trust boundaries", () => {
  it("matches reviewed figures with known matching identities", () =>
    expect(compare(doc(), doc()).status).toBe("Match"));
  it("reports the signed second-minus-first delta", () => {
    const b = doc();
    b.votes[1].count = "185";
    expect(compare(doc(), b)).toMatchObject({
      status: "Difference detected",
      rows: [{ delta: 0 }, { delta: 100 }],
    });
    expect(compare(b, doc()).rows[1].delta).toBe(-100);
  });
  it.each([
    "election",
    "year",
    "contest",
    "state",
    "lga",
    "ward",
    "unit",
  ] as const)("blocks mismatched %s", (key) => {
    const b = doc();
    b.identity[key] = "different";
    expect(compare(doc(), b).status).toBe(
      "Cannot compare—identity needs review",
    );
    expect(compare(doc(), b).rows.every((r) => r.delta === null)).toBe(true);
  });
  it("blocks unknown identity even when both are blank", () => {
    const a = doc();
    a.identity = emptyIdentity();
    expect(identityIssues(a, a).length).toBeGreaterThan(0);
  });
  it("requires explicit human identity review", () => {
    const b = doc();
    b.identityReviewed = false;
    expect(compare(doc(), b).status).toContain("identity needs review");
  });
  it("requires source confirmations", () => {
    const b = doc();
    b.confirmedAt = undefined;
    expect(compare(doc(), b).status).toBe("Insufficient evidence");
    expect(compare(doc(), b).rows[0].left).toBeNull();
  });
  it("requires attached source evidence", () => {
    const b = doc();
    b.evidence = undefined;
    expect(compare(doc(), b).status).toBe("Insufficient evidence");
  });
  it("does not convert unreadable counts to zero or hide incompleteness behind differences", () => {
    const b = doc();
    b.votes[0].count = "";
    b.votes[1].count = "185";
    expect(compare(doc(), b).status).toBe("Insufficient evidence");
    expect(compare(doc(), b).rows[0].right).toBeNull();
  });
  it("treats absent parties as incomplete", () => {
    const b = doc();
    b.votes.pop();
    expect(compare(doc(), b).status).toBe("Insufficient evidence");
  });
  it("rejects duplicate normalized parties", () => {
    const b = doc();
    b.votes[1].party = " party a ";
    expect(documentErrors(b).join()).toContain("Duplicate");
    expect(compare(doc(), b).status).toBe("Insufficient evidence");
  });
  it("only normalizes whitespace and letter case", () => {
    expect(normalizeParty(" Party   A ")).toBe("PARTY A");
    expect(normalizeParty("P.A.")).not.toBe(normalizeParty("PA"));
    const b = doc();
    b.votes[0].party = "PA";
    expect(compare(doc(), b).status).toBe("Insufficient evidence");
  });
});
describe("input validation", () => {
  it.each(["-1", "1.5", "NaN", "Infinity", "1e3", " 12", "9007199254740992"])(
    "rejects invalid count %s",
    (value) => expect(countSchema.safeParse(value).success).toBe(false),
  );
  it.each(["", "0", "100", "0005"])("accepts count %s", (value) =>
    expect(countSchema.safeParse(value).success).toBe(true),
  );
  it("rejects unsafe formats and oversized uploads", () => {
    expect(() => validateImageMetadata("image/svg+xml", 10)).toThrow();
    expect(() =>
      validateImageMetadata("image/png", MAX_IMAGE_BYTES + 1),
    ).toThrow();
    expect(() => validateImageMetadata("image/png", 0)).toThrow();
    expect(() => validateImageMetadata("image/png", 100)).not.toThrow();
  });
  it("checks actual magic bytes", () => {
    expect(
      imageSignature(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])),
    ).toBe("image/png");
    expect(imageSignature(new TextEncoder().encode("<svg/>"))).toBeUndefined();
  });
});
