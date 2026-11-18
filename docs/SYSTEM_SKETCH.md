# System sketch and trust boundaries

This is a conceptual domain sketch, not a current legal interpretation. The supplied INEC 2022 reference could not be retrieved during this build.

```mermaid
flowchart TD
  subgraph Official[Official election process — outside ResultTrace]
    P[Polling-unit counting and recording] --> A[EC8A result sheet]
    P --> E[Public EC60 E result poster]
    A --> O[Official upload and collation processes]
  end
  E --> U[Person captures a public poster]
  A --> L[Person lawfully obtains corresponding image]
  U --> B
  L --> B
  subgraph Device[User browser — local trust boundary]
    B[Validate images and retain originals] --> H[SHA-256 byte fingerprints]
    B --> R[Human edits identity and party figures]
    R --> C[Explicit confirmation of each source]
    C --> I{Known matching identifiers?}
    I -->|No| X[Cannot compare — identity needs review]
    I -->|Yes| N{Complete confirmed numeric rows?}
    N -->|No| Q[Insufficient evidence]
    N -->|Yes| D[Deterministic party comparison]
    D --> M[Match or Difference detected]
    R --> DB[(IndexedDB drafts and audit)]
    M --> DB
    DB --> F[Local history and evidence report]
    F --> J[Download JSON or print PDF]
  end
  B -. Explicit consent and optional request .-> S
  subgraph Server[Optional server boundary]
    S[Size, origin and signature checks] --> V[OpenAI vision adapter with server-only key]
    V --> Z[Validate structured output]
  end
  Z -. Unconfirmed suggestions only .-> R
```

There is no ResultTrace connection to IReV or to official collation. Source authenticity is unverified. Human confirmation establishes a reviewed transcription, not a verified election result. Hashes show byte identity only. Local audit events can be modified outside the app. The optional provider receives a compressed image, not the local original; it is disabled by default.
