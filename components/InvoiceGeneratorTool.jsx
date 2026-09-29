'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

const emptyItem = { desc: '', qty: 1, price: 0 };

export default function InvoiceGeneratorTool() {
  const [inv, setInv] = useState({
    number: 'INV-001',
    date: new Date().toISOString().slice(0, 10),
    due: '',
    fromName: '', fromDetails: '',
    toName: '', toDetails: '',
    items: [{ ...emptyItem }],
    taxRate: 0,
    currency: '$',
    notes: '',
  });
  const [busy, setBusy] = useState(false);

  function set(k, v) { setInv((x) => ({ ...x, [k]: v })); }
  function setItem(i, k, v) { setInv((x) => ({ ...x, items: x.items.map((it, j) => j === i ? { ...it, [k]: v } : it) })); }
  function addItem() { setInv((x) => ({ ...x, items: [...x.items, { ...emptyItem }] })); }
  function removeItem(i) { setInv((x) => ({ ...x, items: x.items.filter((_, j) => j !== i) })); }

  const subtotal = inv.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const tax = subtotal * (Number(inv.taxRate) || 0) / 100;
  const total = subtotal + tax;
  const money = (n) => `${inv.currency}${n.toFixed(2)}`;

  async function generatePdf() {
    setBusy(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdf = await PDFDocument.create();
      const page = pdf.addPage([595, 842]); // A4
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const brand = rgb(0.204, 0.188, 0.659);
      const ink = rgb(0.13, 0.17, 0.35);
      const muted = rgb(0.45, 0.48, 0.56);
      let y = 800;

      const text = (t, x, yy, f = font, size = 10, color = ink) => page.drawText(String(t), { x, y: yy, size, font: f, color });

      // Header
      text('INVOICE', 40, y, bold, 26, brand);
      text(inv.number, 400, y + 6, bold, 12, ink);
      text(`Date: ${inv.date}`, 400, y - 10, font, 9, muted);
      if (inv.due) text(`Due: ${inv.due}`, 400, y - 22, font, 9, muted);
      y -= 60;

      // From / To
      text('FROM', 40, y, bold, 9, muted);
      text('BILL TO', 320, y, bold, 9, muted);
      y -= 16;
      text(inv.fromName || '', 40, y, bold, 11, ink);
      text(inv.toName || '', 320, y, bold, 11, ink);
      y -= 14;
      const wrapLines = (s) => String(s).split('\n').slice(0, 4);
      let fy = y, ty = y;
      wrapLines(inv.fromDetails).forEach((l) => { text(l, 40, fy, font, 9, muted); fy -= 12; });
      wrapLines(inv.toDetails).forEach((l) => { text(l, 320, ty, font, 9, muted); ty -= 12; });
      y = Math.min(fy, ty) - 20;

      // Table header
      page.drawRectangle({ x: 40, y: y - 4, width: 515, height: 22, color: rgb(0.95, 0.95, 0.98) });
      text('DESCRIPTION', 48, y + 4, bold, 9, ink);
      text('QTY', 360, y + 4, bold, 9, ink);
      text('PRICE', 410, y + 4, bold, 9, ink);
      text('AMOUNT', 490, y + 4, bold, 9, ink);
      y -= 26;

      // Items
      inv.items.forEach((it) => {
        const amt = (Number(it.qty) || 0) * (Number(it.price) || 0);
        text(it.desc || '', 48, y, font, 10, ink);
        text(String(it.qty), 360, y, font, 10, ink);
        text(money(Number(it.price) || 0), 410, y, font, 10, ink);
        text(money(amt), 490, y, font, 10, ink);
        y -= 20;
      });

      y -= 10;
      page.drawLine({ start: { x: 360, y }, end: { x: 555, y }, thickness: 0.5, color: muted });
      y -= 18;
      text('Subtotal', 410, y, font, 10, muted); text(money(subtotal), 490, y, font, 10, ink); y -= 16;
      if (Number(inv.taxRate) > 0) { text(`Tax (${inv.taxRate}%)`, 410, y, font, 10, muted); text(money(tax), 490, y, font, 10, ink); y -= 16; }
      text('TOTAL', 410, y, bold, 12, brand); text(money(total), 490, y, bold, 12, brand); y -= 30;

      if (inv.notes) {
        text('NOTES', 40, y, bold, 9, muted); y -= 14;
        wrapLines(inv.notes).forEach((l) => { text(l, 40, y, font, 9, muted); y -= 12; });
      }

      text('Generated with Craftora', 40, 30, font, 8, muted);

      const bytes = await pdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${inv.number || 'invoice'}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
  }

  const inputCls = 'w-full rounded-lg border surface px-3 py-2 text-sm bg-transparent';

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Invoice number</label>
          <input value={inv.number} onChange={(e) => set('number', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Date</label>
          <input type="date" value={inv.date} onChange={(e) => set('date', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Due date</label>
          <input type="date" value={inv.due} onChange={(e) => set('due', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>From (your business)</label>
          <input value={inv.fromName} onChange={(e) => set('fromName', e.target.value)} placeholder="Your business name" className={inputCls + ' mb-2'} style={{ color: 'var(--ink)' }} />
          <textarea value={inv.fromDetails} onChange={(e) => set('fromDetails', e.target.value)} rows={3} placeholder="Address, email, phone" className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Bill to (client)</label>
          <input value={inv.toName} onChange={(e) => set('toName', e.target.value)} placeholder="Client name" className={inputCls + ' mb-2'} style={{ color: 'var(--ink)' }} />
          <textarea value={inv.toDetails} onChange={(e) => set('toDetails', e.target.value)} rows={3} placeholder="Address, email" className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
      </div>

      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Items</label>
      <div className="space-y-2 mb-3">
        {inv.items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input value={it.desc} onChange={(e) => setItem(i, 'desc', e.target.value)} placeholder="Description" className="flex-1 rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
            <input type="number" value={it.qty} onChange={(e) => setItem(i, 'qty', e.target.value)} placeholder="Qty" className="w-20 rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
            <input type="number" value={it.price} onChange={(e) => setItem(i, 'price', e.target.value)} placeholder="Price" className="w-28 rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
            <button onClick={() => removeItem(i)} className="shrink-0 w-9 flex items-center justify-center" style={{ color: '#e5484d' }}><Lucide.Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={addItem} className="text-sm font-semibold brand-text inline-flex items-center gap-1 mb-6"><Lucide.Plus className="w-4 h-4" /> Add item</button>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Currency</label>
          <input value={inv.currency} onChange={(e) => set('currency', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Tax rate (%)</label>
          <input type="number" value={inv.taxRate} onChange={(e) => set('taxRate', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Notes (optional)</label>
        <textarea value={inv.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="Payment terms, thank you note..." className={inputCls} style={{ color: 'var(--ink)' }} />
      </div>

      <div className="border surface rounded-xl p-5 mt-6 flex items-center justify-between flex-wrap gap-4" style={{ background: 'var(--surface)' }}>
        <div className="text-sm">
          <p className="muted">Subtotal: <strong style={{ color: 'var(--ink)' }}>{money(subtotal)}</strong></p>
          {Number(inv.taxRate) > 0 && <p className="muted">Tax: <strong style={{ color: 'var(--ink)' }}>{money(tax)}</strong></p>}
          <p className="text-lg font-extrabold mt-1" style={{ color: 'var(--brand)' }}>Total: {money(total)}</p>
        </div>
        <button onClick={generatePdf} disabled={busy} className="rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
          {busy ? <><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Lucide.Download className="w-4 h-4" /> Download PDF</>}
        </button>
      </div>

      <p className="muted text-xs mt-6">Your invoice is generated in your browser as a PDF. Nothing is uploaded or stored.</p>
    </div>
  );
}
