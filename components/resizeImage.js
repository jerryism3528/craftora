'use client';

// Resize an image in the browser before upload so photos stay small and fast.
// mode 'avatar': square center crop, 256x256. mode 'logo': fit inside 480x240, keeps transparency.
export async function resizeImage(file, mode = 'avatar') {
  if (!file || !/^image\/(jpeg|png|webp|gif)$/.test(file.type)) throw new Error('Choose a JPG, PNG, or WebP image.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Image is too large (max 15 MB).');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Could not read this image.')); i.src = url; });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (mode === 'logo') {
      const scale = Math.min(480 / img.width, 240 / img.height, 1);
      canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      const s = Math.min(img.width, img.height);
      canvas.width = 256; canvas.height = 256;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256);
    }
    const type = mode === 'logo' ? 'image/png' : 'image/webp';
    let blob = await new Promise((r) => canvas.toBlob(r, type, 0.86));
    if (!blob || (mode !== 'logo' && blob.type !== 'image/webp')) blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.86));
    if (blob.size > 400 * 1024) blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.7));
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    return new File([blob], `photo.${ext}`, { type: blob.type });
  } finally {
    URL.revokeObjectURL(url);
  }
}
