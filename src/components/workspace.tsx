"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DocumentEditor } from "./document-editor";
import { Report } from "./report";
import {
  identityKeys,
  labels,
  newComparison,
  type Comparison,
  type DocumentRecord,
} from "@/lib/model";
import { getComparison, saveComparison } from "@/lib/storage";
import { makeDemo } from "@/lib/demo";
export function Workspace({ id }: { id?: string }) {
  const [record, setRecord] = useState<Comparison>();
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState("Loading…");
  const [offline, setOffline] = useState(false);
  const current = useRef<Comparison | undefined>(undefined);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const initialized = useRef(false);
  function persist(next: Comparison) {
    current.current = next;
    setRecord(next);
    setSaveState("Saving on this device…");
    queue.current = queue.current
      .catch(() => {})
      .then(() => saveComparison(next))
      .then(() => {
        if (current.current === next) setSaveState("Saved on this device");
      })
      .catch(() => {
        setSaveState("NOT SAVED");
        setError(
          "Browser storage could not save this record. Free storage or download the evidence report before closing this page.",
        );
      });
  }
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    async function init() {
      try {
        const params = new URLSearchParams(window.location.search);
        const existingId = id || params.get("draft");
        let initial: Comparison | undefined;
        if (existingId) {
          initial = await getComparison(existingId);
          if (!initial)
            throw new Error(
              "This record is not available in this browser. Records are stored on the device that created them.",
            );
        } else {
          const mode = params.get("demo");
          initial = ["match", "difference", "identity", "missing"].includes(
            mode || "",
          )
            ? await makeDemo(
                mode as "match" | "difference" | "identity" | "missing",
              )
            : newComparison();
          window.history.replaceState(
            null,
            "",
            `/compare/new?draft=${initial.id}`,
          );
        }
        persist(initial);
      } catch (e) {
        setError((e as Error).message);
      }
    }
    void init();
    // Initialization deliberately runs once; subsequent edits use the ordered persistence queue.
  }, [id]);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  function mutate(
    action: string,
    update: (r: Comparison) => Comparison,
    detail?: string,
  ) {
    if (!current.current) return;
    const before = current.current;
    const next = update(structuredClone(before));
    const at = new Date().toISOString();
    next.updatedAt = at;
    const snapshot = (r: Comparison) =>
      r.documents.map((d) => ({
        ...d,
        evidence: d.evidence
          ? {
              name: d.evidence.name,
              hash: d.evidence.hash,
              provenance: d.evidence.provenance,
            }
          : undefined,
      }));
    next.audit.push({
      at,
      action,
      detail:
        detail ??
        JSON.stringify({ before: snapshot(before), after: snapshot(next) }),
    });
    persist(next);
  }
  function changeDocument(index: number, doc: DocumentRecord, action: string) {
    mutate(action, (r) => {
      r.documents[index] = doc;
      r.finished = false;
      return r;
    });
  }
  if (!record)
    return (
      <section className="page">
        <h1>{error ? "Record unavailable" : "Opening your workspace…"}</h1>
        <p role={error ? "alert" : "status"}>
          {error || "Preparing local storage."}
        </p>
        <Link href="/comparisons">View saved comparisons</Link>
      </section>
    );
  const stages = [
    "Election context",
    "Review EC60(E)",
    "Review EC8A",
    "Evidence report",
  ];
  return (
    <section className="page workspace">
      <div className="workspace-heading">
        <div>
          <div className="eyebrow">YOUR COMPARISON WORKSPACE</div>
          <h1>
            {record.stage === 3
              ? "The evidence, side by side."
              : "A clearer picture starts here."}
          </h1>
        </div>
        <div className="save-status" role="status">
          <span className="dot" />
          {saveState}
          {offline && <span> · Offline</span>}
        </div>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <ol className="progress">
        {stages.map((s, i) => (
          <li
            key={s}
            className={
              record.stage === i ? "active" : record.stage > i ? "done" : ""
            }
          >
            <span>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      {record.documents.some(
        (d) => d.evidence?.provenance === "synthetic demo",
      ) && (
        <p className="demo-banner">
          SYNTHETIC DEMO · Mock forms and fictional figures. Review and confirm
          both documents to compare.
        </p>
      )}
      {record.stage === 0 ? (
        <section className="context-card">
          <div>
            <div className="eyebrow">01 / IDENTIFY THE COMPARISON</div>
            <h2>Which election are you reviewing?</h2>
            <p>
              Start with the EC60(E) context. You will enter and check the EC8A
              identifiers separately against its own image.
            </p>
            <p className="caption">
              Use a specific contest and constituency. Unknown identifiers will
              prevent a positive comparison.
            </p>
          </div>
          <div>
            <div className="fields">
              {identityKeys.map((k) => (
                <label key={k}>
                  {labels[k]}
                  <input
                    value={record.documents[0].identity[k]}
                    maxLength={160}
                    inputMode={k === "year" ? "numeric" : undefined}
                    onChange={(e) =>
                      changeDocument(
                        0,
                        {
                          ...record.documents[0],
                          identity: {
                            ...record.documents[0].identity,
                            [k]: e.target.value,
                          },
                          identityReviewed: false,
                          confirmedAt: undefined,
                        },
                        `Context entered: ${labels[k]}`,
                      )
                    }
                  />
                </label>
              ))}
            </div>
            <button
              className="button"
              onClick={() =>
                mutate(
                  "Started source review",
                  (r) => ({ ...r, stage: 1 }),
                  "Proceed to EC60(E)",
                )
              }
            >
              Continue to source image →
            </button>
          </div>
        </section>
      ) : record.stage === 3 ? (
        <Report
          record={record}
          onEdit={(stage) =>
            mutate(
              "Reopened source review",
              (r) => ({ ...r, stage }),
              `Source stage ${stage}`,
            )
          }
        />
      ) : (
        <DocumentEditor
          key={record.stage}
          doc={record.documents[record.stage - 1]}
          onChange={(doc, action) =>
            changeDocument(record.stage - 1, doc, action)
          }
          onConfirm={() =>
            mutate("Human confirmed source", (r) => {
              r.documents[r.stage - 1].confirmedAt = new Date().toISOString();
              r.stage += 1;
              r.finished = r.stage === 3;
              return r;
            })
          }
        />
      )}
      <div className="workspace-bottom no-print">
        {record.stage > 0 && record.stage < 3 && (
          <button
            className="button ghost small"
            onClick={() =>
              mutate(
                "Navigated back",
                (r) => ({ ...r, stage: r.stage - 1 }),
                "Previous step",
              )
            }
          >
            ← Previous step
          </button>
        )}
        <p className="caption">
          Local storage only. Browser data clearing or device loss can remove
          records. Download important reports.
        </p>
      </div>
      {record.stage === 0 && (
        <div className="demo-options">
          <span className="eyebrow">PRACTICE WITH SYNTHETIC RECORDS</span>
          <div className="actions">
            {["match", "difference", "identity", "missing"].map((mode) => (
              <a
                className="button ghost small"
                key={mode}
                href={`/compare/new?demo=${mode}`}
              >
                {mode === "identity"
                  ? "Identity conflict"
                  : mode === "missing"
                    ? "Unreadable count"
                    : mode === "match"
                      ? "Matching figures"
                      : "+100 difference"}
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
