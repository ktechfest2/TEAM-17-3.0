import Link from "next/link";
import {
  ArrowUpRight,
  FileCheck2,
  Fingerprint,
  HardDrive,
  ScanLine,
} from "lucide-react";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">
            <span className="dot" /> INDEPENDENT ELECTION OBSERVATION
          </div>
          <h1>
            Two documents.
            <br />
            One clearer
            <br />
            <em>picture.</em>
          </h1>
          <p className="hero-copy">
            Put polling-unit result records side by side. Review the figures
            yourself. See exactly where they agree—and where they differ.
          </p>
          <div className="actions">
            <Link href="/compare/new" className="button">
              Start a comparison <ArrowUpRight size={19} />
            </Link>
            <Link href="/compare/new?demo=difference" className="text-link">
              Explore a synthetic demo <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="hero-meta">
            <span>
              <HardDrive size={16} /> Saved on your device
            </span>
            <span>
              <Fingerprint size={16} /> No account needed
            </span>
          </div>
        </div>
        <div
          className="hero-art"
          aria-label="Illustrative synthetic comparison"
        >
          <div className="art-top">
            <ScanLine size={18} />
            <span>THE EVIDENCE, TOGETHER</span>
            <span className="pill">SYNTHETIC DEMO</span>
          </div>
          <div className="mock-sheets">
            {["EC60(E)", "EC8A"].map((kind, i) => (
              <div className="mock-sheet" key={kind}>
                <div className="sheet-label">SOURCE 0{i + 1}</div>
                <h3>{kind}</h3>
                <p>Polling unit 001 · Demo election</p>
                <div className="mock-rule" />
                <div className="mock-row">
                  <span>Party A</span>
                  <b>120</b>
                </div>
                <div className="mock-row highlighted">
                  <span>Party B</span>
                  <b>{i ? "185" : "85"}</b>
                </div>
                <div className="mock-row">
                  <span>Party C</span>
                  <b>42</b>
                </div>
                <div className="sheet-foot">MOCK DOCUMENT · NOT OFFICIAL</div>
              </div>
            ))}
          </div>
          <div className="art-result">
            <div>
              <span className="eyebrow">A DIFFERENCE, MADE VISIBLE</span>
              <h3>
                Party B <span>85 → 185</span>
              </h3>
            </div>
            <strong>+100</strong>
          </div>
          <p className="art-note">
            A numeric difference is a starting point for review. It is not proof
            of wrongdoing.
          </p>
        </div>
      </section>
      <section className="principle">
        <span>CLARITY WITHOUT ASSUMPTIONS</span>
        <p>
          Human-reviewed figures. Transparent comparisons.
          <br />
          Evidence that stays in your hands.
        </p>
      </section>
      <section className="steps">
        <div className="section-intro">
          <div className="eyebrow">FROM SOURCE TO UNDERSTANDING</div>
          <h2>
            Careful by design.
            <br />
            Simple to use.
          </h2>
          <Link href="/about" className="text-link">
            How the comparison works ↗
          </Link>
        </div>
        {[
          {
            n: "01",
            t: "Bring the sources",
            d: "Add a publicly displayed EC60(E) poster and a corresponding EC8A image you lawfully obtained.",
          },
          {
            n: "02",
            t: "Review every figure",
            d: "Check each document’s identity and party counts. You confirm the numbers before anything is compared.",
          },
          {
            n: "03",
            t: "Keep a clear record",
            d: "See the signed differences, inspect both images and save a report with the review history.",
          },
        ].map((s) => (
          <article key={s.n}>
            <span className="step-number">{s.n}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </article>
        ))}
      </section>
      <aside className="notice home-notice">
        <FileCheck2 size={23} />
        <div>
          <strong>An observation aid. An independent perspective.</strong>
          <p>
            ResultTrace is not INEC, IReV or an official collation system. It
            does not authenticate documents, certify outcomes or determine
            fraud.
          </p>
        </div>
      </aside>
    </>
  );
}
