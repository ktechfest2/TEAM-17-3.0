import { z } from 'zod';

export const identityKeys = ['election', 'year', 'contest', 'state', 'lga', 'ward', 'unit'] as const;
export type Identity = Record<(typeof identityKeys)[number], string>;
export const labels: Record<keyof Identity, string> = { election: 'Election title', year: 'Election year', contest: 'Contest / constituency', state: 'State', lga: 'Local government area', ward: 'Ward', unit: 'Polling-unit number / name' };
export const emptyIdentity = (): Identity => ({ election: '', year: '', contest: '', state: '', lga: '', ward: '', unit: '' });
export type Vote = { party: string; count: string; warning?: string };
export type Evidence = { name: string; original: string; preview: string; hash: string; bytes: number; addedAt: string; provenance: 'user supplied' | 'synthetic demo' };
export type DocumentRecord = { kind: 'EC60(E)' | 'EC8A'; identity: Identity; votes: Vote[]; evidence?: Evidence; confirmedAt?: string; identityReviewed: boolean; reviewNote: string };
export type Audit = { at: string; action: string; detail: string };
export type Comparison = { version: 1; id: string; createdAt: string; updatedAt: string; documents: [DocumentRecord, DocumentRecord]; audit: Audit[]; stage: number; finished: boolean };
export const disclaimer = 'Difference detected does not establish fraud, manipulation, or legal validity.';
export function newComparison(): Comparison {
  const now = new Date().toISOString();
  return { version: 1, id: crypto.randomUUID(), createdAt: now, updatedAt: now, documents: ['EC60(E)', 'EC8A'].map(kind => ({ kind, identity: emptyIdentity(), votes: [{ party: '', count: '' }], identityReviewed: false, reviewNote: '' })) as Comparison['documents'], audit: [{ at: now, action: 'Created', detail: 'Local comparison created.' }], stage: 0, finished: false };
}
export const countSchema = z.string().refine(v => v === '' || (/^\d+$/.test(v) && Number.isSafeInteger(Number(v))), 'Use a non-negative whole number, or leave blank if unreadable.');
export function normalizeParty(label: string) { return label.trim().replace(/\s+/g, ' ').toUpperCase(); }
export function documentErrors(doc: DocumentRecord): string[] {
  const errors: string[] = [];
  const names = doc.votes.map(v => normalizeParty(v.party));
  if (doc.votes.length === 0) errors.push('Add at least one party.');
  if (names.some(n => !n)) errors.push('Enter a party label for every row.');
  if (new Set(names).size !== names.length) errors.push('Duplicate party labels: review the rows.');
  if (doc.votes.some(v => !countSchema.safeParse(v.count).success)) errors.push('Votes must be non-negative whole numbers; leave unreadable counts blank.');
  if (!doc.evidence) errors.push('Attach the source image.');
  return errors;
}
const identityValue = (v: string) => v.trim().replace(/\s+/g, ' ').toUpperCase();
export function identityIssues(a: DocumentRecord, b: DocumentRecord): string[] {
  const issues = identityKeys.filter(k => !identityValue(a.identity[k]) || !identityValue(b.identity[k]) || identityValue(a.identity[k]) !== identityValue(b.identity[k])).map(k => labels[k]);
  if (![a, b].every(d => /^\d{4}$/.test(d.identity.year.trim()))) issues.push('Valid four-digit year');
  if (![a, b].every(d => d.identityReviewed)) issues.push('Human identity review');
  return [...new Set(issues)];
}
export function compare(a: DocumentRecord, b: DocumentRecord) {
  const issues = identityIssues(a, b);
  const ready = [a, b].every(d => d.confirmedAt && documentErrors(d).length === 0);
  const first = new Map(a.votes.map(v => [normalizeParty(v.party), v.count]));
  const second = new Map(b.votes.map(v => [normalizeParty(v.party), v.count]));
  const rows = [...new Set([...first.keys(), ...second.keys()])].filter(Boolean).map(party => {
    const number = (v: string | undefined) => v !== undefined && v !== '' && countSchema.safeParse(v).success ? Number(v) : null;
    const left = ready && issues.length === 0 ? number(first.get(party)) : null;
    const right = ready && issues.length === 0 ? number(second.get(party)) : null;
    return { party, left, right, delta: left !== null && right !== null ? right - left : null };
  });
  const incomplete = !ready || rows.length === 0 || rows.some(r => r.delta === null);
  const status = issues.length ? 'Cannot compare—identity needs review' : incomplete ? 'Insufficient evidence' : rows.some(r => r.delta !== 0) ? 'Difference detected' : 'Match';
  return { status, issues, rows };
}
