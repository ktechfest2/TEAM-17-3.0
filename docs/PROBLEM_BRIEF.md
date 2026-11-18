# ResultTrace — problem brief

**Team:** TEAM-17-3.0 · **Hackathon:** Every Vote, Every Voice

## The problem

A person holding two polling-unit result documents needs to understand whether the party figures agree. Photos may be hard to read, identifiers may differ, and transcription mistakes can create misleading conclusions. A numeric difference alone cannot establish wrongdoing.

## Who this helps

Observers, journalists and citizens who lawfully hold a public EC60(E) poster image and a corresponding EC8A image. The product does not obtain restricted records, publish allegations, count votes or certify results.

## The intervention

ResultTrace places the sources alongside editable party rows. A human checks each document’s election, contest and polling-unit identity and confirms their reading of the numbers. A deterministic engine compares only confirmed counts. It blocks identity conflicts, preserves unknown values, and shows the second-minus-first delta with source images.

## Why it fits the context

The full manual journey needs no account, paid database or AI credential. IndexedDB keeps drafts on the device; an already-open session can save while offline. The interface fits a modest Android screen and uses compressed previews while retaining originals. Printable and JSON evidence reports support subsequent review.

## Demonstration

Clearly synthetic documents show Party B = 85 on EC60(E) and 185 on EC8A. After both are reviewed, ResultTrace shows **Difference detected: +100**. Separate cases demonstrate Match, blocked polling-unit mismatch and Insufficient evidence for an unreadable count.

## Success and limits

The intended demo is a reviewed comparison in under three minutes. Browser smoke tests exercise the core flow; this is not a measured user study. The tool does not authenticate images. Local storage can be lost, and audit records are not certified. Optional AI suggestions require confirmation and have not been tested with live credentials. Deployment currently requires resolution of a Vercel project-creation permission error.

**Difference detected does not establish fraud, manipulation, or legal validity.**
