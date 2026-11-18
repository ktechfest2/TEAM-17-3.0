export async function POST() { return Response.json({ error: 'AI extraction is not configured. Enter and review the figures manually; the complete comparison works without AI.' }, { status: 503 }); }
