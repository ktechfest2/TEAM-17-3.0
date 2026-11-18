import { openDB } from 'idb';
import type { Comparison } from './model';
const db = () => openDB('resulttrace-local', 1, { upgrade(database) { database.createObjectStore('comparisons', { keyPath: 'id' }); } });
export async function saveComparison(value: Comparison) { return (await db()).put('comparisons', value); }
export async function getComparison(id: string): Promise<Comparison | undefined> { return (await db()).get('comparisons', id); }
export async function listComparisons(): Promise<Comparison[]> { return ((await db()).getAll('comparisons')).then(rows => rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))); }
export async function deleteComparison(id: string) { return (await db()).delete('comparisons', id); }
