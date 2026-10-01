'use client';

import { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';

const emptyItem = { desc: '', qty: 1, price: 0 };
const CURRENCIES = [
  ['$', '$ USD'], ['EUR ', 'EUR'], ['GBP ', 'GBP'], ['Rs ', 'Rs (PKR)'],
  ['INR ', 'INR'], ['AED ', 'AED'], ['CAD $', 'CAD'], ['AUD $', 'AUD'],
];
const TERMS = [
  ['', 'Custom'], ['receipt', 'Due on receipt'], ['7', 'Net 7'],
  ['15', 'Net 15'], ['30', 'Net 30'], ['60', 'Net 60'],
];
const STATUSES = [['none', 'None'], ['paid', 'Paid'], ['unpaid', 'Unpaid'], ['overdue', 'Overdue']];
const STATUS_COLOR = { paid: [0.06, 0.6, 0.46], unpaid: [0.9, 0.28, 0.3], overdue: [0.78, 0.54, 0.08] };

const DEFAULT = {
  number: 'INV-001',
  date: new Date().toISOString().slice(0, 10),
  due: '',
  terms: '',
  status: 'none',
  brandType: 'name', // 'name' | 'logo'
  companyName: '',
  logo: '',
  accent: '#3430a8',
  fromDetails: '',
  toName: '', toDetails: '',
  items: [{ ...emptyItem }],
  currency: '$',
  discountType: 'none', // 'none' | 'flat' | 'percent'
  discountValue: 0,
  taxRate: 0,
  taxMode: 'add', // 'add' | 'deduct'
  amountPaid: 0,
  payment: '',
  notes: '',
  signature: '',
};

function hexToRgb01(hex) {
  const m = hex.replace('#', '');
  return [parseInt(m.slice(0, 2), 16) / 255, parseInt(m.slice(2, 4), 16) / 255, parseInt(m.slice(4, 6), 16) / 255];
}

export default function InvoiceGeneratorTool() {
  const [inv, setInv] = useState(DEFAULT);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoRef = useRef(null);
  const sigRef = useRef(null);

  // Load saved draft on mount.
  useEffect(() => {
    try {
      const d = localStorage.getItem('craftora-invoice');
      if (d) setInv({ ...DEFAULT, ...JSON.parse(d) });
    } catch (e) {}
  }, []);

  function set(k, v) { setInv((x) => ({ ...x, [k]: v })); }
  function setItem(i, k, v) { setInv((x) => ({ ...x, items: x.items.map((it, j) => j === i ? { ...it, [k]: v } : it) })); }
  function addItem() { setInv((x) => ({ ...x, items: [...x.items, { ...emptyItem }] })); }
  function removeItem(i) { setInv((x) => ({ ...x, items: x.items.filter((_, j) => j !== i) })); }
  function moveItem(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= inv.items.length) return;
    const copy = [...inv.items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    set('items', copy);
  }
  function dupItem(i) {
    const copy = [...inv.items];
    copy.splice(i + 1, 0, { ...inv.items[i] });
    set('items', copy);
  }

  // Payment terms auto-set due date.
  function setTerms(t) {
    let due = inv.due;
    if (t === 'receipt') due = inv.date;
    else if (t && !isNaN(Number(t))) {
      const d = new Date(inv.date);
      d.setDate(d.getDate() + Number(t));
      due = d.toISOString().slice(0, 10);
    }
    setInv((x) => ({ ...x, terms: t, due }));
  }

  function uploadFile(e, key, maxMB) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxMB * 1024 * 1024) { alert(`Image must be under ${maxMB} MB.`); return; }
    const reader = new FileReader();
    reader.onload = () => set(key, reader.result);
    reader.readAsDataURL(file);
  }

  function saveDraft() {
    try {
      localStorage.setItem('craftora-invoice', JSON.stringify(inv));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {}
  }
  function clearDraft() {
    try { localStorage.removeItem('craftora-invoice'); } catch (e) {}
    setInv(DEFAULT);
  }

  // Money math.
  const subtotal = inv.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  let discount = 0;
  if (inv.discountType === 'flat') discount = Number(inv.discountValue) || 0;
  else if (inv.discountType === 'percent') discount = subtotal * (Number(inv.discountValue) || 0) / 100;
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * (Number(inv.taxRate) || 0) / 100;
  const total = inv.taxMode === 'deduct' ? afterDiscount - tax : afterDiscount + tax;
  const paid = Number(inv.amountPaid) || 0;
  const balance = total - paid;
  const money = (n) => `${inv.currency}${(n || 0).toFixed(2)}`;

  async function generatePdf() {
    setBusy(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdf = await PDFDocument.create();
      const page = pdf.addPage([595, 842]);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const [ar, ag, ab] = hexToRgb01(inv.accent);
      const accent = rgb(ar, ag, ab);
      const ink = rgb(0.13, 0.17, 0.35);
      const muted = rgb(0.45, 0.48, 0.56);
      const W = 595;
      let y = 812;

      const text = (t, x, yy, f = font, size = 10, color = ink) => page.drawText(String(t == null ? '' : t), { x, y: yy, size, font: f, color });

      // Accent top bar
      page.drawRectangle({ x: 0, y: 832, width: W, height: 10, color: accent });

      // Logo or company name
      if (inv.brandType === 'logo' && inv.logo) {
        try {
          const isPng = inv.logo.includes('image/png');
          const imgBytes = await fetch(inv.logo).then((r) => r.arrayBuffer());
          const img = isPng ? await pdf.embedPng(imgBytes) : await pdf.embedJpg(imgBytes);
          const dims = img.scale(1);
          const maxW = 160, maxH = 60;
          const ratio = Math.min(maxW / dims.width, maxH / dims.height);
          page.drawImage(img, { x: 40, y: y - 60, width: dims.width * ratio, height: dims.height * ratio });
        } catch (e) {}
      } else if (inv.companyName) {
        text(inv.companyName, 40, y - 20, bold, 20, accent);
      }
      text('INVOICE', 40, y - 50, bold, 12, muted);

      // Invoice meta (right)
      text(inv.number, 400, y - 6, bold, 14, ink);
      text(`Date: ${inv.date}`, 400, y - 24, font, 9, muted);

      // Status stamp
      if (inv.status !== 'none' && STATUS_COLOR[inv.status]) {
        const [sr, sg, sb] = STATUS_COLOR[inv.status];
        const sc = rgb(sr, sg, sb);
        const label = inv.status.toUpperCase();
        const tw = bold.widthOfTextAtSize(label, 11);
        page.drawRectangle({ x: 555 - tw - 16, y: y - 46, width: tw + 16, height: 20, borderColor: sc, borderWidth: 1.5, color: rgb(1, 1, 1) });
        text(label, 555 - tw - 8, y - 40, bold, 11, sc);
      }

      y -= 90;

      // From / Bill to
      text('FROM', 40, y, bold, 9, muted);
      text('BILL TO', 320, y, bold, 9, muted);
      y -= 15;
      if (inv.companyName && inv.brandType === 'name') { text(inv.companyName, 40, y, bold, 11, ink); }
      text(inv.toName || '', 320, y, bold, 11, ink);
      y -= 13;
      const wrap = (s) => String(s || '').split('\n').slice(0, 5);
      let fy = y, ty = y;
      wrap(inv.fromDetails).forEach((l) => { text(l, 40, fy, font, 9, muted); fy -= 12; });
      wrap(inv.toDetails).forEach((l) => { text(l, 320, ty, font, 9, muted); ty -= 12; });
      y = Math.min(fy, ty) - 15;

      // Table header
      page.drawRectangle({ x: 40, y: y - 4, width: 515, height: 22, color: accent });
      text('DESCRIPTION', 48, y + 4, bold, 9, rgb(1, 1, 1));
      text('QTY', 350, y + 4, bold, 9, rgb(1, 1, 1));
      text('PRICE', 410, y + 4, bold, 9, rgb(1, 1, 1));
      text('AMOUNT', 490, y + 4, bold, 9, rgb(1, 1, 1));
      y -= 26;

      inv.items.forEach((it) => {
        const amt = (Number(it.qty) || 0) * (Number(it.price) || 0);
        text(it.desc || '', 48, y, font, 10, ink);
        text(String(it.qty), 350, y, font, 10, ink);
        text(money(Number(it.price) || 0), 410, y, font, 10, ink);
        text(money(amt), 490, y, font, 10, ink);
        y -= 20;
      });

      y -= 8;
      page.drawLine({ start: { x: 350, y }, end: { x: 555, y }, thickness: 0.5, color: muted });
      y -= 16;
      text('Subtotal', 410, y, font, 10, muted); text(money(subtotal), 490, y, font, 10, ink); y -= 15;
      if (discount > 0) { text('Discount', 410, y, font, 10, muted); text(`-${money(discount)}`, 490, y, font, 10, ink); y -= 15; }
      if (Number(inv.taxRate) > 0) { text(`Tax (${inv.taxRate}%)${inv.taxMode === 'deduct' ? ' deducted' : ''}`, 410, y, font, 10, muted); text(`${inv.taxMode === 'deduct' ? '-' : ''}${money(tax)}`, 490, y, font, 10, ink); y -= 15; }
      text('TOTAL', 410, y, bold, 12, accent); text(money(total), 490, y, bold, 12, accent); y -= 16;
      if (paid > 0) {
        text('Paid', 410, y, font, 10, muted); text(`-${money(paid)}`, 490, y, font, 10, ink); y -= 15;
        text('Balance due', 410, y, bold, 11, ink); text(money(balance), 490, y, bold, 11, ink); y -= 16;
      }

      y -= 15;
      // Payment details
      if (inv.payment) {
        text('PAYMENT DETAILS', 40, y, bold, 9, muted); y -= 14;
        wrap(inv.payment).forEach((l) => { text(l, 40, y, font, 9, ink); y -= 12; });
        y -= 8;
      }
      if (inv.due) { text(`Due date: ${inv.due}`, 40, y, bold, 10, ink); y -= 18; }
      if (inv.notes) {
        text('NOTES', 40, y, bold, 9, muted); y -= 14;
        wrap(inv.notes).forEach((l) => { text(l, 40, y, font, 9, muted); y -= 12; });
      }

      // Signature (bottom right)
      if (inv.signature) {
        try {
          const isPng = inv.signature.includes('image/png');
          const sigBytes = await fetch(inv.signature).then((r) => r.arrayBuffer());
          const sig = isPng ? await pdf.embedPng(sigBytes) : await pdf.embedJpg(sigBytes);
          const dims = sig.scale(1);
          const ratio = Math.min(120 / dims.width, 50 / dims.height);
          page.drawImage(sig, { x: 400, y: 95, width: dims.width * ratio, height: dims.height * ratio });
        } catch (e) {}
      }
      page.drawLine({ start: { x: 400, y: 90 }, end: { x: 555, y: 90 }, thickness: 0.5, color: muted });
      text('Signature', 400, 78, font, 8, muted);

      text('Generated with Craftora', 40, 30, font, 8, muted);

      const bytes = await pdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${inv.number || 'invoice'}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
    setBusy(false);
  }

  const inputCls = 'w-full rounded-lg border surface px-3 py-2 text-sm bg-transparent';
  const lbl = 'block text-sm font-semibold mb-1.5';

  return (
    <div>
      {/* Draft controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={saveDraft} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
          {saved ? <><Lucide.Check className="w-4 h-4" /> Saved</> : <><Lucide.Save className="w-4 h-4" /> Save draft</>}
        </button>
        <button onClick={clearDraft} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
          <Lucide.RotateCcw className="w-4 h-4" /> Reset
        </button>
        <span className="muted text-xs self-center">Your draft saves in this browser so you can reuse your details.</span>
      </div>

      {/* Branding */}
      <div className="border surface rounded-xl p-5 mb-6" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Show as:</span>
          <div className="flex gap-2">
            <button onClick={() => set('brandType', 'name')} className="rounded-lg px-4 py-1.5 text-sm font-semibold border surface" style={inv.brandType === 'name' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>Company name</button>
            <button onClick={() => set('brandType', 'logo')} className="rounded-lg px-4 py-1.5 text-sm font-semibold border surface" style={inv.brandType === 'logo' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>Logo</button>
          </div>
        </div>
        {inv.brandType === 'name' ? (
          <input value={inv.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="Your company name" className={inputCls} style={{ color: 'var(--ink)' }} />
        ) : (
          <div>
            {inv.logo ? (
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={inv.logo} alt="Logo" className="h-16 rounded border surface" style={{ background: '#fff', padding: 4 }} />
                <button onClick={() => set('logo', '')} className="text-sm font-semibold" style={{ color: '#e5484d' }}>Remove logo</button>
              </div>
            ) : (
              <label className="rounded-lg px-4 py-2.5 text-sm font-semibold border surface inline-flex items-center gap-2 cursor-pointer" style={{ color: 'var(--ink)' }}>
                <Lucide.Upload className="w-4 h-4" /> Upload logo
                <input ref={logoRef} type="file" accept="image/*" onChange={(e) => uploadFile(e, 'logo', 2)} className="hidden" />
              </label>
            )}
            <p className="muted text-xs mt-2">Use a transparent PNG for best results. Max 2 MB.</p>
          </div>
        )}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Accent color</span>
          <input type="color" value={inv.accent} onChange={(e) => set('accent', e.target.value)} className="w-10 h-9 rounded-lg border surface cursor-pointer bg-transparent" />
          <span className="muted text-xs">Themes the header bar, table, and total.</span>
        </div>
      </div>

      {/* Meta */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div><label className={lbl} style={{ color: 'var(--ink)' }}>Invoice number</label><input value={inv.number} onChange={(e) => set('number', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} /></div>
        <div><label className={lbl} style={{ color: 'var(--ink)' }}>Date</label><input type="date" value={inv.date} onChange={(e) => set('date', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} /></div>
        <div><label className={lbl} style={{ color: 'var(--ink)' }}>Status</label>
          <select value={inv.status} onChange={(e) => set('status', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }}>
            {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* From / To */}
      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className={lbl} style={{ color: 'var(--ink)' }}>From (your details)</label>
          <textarea value={inv.fromDetails} onChange={(e) => set('fromDetails', e.target.value)} rows={3} placeholder="Address, email, phone" className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className={lbl} style={{ color: 'var(--ink)' }}>Bill to (client)</label>
          <input value={inv.toName} onChange={(e) => set('toName', e.target.value)} placeholder="Client name" className={inputCls + ' mb-2'} style={{ color: 'var(--ink)' }} />
          <textarea value={inv.toDetails} onChange={(e) => set('toDetails', e.target.value)} rows={2} placeholder="Address, email" className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
      </div>

      {/* Items */}
      <label className={lbl} style={{ color: 'var(--ink)' }}>Items</label>
      <div className="space-y-2 mb-3">
        <div className="hidden sm:flex gap-2 px-1 text-xs font-bold uppercase tracking-wide muted">
          <span className="flex-1">Description</span>
          <span className="w-20 text-center">Qty</span>
          <span className="w-28 text-center">Amount</span>
          <span className="w-24"></span>
        </div>
        {inv.items.map((it, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={it.desc} onChange={(e) => setItem(i, 'desc', e.target.value)} placeholder="Item or service description" className="flex-1 rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
            <input type="number" value={it.qty} onChange={(e) => setItem(i, 'qty', e.target.value)} placeholder="Qty" className="w-20 rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
            <input type="number" value={it.price} onChange={(e) => setItem(i, 'price', e.target.value)} placeholder="Add amount" className="w-28 rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
            <div className="flex gap-0.5 w-24 shrink-0">
              <button onClick={() => moveItem(i, -1)} className="w-6 h-8 flex items-center justify-center muted" title="Move up"><Lucide.ChevronUp className="w-4 h-4" /></button>
              <button onClick={() => moveItem(i, 1)} className="w-6 h-8 flex items-center justify-center muted" title="Move down"><Lucide.ChevronDown className="w-4 h-4" /></button>
              <button onClick={() => dupItem(i)} className="w-6 h-8 flex items-center justify-center muted" title="Duplicate"><Lucide.Copy className="w-4 h-4" /></button>
              <button onClick={() => removeItem(i)} className="w-6 h-8 flex items-center justify-center" style={{ color: '#e5484d' }} title="Delete"><Lucide.Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addItem} className="rounded-lg px-4 py-2 text-sm font-bold inline-flex items-center gap-2 mb-6" style={{ background: 'var(--surface-soft)', color: 'var(--brand)' }}><Lucide.Plus className="w-4 h-4" /> Add item</button>

      {/* Money settings */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div><label className={lbl} style={{ color: 'var(--ink)' }}>Currency</label>
          <select value={inv.currency} onChange={(e) => set('currency', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }}>
            {CURRENCIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div><label className={lbl} style={{ color: 'var(--ink)' }}>Discount</label>
          <div className="flex gap-2">
            <select value={inv.discountType} onChange={(e) => set('discountType', e.target.value)} className="rounded-lg border surface px-2 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }}>
              <option value="none">None</option><option value="flat">Flat</option><option value="percent">%</option>
            </select>
            {inv.discountType !== 'none' && <input type="number" value={inv.discountValue} onChange={(e) => set('discountValue', e.target.value)} className="w-full rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />}
          </div>
        </div>
        <div><label className={lbl} style={{ color: 'var(--ink)' }}>Tax rate (%)</label>
          <div className="flex gap-2">
            <input type="number" value={inv.taxRate} onChange={(e) => set('taxRate', e.target.value)} className="w-full rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer mt-2" style={{ color: 'var(--ink)' }}>
            <input type="checkbox" checked={inv.taxMode === 'deduct'} onChange={(e) => set('taxMode', e.target.checked ? 'deduct' : 'add')} /> Deduct tax instead of add
          </label>
        </div>
        <div><label className={lbl} style={{ color: 'var(--ink)' }}>Amount paid</label>
          <input type="number" value={inv.amountPaid} onChange={(e) => set('amountPaid', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
      </div>

      {/* Terms + due */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div><label className={lbl} style={{ color: 'var(--ink)' }}>Payment terms</label>
          <select value={inv.terms} onChange={(e) => setTerms(e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }}>
            {TERMS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div><label className={lbl} style={{ color: 'var(--ink)' }}>Due date</label>
          <input type="date" value={inv.due} onChange={(e) => set('due', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
      </div>

      {/* Payment details + notes */}
      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div><label className={lbl} style={{ color: 'var(--ink)' }}>Payment details</label>
          <textarea value={inv.payment} onChange={(e) => set('payment', e.target.value)} rows={3} placeholder={"Bank: ...\nIBAN / Account: ...\nOr pay via PayPal / Wise: ..."} className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
        <div><label className={lbl} style={{ color: 'var(--ink)' }}>Notes</label>
          <textarea value={inv.notes} onChange={(e) => set('notes', e.target.value)} rows={3} placeholder="Thank you for your business..." className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
      </div>

      {/* Signature */}
      <div className="mb-6">
        <label className={lbl} style={{ color: 'var(--ink)' }}>Signature (optional)</label>
        {inv.signature ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={inv.signature} alt="Signature" className="h-14 rounded border surface" style={{ background: '#fff', padding: 4 }} />
            <button onClick={() => set('signature', '')} className="text-sm font-semibold" style={{ color: '#e5484d' }}>Remove</button>
          </div>
        ) : (
          <label className="rounded-lg px-4 py-2.5 text-sm font-semibold border surface inline-flex items-center gap-2 cursor-pointer" style={{ color: 'var(--ink)' }}>
            <Lucide.Upload className="w-4 h-4" /> Upload signature image
            <input ref={sigRef} type="file" accept="image/*" onChange={(e) => uploadFile(e, 'signature', 2)} className="hidden" />
          </label>
        )}
      </div>

      {/* Totals + download */}
      <div className="border surface rounded-xl p-5 flex items-center justify-between flex-wrap gap-4" style={{ background: 'var(--surface)' }}>
        <div className="text-sm">
          <p className="muted">Subtotal: <strong style={{ color: 'var(--ink)' }}>{money(subtotal)}</strong></p>
          {discount > 0 && <p className="muted">Discount: <strong style={{ color: 'var(--ink)' }}>-{money(discount)}</strong></p>}
          {Number(inv.taxRate) > 0 && <p className="muted">Tax: <strong style={{ color: 'var(--ink)' }}>{inv.taxMode === 'deduct' ? '-' : ''}{money(tax)}</strong></p>}
          <p className="text-lg font-extrabold mt-1" style={{ color: 'var(--brand)' }}>Total: {money(total)}</p>
          {paid > 0 && <p className="font-bold" style={{ color: 'var(--ink)' }}>Balance due: {money(balance)}</p>}
        </div>
        <button onClick={generatePdf} disabled={busy} className="rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
          {busy ? <><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Lucide.Download className="w-4 h-4" /> Download PDF</>}
        </button>
      </div>

      <p className="muted text-xs mt-6">Your invoice is generated in your browser as a PDF. Nothing is uploaded or stored on any server.</p>
    </div>
  );
}
