'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';
import { listComparisons, deleteComparison } from '@/lib/storage';
import { compare, type Comparison } from '@/lib/model';
export default function History() {
  const [rows,setRows] = useState<Comparison[]>([]); const [loading,setLoading] = useState(true); const [error,setError] = useState('');
  useEffect(() => { listComparisons().then(setRows).catch(() => setError('Unable to open browser storage.')).finally(() => setLoading(false)); }, []);
  async function remove(id: string) { if (!window.confirm('Delete this comparison and its images from this device? This cannot be undone.')) return; try { await deleteComparison(id); setRows(rows.filter(r => r.id !== id)); } catch { setError('Could not delete this record.'); } }
  return <section className="page"><div className="workspace-heading"><div><div className="eyebrow">YOUR LOCAL RECORDS</div><h1>Saved comparisons.</h1><p className="muted">Drafts and reports stored in this browser. Nothing is cloud-synced.</p></div><Link className="button" href="/compare/new">New comparison ↗</Link></div>{error && <p role="alert" className="error">{error}</p>}{loading ? <p role="status">Loading local records…</p> : rows.length ? <div className="history-list">{rows.map(r => <article key={r.id}><div><span className="pill">{r.finished ? compare(...r.documents).status : 'Draft'}</span><h2><Link href={`/comparisons/${r.id}`}>{r.documents[0].identity.election || 'Untitled comparison'}</Link></h2><p>{r.documents[0].identity.unit || 'Polling unit not entered'} · {new Date(r.updatedAt).toLocaleString()}</p>{r.documents.some(d => d.evidence?.provenance === 'synthetic demo') && <span className="caption">SYNTHETIC DEMO</span>}</div><div className="actions"><Link className="button ghost small" href={`/comparisons/${r.id}`}>{r.finished ? 'Open report' : 'Continue draft'} →</Link><button className="text-button" onClick={() => remove(r.id)}>Delete</button></div></article>)}</div> : <div className="empty-state"><FolderOpen size={45}/><h2>Your evidence starts here.</h2><p>Start a comparison and it will be saved automatically on this device.</p><Link href="/compare/new" className="button">Create your first comparison ↗</Link></div>}</section>;
}
