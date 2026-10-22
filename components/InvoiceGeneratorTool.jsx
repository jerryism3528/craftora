'use client';

import { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';

const emptyItem = { desc: '', qty: 1, price: 0 };
const CURRENCIES = [
  ['$', '$ USD'], ['EUR ', 'EUR'], ['GBP ', 'GBP'], ['Rs ', 'Rs (PKR)'],
  ['INR ', 'INR'], ['AED ', 'AED'], ['SAR ', 'SAR'], ['CAD $', 'CAD'], ['AUD $', 'AUD'],
  ['NZD $', 'NZD'], ['SGD $', 'SGD'], ['CHF ', 'CHF'], ['JPY ', 'JPY'], ['CNY ', 'CNY'],
  ['BDT ', 'BDT'], ['NGN ', 'NGN'], ['ZAR ', 'ZAR'], ['MYR ', 'MYR'], ['custom', 'Other (type your own)'],
];
const TERMS = [
  ['', 'Custom'], ['receipt', 'Due on receipt'], ['7', 'Net 7'],
  ['15', 'Net 15'], ['30', 'Net 30'], ['60', 'Net 60'],
];
const STATUSES = [['none', 'None'], ['paid', 'Paid'], ['unpaid', 'Unpaid'], ['overdue', 'Overdue']];
const STATUS_COLOR = { paid: [0.06, 0.6, 0.46], unpaid: [0.9, 0.28, 0.3], overdue: [0.78, 0.54, 0.08] };

// Payment method (optional). "noProcessor" methods have no card or bank statement descriptor.
const METHODS = [
  ['', 'Not specified'], ['Cash', 'Cash'], ['Bank transfer', 'Bank transfer'], ['Check', 'Check / cheque'],
  ['Credit or debit card', 'Credit or debit card'], ['PayPal', 'PayPal'], ['Stripe', 'Stripe'], ['Square', 'Square'],
  ['Wise', 'Wise'], ['Payoneer', 'Payoneer'], ['Zelle', 'Zelle'], ['Venmo', 'Venmo'], ['Cash App', 'Cash App'],
  ['Apple Pay', 'Apple Pay'], ['Google Pay', 'Google Pay'], ['Crypto', 'Crypto'], ['Other', 'Other'],
];
const NO_PROCESSOR = ['', 'Cash', 'Check'];

const DEFAULT = {
  number: 'INV-001',
  date: new Date().toISOString().slice(0, 10),
  due: '',
  terms: '',
  status: 'none',
  reference: '',
  brandType: 'name', // 'name' | 'logo'
  companyName: '',
  logo: '',
  accent: '#3430a8',
  fromDetails: '',
  toName: '', toDetails: '',
  items: [{ ...emptyItem }],
  currency: '$',
  currencyCustom: '',
  discountType: 'none', // 'none' | 'flat' | 'percent'
  discountValue: 0,
  taxRate: 0,
  taxMode: 'add', // 'add' | 'deduct'
  shipping: 0,
  amountPaid: 0,
  payment: '',
  payMethod: '',
  processor: '',
  descriptor: '',
  txnId: '',
  notes: '',
  signature: '',
};

function hexToRgb01(hex) {
  const m = (hex || '#3430a8').replace('#', '');
  return [parseInt(m.slice(0, 2), 16) / 255, parseInt(m.slice(2, 4), 16) / 255, parseInt(m.slice(4, 6), 16) / 255];
}

// The built-in PDF font only supports Western characters (WinAnsi). Swap or drop anything else so the PDF never fails.
const WINANSI_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
function pdfSafe(s) {
  return String(s == null ? '' : s)
    .replace(/\t/g, '    ')
    .replace(/[₹₨]/g, 'Rs ')
    .replace(/[^\n\x20-\x7E\xA0-\xFF]/g, (c) => (WINANSI_EXTRA.includes(c) ? c : '?'));
}
const hasUnsupported = (s) => /[^\n\t\x20-\x7E\xA0-\xFF€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ₹₨]/.test(String(s || ''));

// Convert any uploaded image (PNG, JPG, WebP, GIF, SVG) to a PNG the PDF library can embed.
function toPng(dataUrl, maxSide = 800) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const r = Math.min(1, maxSide / Math.max(img.naturalWidth || maxSide, img.naturalHeight || maxSide));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round((img.naturalWidth || maxSide) * r));
      c.height = Math.max(1, Math.round((img.naturalHeight || maxSide) * r));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Could not read this image.'));
    img.src = dataUrl;
  });
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d) ? iso : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InvoiceGeneratorTool() {
  const [inv, setInv] = useState(DEFAULT);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');
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
  function removeItem(i) { setInv((x) => ({ ...x, items: x.items.length > 1 ? x.items.filter((_, j) => j !== i) : [{ ...emptyItem }] })); }
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
  function dueFrom(date, t) {
    if (t === 'receipt') return date;
    if (t && !isNaN(Number(t))) {
      const d = new Date(`${date}T00:00:00`);
      d.setDate(d.getDate() + Number(t));
      return d.toISOString().slice(0, 10);
    }
    return null;
  }
  function setTerms(t) {
    setInv((x) => ({ ...x, terms: t, due: dueFrom(x.date, t) ?? x.due }));
  }
  function setDate(v) {
    setInv((x) => ({ ...x, date: v, due: dueFrom(v, x.terms) ?? x.due }));
  }

  function uploadFile(e, key, maxMB) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > maxMB * 1024 * 1024) { setErr(`Image must be under ${maxMB} MB.`); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try { set(key, await toPng(reader.result)); setErr(''); } catch (x) { setErr(x.message); }
    };
    reader.readAsDataURL(file);
  }

  function saveDraft() {
    try {
      localStorage.setItem('craftora-invoice', JSON.stringify(inv));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { setErr('Could not save the draft. Your browser storage may be full (large logo images use space).'); }
  }
  function clearDraft() {
    try { localStorage.removeItem('craftora-invoice'); } catch (e) {}
    setInv({ ...DEFAULT, date: new Date().toISOString().slice(0, 10) });
  }
  function nextNumber() {
    const m = String(inv.number || '').match(/^(.*?)(\d+)(\D*)$/);
    if (!m) return;
    const n = String(Number(m[2]) + 1).padStart(m[2].length, '0');
    setInv((x) => ({ ...x, number: `${m[1]}${n}${m[3]}`, date: new Date().toISOString().slice(0, 10), status: 'none', amountPaid: 0, txnId: '' }));
  }

  // Money math.
  const num = (v) => Number(v) || 0;
  const subtotal = inv.items.reduce((s, it) => s + num(it.qty) * num(it.price), 0);
  let discount = 0;
  if (inv.discountType === 'flat') discount = num(inv.discountValue);
  else if (inv.discountType === 'percent') discount = subtotal * num(inv.discountValue) / 100;
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * num(inv.taxRate) / 100;
  const shipping = num(inv.shipping);
  const total = (inv.taxMode === 'deduct' ? afterDiscount - tax : afterDiscount + tax) + shipping;
  const paid = num(inv.amountPaid);
  const balance = total - paid;
  const cur = inv.currency === 'custom' ? (inv.currencyCustom ? `${inv.currencyCustom} ` : '') : inv.currency;
  const money = (n) => `${n < 0 ? '-' : ''}${cur}${Math.abs(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const showProcessor = !NO_PROCESSOR.includes(inv.payMethod);

  const allText = [inv.companyName, inv.fromDetails, inv.toName, inv.toDetails, inv.payment, inv.notes, inv.processor, inv.descriptor, inv.reference, ...inv.items.map((i) => i.desc)].join(' ');
  const unsupported = hasUnsupported(allText);

  async function generatePdf() {
    setBusy(true);
    setErr('');
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdf = await PDFDocument.create();
      pdf.setTitle(pdfSafe(`Invoice ${inv.number}`));
      pdf.setCreator('Craftora Invoice Generator');
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const [ar, ag, ab] = hexToRgb01(inv.accent);
      const accent = rgb(ar, ag, ab);
      const ink = rgb(0.13, 0.17, 0.35);
      const muted = rgb(0.45, 0.48, 0.56);
      const white = rgb(1, 1, 1);
      const W = 595, H = 842, L = 40, R = 555;
      const BOTTOM = 130; // keep room for signature and footer
      let page = pdf.addPage([W, H]);
      let y = 812;

      const text = (t, x, yy, f = font, size = 10, color = ink) => page.drawText(pdfSafe(t), { x, y: yy, size, font: f, color });
      const textR = (t, xr, yy, f = font, size = 10, color = ink) => { const s = pdfSafe(t); page.drawText(s, { x: xr - f.widthOfTextAtSize(s, size), y: yy, size, font: f, color }); };
      const wrap = (s, f, size, maxW) => {
        const out = [];
        pdfSafe(s).split('\n').forEach((para) => {
          let line = '';
          para.split(' ').forEach((word) => {
            let w = word;
            while (f.widthOfTextAtSize(w, size) > maxW) { // break very long words
              let k = w.length;
              while (k > 1 && f.widthOfTextAtSize(w.slice(0, k), size) > maxW) k--;
              if (line) { out.push(line); line = ''; }
              out.push(w.slice(0, k));
              w = w.slice(k);
            }
            const test = line ? `${line} ${w}` : w;
            if (f.widthOfTextAtSize(test, size) > maxW && line) { out.push(line); line = w; } else line = test;
          });
          out.push(line);
        });
        return out;
      };
      const tableHeader = () => {
        page.drawRectangle({ x: L, y: y - 4, width: R - L, height: 22, color: accent });
        text('DESCRIPTION', L + 8, y + 4, bold, 9, white);
        textR('QTY', 375, y + 4, bold, 9, white);
        textR('PRICE', 465, y + 4, bold, 9, white);
        textR('AMOUNT', R - 8, y + 4, bold, 9, white);
        y -= 26;
      };
      const newPage = (withTable) => {
        page.drawText(pdfSafe(`${inv.number}  (continued)`), { x: L, y: 30, size: 8, font, color: muted });
        page = pdf.addPage([W, H]);
        page.drawRectangle({ x: 0, y: H - 10, width: W, height: 10, color: accent });
        y = 800;
        if (withTable) tableHeader();
      };
      const need = (h, withTable = false) => { if (y - h < BOTTOM) newPage(withTable); };

      // Accent top bar
      page.drawRectangle({ x: 0, y: H - 10, width: W, height: 10, color: accent });

      // Logo or company name
      if (inv.brandType === 'logo' && inv.logo) {
        try {
          const bytes = await fetch(inv.logo).then((r) => r.arrayBuffer());
          const img = inv.logo.includes('image/png') ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
          const d = img.scale(1);
          const ratio = Math.min(160 / d.width, 60 / d.height);
          page.drawImage(img, { x: L, y: y - 60, width: d.width * ratio, height: d.height * ratio });
        } catch (e) {}
      } else if (inv.companyName) {
        wrap(inv.companyName, bold, 20, 300).slice(0, 2).forEach((l, i) => text(l, L, y - 20 - i * 22, bold, 20, accent));
      }
      text('INVOICE', L, y - 72, bold, 12, muted);

      // Invoice meta (right column)
      textR(inv.number, R, y - 6, bold, 14, ink);
      let my = y - 24;
      textR(`Date: ${fmtDate(inv.date)}`, R, my, font, 9, muted); my -= 13;
      if (inv.due) { textR(`Due: ${fmtDate(inv.due)}`, R, my, bold, 9, ink); my -= 13; }
      if (inv.reference) { textR(`Ref: ${inv.reference}`, R, my, font, 9, muted); my -= 13; }

      // Status stamp, under the meta
      if (inv.status !== 'none' && STATUS_COLOR[inv.status]) {
        const [sr, sg, sb] = STATUS_COLOR[inv.status];
        const sc = rgb(sr, sg, sb);
        const label = inv.status.toUpperCase();
        const tw = bold.widthOfTextAtSize(label, 11);
        page.drawRectangle({ x: R - tw - 16, y: my - 18, width: tw + 16, height: 20, borderColor: sc, borderWidth: 1.5, color: white });
        text(label, R - tw - 8, my - 12, bold, 11, sc);
        my -= 24;
      }

      y = Math.min(y - 95, my - 10);

      // From / Bill to
      text('FROM', L, y, bold, 9, muted);
      text('BILL TO', 320, y, bold, 9, muted);
      y -= 15;
      if (inv.companyName && inv.brandType === 'name') text(wrap(inv.companyName, bold, 11, 250)[0], L, y, bold, 11, ink);
      text(wrap(inv.toName || '', bold, 11, 235)[0], 320, y, bold, 11, ink);
      y -= 13;
      let fy = y, ty = y;
      wrap(inv.fromDetails, font, 9, 250).slice(0, 8).forEach((l) => { text(l, L, fy, font, 9, muted); fy -= 12; });
      wrap(inv.toDetails, font, 9, 235).slice(0, 8).forEach((l) => { text(l, 320, ty, font, 9, muted); ty -= 12; });
      y = Math.min(fy, ty) - 15;

      // Items
      tableHeader();
      inv.items.forEach((it) => {
        const amt = num(it.qty) * num(it.price);
        const lines = wrap(it.desc || '', font, 10, 280);
        need(lines.length * 13 + 10, true);
        lines.forEach((l, k) => text(l, L + 8, y - k * 13, font, 10, ink));
        textR(String(it.qty ?? ''), 375, y, font, 10, ink);
        textR(money(num(it.price)), 465, y, font, 10, ink);
        textR(money(amt), R - 8, y, font, 10, ink);
        y -= lines.length * 13 + 9;
        page.drawLine({ start: { x: L, y: y + 13.5 }, end: { x: R, y: y + 13.5 }, thickness: 0.3, color: rgb(0.86, 0.88, 0.93) });
      });

      // Totals
      need(130);
      y -= 8;
      const row = (label, value, f = font, size = 10, color = ink, lc = muted) => { text(label, 350, y, f, size, lc); textR(value, R - 8, y, f, size, color); y -= 15; };
      row('Subtotal', money(subtotal));
      if (discount > 0) row(inv.discountType === 'percent' ? `Discount (${num(inv.discountValue)}%)` : 'Discount', `-${money(discount)}`);
      if (num(inv.taxRate) > 0) row(`Tax (${num(inv.taxRate)}%)${inv.taxMode === 'deduct' ? ' deducted' : ''}`, `${inv.taxMode === 'deduct' ? '-' : ''}${money(tax)}`);
      if (shipping) row('Shipping', money(shipping));
      page.drawLine({ start: { x: 350, y: y + 10 }, end: { x: R, y: y + 10 }, thickness: 0.6, color: muted });
      y -= 3;
      row('TOTAL', money(total), bold, 12, accent, accent);
      if (paid > 0) {
        row('Paid', `-${money(paid)}`);
        row('Balance due', money(balance), bold, 11, ink, ink);
      }

      y -= 12;
      const block = (title, body, color = ink) => {
        const lines = wrap(body, font, 9, R - L);
        need(18 + lines.length * 12);
        text(title, L, y, bold, 9, muted); y -= 14;
        lines.forEach((l) => { need(12); text(l, L, y, font, 9, color); y -= 12; });
        y -= 8;
      };

      // Payment details (where to pay) and payment method (how it was or will be paid)
      if (inv.payment) block('PAYMENT DETAILS', inv.payment);
      if (inv.payMethod) {
        const paidish = inv.status === 'paid' || paid > 0;
        const lines = [`${paidish ? 'Paid via' : 'Payment method'}: ${inv.payMethod}`];
        if (showProcessor && inv.processor) lines.push(`Payment processor: ${inv.processor}`);
        if (showProcessor && inv.descriptor) lines.push(`Appears on card or bank statement as: ${inv.descriptor}`);
        if (inv.txnId) lines.push(`Transaction / reference ID: ${inv.txnId}`);
        block('PAYMENT METHOD', lines.join('\n'));
      }
      if (inv.notes) block('NOTES', inv.notes, muted);

      // Signature (bottom right of the last page)
      if (inv.signature) {
        try {
          const bytes = await fetch(inv.signature).then((r) => r.arrayBuffer());
          const sig = inv.signature.includes('image/png') ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
          const d = sig.scale(1);
          const ratio = Math.min(120 / d.width, 50 / d.height);
          page.drawImage(sig, { x: 400, y: 95, width: d.width * ratio, height: d.height * ratio });
        } catch (e) {}
      }
      page.drawLine({ start: { x: 400, y: 90 }, end: { x: R, y: 90 }, thickness: 0.5, color: muted });
      text('Signature', 400, 78, font, 8, muted);
      text('Generated with Craftora', L, 30, font, 8, muted);

      const pages = pdf.getPages();
      if (pages.length > 1) pages.forEach((p, i) => p.drawText(`Page ${i + 1} of ${pages.length}`, { x: R - 60, y: 30, size: 8, font, color: muted }));

      const bytes = await pdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${(inv.number || 'invoice').replace(/[^\w.-]+/g, '-')}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error(e);
      setErr('Could not create the PDF. Please check your entries and try again.');
    }
    setBusy(false);
  }

  const inputCls = 'w-full rounded-lg border surface px-3 py-2 text-sm bg-transparent';
  const lbl = 'block text-sm font-semibold mb-1.5';
  const ink = { color: 'var(--ink)' };

  return (
    <div>
      {/* Draft controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={saveDraft} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={ink}>
          {saved ? <><Lucide.Check className="w-4 h-4" /> Saved</> : <><Lucide.Save className="w-4 h-4" /> Save draft</>}
        </button>
        <button onClick={nextNumber} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={ink} title="Keep your details and start the next invoice number">
          <Lucide.FilePlus2 className="w-4 h-4" /> Next invoice
        </button>
        <button onClick={clearDraft} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={ink}>
          <Lucide.RotateCcw className="w-4 h-4" /> Reset
        </button>
        <span className="muted text-xs self-center">Your draft saves in this browser so you can reuse your details.</span>
      </div>

      {/* Branding */}
      <div className="border surface rounded-xl p-5 mb-6" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <span className="text-sm font-semibold" style={ink}>Show as:</span>
          <div className="flex gap-2">
            <button onClick={() => set('brandType', 'name')} className="rounded-lg px-4 py-1.5 text-sm font-semibold border surface" style={inv.brandType === 'name' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : ink}>Company name</button>
            <button onClick={() => set('brandType', 'logo')} className="rounded-lg px-4 py-1.5 text-sm font-semibold border surface" style={inv.brandType === 'logo' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : ink}>Logo</button>
          </div>
        </div>
        {inv.brandType === 'name' ? (
          <input value={inv.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="Your company name" aria-label="Company name" className={inputCls} style={ink} />
        ) : (
          <div>
            {inv.logo ? (
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={inv.logo} alt="Logo" className="h-16 rounded border surface" style={{ background: '#fff', padding: 4 }} />
                <button onClick={() => set('logo', '')} className="text-sm font-semibold" style={{ color: '#e5484d' }}>Remove logo</button>
              </div>
            ) : (
              <label className="rounded-lg px-4 py-2.5 text-sm font-semibold border surface inline-flex items-center gap-2 cursor-pointer" style={ink}>
                <Lucide.Upload className="w-4 h-4" /> Upload logo
                <input ref={logoRef} type="file" accept="image/*" onChange={(e) => uploadFile(e, 'logo', 5)} className="hidden" />
              </label>
            )}
            <p className="muted text-xs mt-2">PNG, JPG, WebP or SVG. A transparent PNG looks best. Max 5 MB.</p>
          </div>
        )}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm font-semibold" style={ink}>Accent color</span>
          <input type="color" value={inv.accent} onChange={(e) => set('accent', e.target.value)} aria-label="Accent color" className="w-10 h-9 rounded-lg border surface cursor-pointer bg-transparent" />
          <span className="muted text-xs">Themes the header bar, table, and total.</span>
        </div>
      </div>

      {/* Meta */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div><label htmlFor="inv-number" className={lbl} style={ink}>Invoice number</label><input id="inv-number" value={inv.number} onChange={(e) => set('number', e.target.value)} className={inputCls} style={ink} /></div>
        <div><label htmlFor="inv-date" className={lbl} style={ink}>Date</label><input id="inv-date" type="date" value={inv.date} onChange={(e) => setDate(e.target.value)} className={inputCls} style={ink} /></div>
        <div><label htmlFor="inv-ref" className={lbl} style={ink}>PO / reference <span className="muted font-normal">(optional)</span></label><input id="inv-ref" value={inv.reference} onChange={(e) => set('reference', e.target.value)} placeholder="e.g. PO-4521" className={inputCls} style={ink} /></div>
        <div><label htmlFor="inv-status" className={lbl} style={ink}>Status</label>
          <select id="inv-status" value={inv.status} onChange={(e) => set('status', e.target.value)} className={inputCls} style={ink}>
            {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* From / To */}
      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="inv-from" className={lbl} style={ink}>From (your details)</label>
          <textarea id="inv-from" value={inv.fromDetails} onChange={(e) => set('fromDetails', e.target.value)} rows={3} placeholder={'Address, email, phone\nTax ID / VAT number (optional)'} className={inputCls} style={ink} />
        </div>
        <div>
          <label htmlFor="inv-to" className={lbl} style={ink}>Bill to (client)</label>
          <input id="inv-to" value={inv.toName} onChange={(e) => set('toName', e.target.value)} placeholder="Client name" className={inputCls + ' mb-2'} style={ink} />
          <textarea value={inv.toDetails} onChange={(e) => set('toDetails', e.target.value)} rows={2} placeholder="Address, email" aria-label="Client details" className={inputCls} style={ink} />
        </div>
      </div>

      {/* Items */}
      <p className={lbl} style={ink}>Items</p>
      <div className="space-y-3 sm:space-y-2 mb-3">
        <div className="hidden sm:flex gap-2 px-1 text-xs font-bold uppercase tracking-wide muted">
          <span className="flex-1">Description</span>
          <span className="w-20 text-center">Qty</span>
          <span className="w-28 text-center">Unit price</span>
          <span className="w-28 text-right pr-1">Line total</span>
          <span className="w-24"></span>
        </div>
        {inv.items.map((it, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-center rounded-lg sm:rounded-none border sm:border-0 surface p-2 sm:p-0">
            <input value={it.desc} onChange={(e) => setItem(i, 'desc', e.target.value)} placeholder="Item or service description" aria-label={`Item ${i + 1} description`} className="w-full sm:flex-1 rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={ink} />
            <div className="flex gap-2 items-center">
              <input type="number" min="0" step="any" value={it.qty} onChange={(e) => setItem(i, 'qty', e.target.value)} placeholder="Qty" aria-label={`Item ${i + 1} quantity`} className="w-20 rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={ink} />
              <input type="number" min="0" step="any" value={it.price} onChange={(e) => setItem(i, 'price', e.target.value)} placeholder="Unit price" aria-label={`Item ${i + 1} unit price`} className="w-28 rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={ink} />
              <span className="w-28 text-right text-sm font-semibold tabular-nums pr-1" style={ink}>{money(num(it.qty) * num(it.price))}</span>
              <div className="flex gap-0.5 w-24 shrink-0 ml-auto sm:ml-0">
                <button onClick={() => moveItem(i, -1)} className="w-6 h-8 flex items-center justify-center muted" title="Move up" aria-label="Move up"><Lucide.ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => moveItem(i, 1)} className="w-6 h-8 flex items-center justify-center muted" title="Move down" aria-label="Move down"><Lucide.ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => dupItem(i)} className="w-6 h-8 flex items-center justify-center muted" title="Duplicate" aria-label="Duplicate"><Lucide.Copy className="w-4 h-4" /></button>
                <button onClick={() => removeItem(i)} className="w-6 h-8 flex items-center justify-center" style={{ color: '#e5484d' }} title="Delete" aria-label="Delete"><Lucide.Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addItem} className="rounded-lg px-4 py-2 text-sm font-bold inline-flex items-center gap-2 mb-6" style={{ background: 'var(--surface-soft)', color: 'var(--brand)' }}><Lucide.Plus className="w-4 h-4" /> Add item</button>

      {/* Money settings */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div><label htmlFor="inv-cur" className={lbl} style={ink}>Currency</label>
          <select id="inv-cur" value={inv.currency} onChange={(e) => set('currency', e.target.value)} className={inputCls} style={ink}>
            {CURRENCIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {inv.currency === 'custom' && <input value={inv.currencyCustom} onChange={(e) => set('currencyCustom', e.target.value.slice(0, 6))} placeholder="e.g. KES" aria-label="Custom currency" className={inputCls + ' mt-2'} style={ink} />}
        </div>
        <div><label className={lbl} style={ink}>Discount</label>
          <div className="flex gap-2">
            <select value={inv.discountType} onChange={(e) => set('discountType', e.target.value)} aria-label="Discount type" className="rounded-lg border surface px-2 py-2 text-sm bg-transparent" style={ink}>
              <option value="none">None</option><option value="flat">Flat</option><option value="percent">%</option>
            </select>
            {inv.discountType !== 'none' && <input type="number" min="0" step="any" value={inv.discountValue} onChange={(e) => set('discountValue', e.target.value)} aria-label="Discount value" className="w-full rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={ink} />}
          </div>
        </div>
        <div><label htmlFor="inv-tax" className={lbl} style={ink}>Tax rate (%)</label>
          <input id="inv-tax" type="number" min="0" step="any" value={inv.taxRate} onChange={(e) => set('taxRate', e.target.value)} className={inputCls} style={ink} />
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer mt-2" style={ink}>
            <input type="checkbox" checked={inv.taxMode === 'deduct'} onChange={(e) => set('taxMode', e.target.checked ? 'deduct' : 'add')} /> Deduct tax instead of add
          </label>
        </div>
        <div><label htmlFor="inv-ship" className={lbl} style={ink}>Shipping <span className="muted font-normal">(optional)</span></label>
          <input id="inv-ship" type="number" min="0" step="any" value={inv.shipping} onChange={(e) => set('shipping', e.target.value)} className={inputCls} style={ink} />
        </div>
        <div><label htmlFor="inv-paid" className={lbl} style={ink}>Amount paid</label>
          <input id="inv-paid" type="number" min="0" step="any" value={inv.amountPaid} onChange={(e) => set('amountPaid', e.target.value)} className={inputCls} style={ink} />
        </div>
      </div>

      {/* Terms + due */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div><label htmlFor="inv-terms" className={lbl} style={ink}>Payment terms</label>
          <select id="inv-terms" value={inv.terms} onChange={(e) => setTerms(e.target.value)} className={inputCls} style={ink}>
            {TERMS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div><label htmlFor="inv-due" className={lbl} style={ink}>Due date</label>
          <input id="inv-due" type="date" value={inv.due} onChange={(e) => set('due', e.target.value)} className={inputCls} style={ink} />
        </div>
      </div>

      {/* Payment details + notes */}
      <div className="grid sm:grid-cols-2 gap-6 mb-4">
        <div><label htmlFor="inv-pay" className={lbl} style={ink}>Payment details</label>
          <textarea id="inv-pay" value={inv.payment} onChange={(e) => set('payment', e.target.value)} rows={3} placeholder={'Bank: ...\nIBAN / Account: ...\nOr pay via PayPal / Wise: ...'} className={inputCls} style={ink} />
        </div>
        <div><label htmlFor="inv-notes" className={lbl} style={ink}>Notes</label>
          <textarea id="inv-notes" value={inv.notes} onChange={(e) => set('notes', e.target.value)} rows={3} placeholder="Thank you for your business..." className={inputCls} style={ink} />
        </div>
      </div>

      {/* Payment method and processor (optional) */}
      <div className="border surface rounded-xl p-5 mb-6" style={{ background: 'var(--surface)' }}>
        <p className="text-sm font-semibold" style={ink}>Payment method <span className="muted font-normal">(optional)</span></p>
        <p className="muted text-xs mt-0.5 mb-3">Show how the client paid or should pay, and what the charge will look like on their card or bank statement. Leave it empty, or pick Cash, if there is no processor.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label htmlFor="inv-method" className={lbl} style={ink}>Method</label>
            <select id="inv-method" value={inv.payMethod} onChange={(e) => set('payMethod', e.target.value)} className={inputCls} style={ink}>
              {METHODS.map(([v, l]) => <option key={v || 'none'} value={v}>{l}</option>)}
            </select>
          </div>
          {showProcessor && (
            <>
              <div><label htmlFor="inv-proc" className={lbl} style={ink}>Payment processor</label>
                <input id="inv-proc" value={inv.processor} onChange={(e) => set('processor', e.target.value)} placeholder="e.g. Stripe, Square, PayPal" className={inputCls} style={ink} />
              </div>
              <div><label htmlFor="inv-desc" className={lbl} style={ink}>Shows on statement as</label>
                <input id="inv-desc" value={inv.descriptor} onChange={(e) => set('descriptor', e.target.value.slice(0, 40))} placeholder="e.g. ACME*WEB DESIGN" className={inputCls} style={ink} />
              </div>
            </>
          )}
          {inv.payMethod && (
            <div><label htmlFor="inv-txn" className={lbl} style={ink}>Transaction / reference ID</label>
              <input id="inv-txn" value={inv.txnId} onChange={(e) => set('txnId', e.target.value)} placeholder={inv.payMethod === 'Cash' ? 'e.g. receipt #' : 'e.g. ch_3Px...'} className={inputCls} style={ink} />
            </div>
          )}
        </div>
      </div>

      {/* Signature */}
      <div className="mb-6">
        <p className={lbl} style={ink}>Signature (optional)</p>
        {inv.signature ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={inv.signature} alt="Signature" className="h-14 rounded border surface" style={{ background: '#fff', padding: 4 }} />
            <button onClick={() => set('signature', '')} className="text-sm font-semibold" style={{ color: '#e5484d' }}>Remove</button>
          </div>
        ) : (
          <label className="rounded-lg px-4 py-2.5 text-sm font-semibold border surface inline-flex items-center gap-2 cursor-pointer" style={ink}>
            <Lucide.Upload className="w-4 h-4" /> Upload signature image
            <input ref={sigRef} type="file" accept="image/*" onChange={(e) => uploadFile(e, 'signature', 5)} className="hidden" />
          </label>
        )}
      </div>

      {unsupported && (
        <p className="mb-4 rounded-lg px-3 py-2 text-xs font-semibold" style={{ background: 'rgba(229,72,77,0.08)', color: '#c2410c' }}>
          Some characters you typed (for example Urdu, Arabic, Hindi or emoji) are not supported by the PDF font yet and will show as &quot;?&quot;. Use English letters for those fields.
        </p>
      )}
      {err && <p role="alert" className="mb-4 rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: 'rgba(229,72,77,0.08)', color: '#e5484d' }}>{err}</p>}

      {/* Totals + download */}
      <div className="border surface rounded-xl p-5 flex items-center justify-between flex-wrap gap-4" style={{ background: 'var(--surface)' }}>
        <div className="text-sm">
          <p className="muted">Subtotal: <strong style={ink}>{money(subtotal)}</strong></p>
          {discount > 0 && <p className="muted">Discount: <strong style={ink}>-{money(discount)}</strong></p>}
          {num(inv.taxRate) > 0 && <p className="muted">Tax: <strong style={ink}>{inv.taxMode === 'deduct' ? '-' : ''}{money(tax)}</strong></p>}
          {shipping > 0 && <p className="muted">Shipping: <strong style={ink}>{money(shipping)}</strong></p>}
          <p className="text-lg font-extrabold mt-1" style={{ color: 'var(--brand)' }}>Total: {money(total)}</p>
          {paid > 0 && <p className="font-bold" style={ink}>Balance due: {money(balance)}</p>}
        </div>
        <button onClick={generatePdf} disabled={busy} className="rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
          {busy ? <><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Lucide.Download className="w-4 h-4" /> Download PDF</>}
        </button>
      </div>

      <p className="muted text-xs mt-6">Your invoice is generated in your browser as a PDF. Nothing is uploaded or stored on any server.</p>
    </div>
  );
}
