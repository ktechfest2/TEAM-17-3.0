"use client";
import { useState } from "react";
import { ImagePlus, RotateCw, Plus, Trash2 } from "lucide-react";
import {
  identityKeys,
  labels,
  type DocumentRecord,
  documentErrors,
} from "@/lib/model";
import { prepareImage } from "@/lib/images";
export function DocumentEditor({
  doc,
  onChange,
  onConfirm,
}: {
  doc: DocumentRecord;
  onChange: (doc: DocumentRecord, action: string) => void;
  onConfirm: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [consent, setConsent] = useState(false);
  const edit = (patch: Partial<DocumentRecord>, action: string) =>
    onChange({ ...doc, ...patch, confirmedAt: undefined }, action);
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      edit(
        { evidence: await prepareImage(file), identityReviewed: false },
        "Source image attached; confirmation cleared",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function extract() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: doc.evidence?.preview }),
        signal: AbortSignal.timeout(35000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "Extraction unavailable. Continue with manual entry.",
        );
      edit(
        {
          votes: data.rows.map(
            (r: {
              party: string;
              count: number | null;
              confidence: string;
            }) => ({
              party: r.party,
              count: r.count === null ? "" : String(r.count),
              warning:
                r.confidence !== "high"
                  ? "Low confidence or unreadable: check source carefully."
                  : "AI suggestion: check against source.",
            }),
          ),
        },
        `Extraction received (${data.provider}, ${data.model}); unconfirmed suggestions`,
      );
    } catch (e) {
      setError(`${(e as Error).message} Your existing entries are retained.`);
    } finally {
      setBusy(false);
    }
  }
  function confirm() {
    const errors = documentErrors(doc);
    if (errors.length) {
      setError(errors.join(" "));
      return;
    }
    if (!doc.identityReviewed) {
      setError(
        "Confirm you reviewed the identifiers, including any unknown fields.",
      );
      return;
    }
    setError("");
    onConfirm();
  }
  return (
    <fieldset className="editor-grid" disabled={busy} aria-busy={busy}>
      <section className="source-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">SOURCE EVIDENCE</span>
            <h2>
              {doc.kind === "EC60(E)"
                ? "Public result poster"
                : "Corresponding result sheet"}
            </h2>
          </div>
          <span className="pill">{doc.kind}</span>
        </div>
        <p className="muted">
          {doc.kind === "EC60(E)"
            ? "Use a photo of the publicly displayed EC60(E) poster."
            : "Upload an EC8A image you lawfully obtained. We do not retrieve it from IReV."}
        </p>
        {doc.evidence ? (
          <>
            <div className="image-stage">
              <img
                src={doc.evidence.preview}
                alt={`${doc.kind} source document for review`}
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            </div>
            <div className="source-tools">
              <button
                className="button ghost small"
                onClick={() => setRotation((r) => (r + 180) % 360)}
              >
                <RotateCw size={15} /> Rotate view 180°
              </button>
              <a
                className="text-link"
                href={doc.evidence.original}
                download={doc.evidence.name}
              >
                Download original ↗
              </a>
            </div>
            <p className="caption">
              {doc.evidence.provenance === "synthetic demo"
                ? "SYNTHETIC DEMO · NOT AN OFFICIAL RECORD"
                : "USER SUPPLIED · AUTHENTICITY NOT VERIFIED"}
              <br />
              {doc.evidence.name} · {(doc.evidence.bytes / 1024).toFixed(0)} KB
              <br />
              Preview is compressed. Rotation affects this view only.
            </p>
          </>
        ) : (
          <div className="upload-empty">
            <ImagePlus size={38} />
            <h3>Bring the evidence into view</h3>
            <p>Choose a photo below, or use your phone’s camera.</p>
          </div>
        )}
        <label className="file-label">
          {doc.evidence ? "Replace source image" : "Upload or capture image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            disabled={busy}
            onChange={(e) => {
              void upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        <p className="caption">
          JPEG, PNG or WebP · up to 8 MB · original retained locally
        </p>
        <details className="extraction">
          <summary>Optional AI extraction</summary>
          <p>
            When configured, a compressed image is sent to OpenAI. Suggestions
            may be wrong. No key is needed for manual entry.
          </p>
          <label className="check">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            I consent to sending this image for extraction.
          </label>
          <button
            className="button ghost"
            disabled={!doc.evidence || !consent || busy}
            onClick={extract}
          >
            {busy ? "Working…" : "Suggest party counts"}
          </button>
        </details>
      </section>
      <section className="review-panel">
        <div className="eyebrow">HUMAN REVIEW REQUIRED</div>
        <h2>Read. Check. Confirm.</h2>
        <p className="muted">
          Enter what this source actually shows. Leave unknown identifiers or
          unreadable counts blank.
        </p>
        <details open className="identity-fields">
          <summary>Document identity</summary>
          <div className="fields">
            {identityKeys.map((k) => (
              <label key={k}>
                {labels[k]}
                <input
                  value={doc.identity[k]}
                  maxLength={160}
                  inputMode={k === "year" ? "numeric" : undefined}
                  onChange={(e) =>
                    edit(
                      {
                        identity: { ...doc.identity, [k]: e.target.value },
                        identityReviewed: false,
                      },
                      `Identifier edited: ${labels[k]}`,
                    )
                  }
                />
              </label>
            ))}
          </div>
          <label>
            Identity review / correction note
            <textarea
              value={doc.reviewNote}
              maxLength={2000}
              placeholder="Explain corrections or why an identifier is unknown."
              onChange={(e) =>
                edit({ reviewNote: e.target.value }, "Review note edited")
              }
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={doc.identityReviewed}
              onChange={(e) =>
                edit(
                  { identityReviewed: e.target.checked },
                  "Identity review changed",
                )
              }
            />
            I checked these identifiers against this source. Unknown fields
            remain blank.
          </label>
        </details>
        <div className="votes-heading">
          <h3>Party vote figures</h3>
          <span className="caption">Blank ≠ zero</span>
        </div>
        <p className="caption">
          Include every party shown. Only case and whitespace are normalized;
          explicitly edit verified equivalent names to the same label.
        </p>
        <div className="vote-column-labels">
          <span>Party as reviewed</span>
          <span>Votes</span>
          <span />
        </div>
        {doc.votes.map((v, i) => (
          <div key={i} className="vote-group">
            <div className="vote-input-row">
              <input
                aria-label={`Party ${i + 1}`}
                value={v.party}
                maxLength={100}
                onChange={(e) =>
                  edit(
                    {
                      votes: doc.votes.map((row, j) =>
                        j === i ? { ...row, party: e.target.value } : row,
                      ),
                    },
                    `Party row ${i + 1} label edited`,
                  )
                }
              />
              <input
                aria-label={`Votes ${i + 1}`}
                inputMode="numeric"
                placeholder="Unknown"
                value={v.count}
                maxLength={16}
                onChange={(e) =>
                  edit(
                    {
                      votes: doc.votes.map((row, j) =>
                        j === i ? { ...row, count: e.target.value } : row,
                      ),
                    },
                    `Party row ${i + 1} count edited`,
                  )
                }
              />
              <button
                className="icon-button"
                aria-label={`Remove party ${i + 1}`}
                onClick={() =>
                  edit(
                    { votes: doc.votes.filter((_, j) => i !== j) },
                    `Party row ${i + 1} removed`,
                  )
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
            {v.warning && <p className="caption warning-text">{v.warning}</p>}
          </div>
        ))}
        <button
          className="button ghost small"
          disabled={doc.votes.length >= 100}
          onClick={() =>
            edit(
              { votes: [...doc.votes, { party: "", count: "" }] },
              "Party row added",
            )
          }
        >
          <Plus size={16} /> Add party
        </button>
        <div className="confirm-box">
          <p>
            Confirm that every visible party is included and the entered counts
            match your reading of the source. This does not authenticate the
            document.
          </p>
          <button className="button" disabled={busy} onClick={confirm}>
            Confirm {doc.kind} & continue →
          </button>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </section>
    </fieldset>
  );
}
