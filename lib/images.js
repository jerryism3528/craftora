import crypto from 'crypto';

const D = 'craftora' + '.dev';
export const IMG_BASE = 'https://img.' + D;
export const IMG_DIR = '/app/storage/images';
export const MAX_BYTES = 6 * 1024 * 1024;
export const MAX_ACTIVE = 10;
export const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newImageCode(len = 8) {
  let s = '';
  for (const b of crypto.randomBytes(len)) s += ALPHABET[b % ALPHABET.length];
  return s;
}

export function imageUrls(row) {
  const direct = `${IMG_BASE}/i/${row.file}`;
  const page = `${IMG_BASE}/${row.code}`;
  const alt = (row.original_name || 'image').replace(/[\[\]<>"]/g, '').slice(0, 80);
  return {
    direct,
    page,
    html: `<a href="${page}"><img src="${direct}" alt="${alt}" border="0"></a>`,
    markdown: `[![${alt}](${direct})](${page})`,
    bbcode: `[url=${page}][img]${direct}[/img][/url]`,
  };
}

// Re-encode with high quality settings (visually identical), strip location/camera data,
// fix rotation. Keeps the original if compression would make it bigger (PNG/WebP).
export async function processImage(buf) {
  const sharp = (await import('sharp')).default;
  let meta;
  try { meta = await sharp(buf, { animated: true }).metadata(); } catch (e) { return { error: 'This file is not a valid image.' }; }
  const fmt = meta.format;
  if (fmt === 'gif') return { data: buf, ext: 'gif', width: meta.width, height: meta.pageHeight || meta.height };
  if (!['jpeg', 'png', 'webp'].includes(fmt)) return { error: 'Only JPG, PNG, WebP, and GIF images are supported.' };

  let img = sharp(buf).rotate();
  if (Math.max(meta.width || 0, meta.height || 0) > 5000) {
    img = img.resize({ width: 5000, height: 5000, fit: 'inside', withoutEnlargement: true });
  }
  let out, ext;
  if (fmt === 'jpeg') {
    out = await img.jpeg({ quality: 86, mozjpeg: true }).toBuffer();
    ext = 'jpg';
  } else if (fmt === 'png') {
    out = await img.png({ compressionLevel: 9, effort: 8 }).toBuffer();
    ext = 'png';
    if (out.length > buf.length) out = buf;
  } else {
    out = await img.webp({ quality: 86 }).toBuffer();
    ext = 'webp';
    if (out.length > buf.length) out = buf;
  }
  const m2 = await sharp(out).metadata();
  return { data: out, ext, width: m2.width, height: m2.height };
}
