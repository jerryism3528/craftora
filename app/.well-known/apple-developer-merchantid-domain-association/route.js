import fs from 'fs/promises';
import path from 'path';
import { paypalMode } from '../../../lib/paypal';

export const dynamic = 'force-dynamic';

// Apple Pay domain verification file. PayPal has one file for sandbox and one for live.
export async function GET() {
  const file = path.join(process.cwd(), 'public', 'applepay', paypalMode() === 'live' ? 'live' : 'sandbox');
  try {
    const data = await fs.readFile(file);
    return new Response(data, { headers: { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'public, max-age=3600' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
