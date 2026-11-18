import { newComparison, type Identity } from './model';
import { prepareImage } from './images';
export async function makeDemo(mode: 'match' | 'difference' | 'identity' | 'missing') {
  const record = newComparison();
  const identity: Identity = { election: 'Synthetic demonstration election', year: '2026', contest: 'Demo council chair', state: 'Demo State', lga: 'Demo LGA', ward: 'Demo Ward 01', unit: '001 — Demo community hall' };
  for (const [index, doc] of record.documents.entries()) {
    doc.identity = { ...identity, unit: mode === 'identity' && index === 1 ? '002 — Different demo unit' : identity.unit };
    doc.votes = [{ party: 'Party A', count: '120' }, { party: 'Party B', count: index === 1 && mode === 'difference' ? '185' : '85' }, { party: 'Party C', count: index === 1 && mode === 'missing' ? '' : '42' }];
    const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = 1100;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#fffdf8'; ctx.fillRect(0, 0, 1000, 1100);
    ctx.fillStyle = '#9b420d'; ctx.fillRect(0,0,1000,100); ctx.fillStyle = '#ffffff'; ctx.font = 'bold 32px sans-serif'; ctx.fillText('SYNTHETIC DEMO • NOT AN OFFICIAL RECORD', 35,62);
    ctx.fillStyle = '#242b3b'; ctx.font = 'bold 40px sans-serif'; ctx.fillText(`${doc.kind} — MOCK RESULT SHEET`, 45,170);
    ctx.font = '24px sans-serif'; Object.entries(doc.identity).forEach(([k,v], i) => ctx.fillText(`${k.toUpperCase()}: ${v}`,45,235+i*43));
    ctx.font = 'bold 28px sans-serif'; ctx.fillText('PARTY',50,610); ctx.fillText('VOTES',730,610);
    doc.votes.forEach((v,i) => { ctx.fillStyle = '#edeae3'; ctx.fillRect(40,640+i*90,920,75); ctx.fillStyle = '#242b3b'; ctx.fillText(v.party,60,690+i*90); ctx.fillText(v.count || 'UNREADABLE',730,690+i*90); });
    ctx.font = '22px sans-serif'; ctx.fillText('Created by ResultTrace for testing. No real election data.',45,1010);
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
    doc.evidence = await prepareImage(new File([blob], `synthetic-${mode}-${index+1}.png`, { type: 'image/png' }), 'synthetic demo');
  }
  record.audit.push({ at: new Date().toISOString(), action: 'Synthetic fixture loaded', detail: `${mode}; values are prefilled fixture data, not AI extraction. Human confirmation still required.` });
  record.stage = 1;
  return record;
}
