import { disclaimer } from "@/lib/model";
export default function About() {
  return (
    <article className="page prose">
      <div className="eyebrow">METHODOLOGY & PRIVACY</div>
      <h1>
        Follow the evidence.
        <br />
        Respect its limits.
      </h1>
      <p className="lead">
        ResultTrace compares the figures people confirm. It makes no claim about
        the authenticity or legal standing of either source.
      </p>
      <h2>One election. One contest. One polling unit.</h2>
      <p>
        Each document has its own election title, year, contest or constituency,
        state, LGA, ward and polling-unit identifier. All fields must be known,
        reviewed and equal before a comparison can succeed. Only letter case and
        extra whitespace are normalized. Conflicts block comparison. Corrections
        are recorded in the local audit history.
      </p>
      <h2>Numbers you have reviewed</h2>
      <p>
        Non-negative whole numbers only. Blank means unknown, never zero. Party
        labels are compared using case and whitespace normalization only;
        abbreviations are never merged automatically. Edit a label explicitly if
        you have verified that both labels mean the same party. Missing parties
        or counts produce Insufficient evidence. The signed delta is EC8A minus
        EC60(E). A Match only describes the entered party rows; confirm you
        included every party visible in each source.
      </p>
      <h2>Your device is the record store</h2>
      <p>
        Drafts, original images, previews and audit events are stored in this
        browser’s IndexedDB. They are not cloud-synced or shared. Clearing
        browser data, private browsing, device loss or storage eviction can
        remove them. Download important reports. Saving a draft works offline
        while the app is open; a fresh offline page load is not supported. No
        service worker is installed.
      </p>
      <h2>Source handling and optional extraction</h2>
      <p>
        JPEG, PNG and WebP originals up to 8 MB are retained with SHA-256
        hashes. Previews are resized derivatives; hashes demonstrate byte
        identity, not authenticity. Original images are never silently rotated
        or cropped. Optional extraction, when configured by the operator, sends
        a compressed derivative to the configured AI provider only after you
        press the extraction button and consent. Manual review always remains
        necessary. No personal details or location are requested.
      </p>
      <h2>Independent of official systems</h2>
      <p>
        We do not scrape IReV or connect to an official results API. Upload only
        records you lawfully hold. Synthetic examples are mock forms, not
        official records. The historical source supplied for this project is{" "}
        <a href="https://wp1.inecnigeria.org/wp-content/uploads/2022/06/REGULATIONS-AND-GUIDELINES-FOR-THE-CONDUCT-OF-ELECTIONS-2022_updtd.pdf">
          INEC’s 2022 regulations and guidelines
        </a>
        ; it is not a claim about all current or future election rules.
      </p>
      <aside className="notice">
        <strong>{disclaimer}</strong>
      </aside>
      <h2>Build disclosure</h2>
      <p>
        Built for Every Vote, Every Voice by TEAM-17-3.0 with Codex AI coding
        assistance. The core comparison is deterministic TypeScript, not an AI
        judgment. This prototype’s audit history is local and editable through
        browser tools; it is not a certified chain of custody.
      </p>
    </article>
  );
}
