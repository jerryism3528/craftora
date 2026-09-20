// Central tool catalog for Craftora.
// status: 'live' = page built and linked | 'soon' = shown with a Soon badge, not yet linked.
// engine: 'browser' = runs in the visitor's browser (private, no upload) | 'server' = needs a backend engine.

export const categories = [
  {
    key: 'pdf',
    name: 'PDF Tools',
    slug: 'pdf-tools',
    tagline: 'Edit, convert, and organize PDFs',
    description:
      'Free PDF tools to merge, split, compress, convert, protect, and organize PDF documents online. No signup, no watermarks, fast browser-based processing.',
  },
  {
    key: 'image',
    name: 'Image Tools',
    slug: 'image-tools',
    tagline: 'Compress, resize, and convert images',
    description:
      'Free image tools to compress, resize, crop, and convert JPG, PNG, and WebP images online. Private, browser-based, and watermark-free.',
  },
  {
    key: 'convert',
    name: 'Convert Tools',
    slug: 'convert-tools',
    tagline: 'Convert files between formats',
    description:
      'Free file converters for documents, images, audio, and video. Convert between hundreds of formats online, quickly and privately.',
  },
  {
    key: 'seo',
    name: 'SEO Tools',
    slug: 'seo-tools',
    tagline: 'Audit and optimize your website',
    description:
      'Free SEO tools to audit pages, generate meta tags and schema markup, preview search snippets, and improve your website ranking.',
  },
  {
    key: 'email',
    name: 'Email & Validation',
    slug: 'email-tools',
    tagline: 'Verify and validate email addresses',
    description:
      'Free email tools to verify addresses, detect disposable emails, extract emails from text, and validate card and BIN data.',
  },
  {
    key: 'text',
    name: 'Text Tools',
    slug: 'text-tools',
    tagline: 'Count, convert, and clean up text',
    description:
      'Free text tools to count words and characters, change case, compare text, generate placeholder text, and clean up formatting.',
  },
  {
    key: 'developer',
    name: 'Developer Tools',
    slug: 'developer-tools',
    tagline: 'Format, encode, and generate',
    description:
      'Free developer tools to format JSON, encode and decode Base64 and URLs, generate hashes, UUIDs, QR codes, and more.',
  },
  {
    key: 'security',
    name: 'Security Tools',
    slug: 'security-tools',
    tagline: 'Passwords and random generators',
    description:
      'Free security tools to generate strong passwords, check password strength, and create random numbers and barcodes.',
  },
  {
    key: 'business',
    name: 'Business Tools',
    slug: 'business-tools',
    tagline: 'Invoices and documents',
    description:
      'Free business tools to generate invoices, sign documents, and handle everyday paperwork online.',
  },
  {
    key: 'media',
    name: 'Media Tools',
    slug: 'media-tools',
    tagline: 'Transcribe and download media',
    description:
      'Free media tools to transcribe audio and video to text and download video from popular platforms.',
  },
];

export const tools = [
  // ---------- PDF ----------
  { name: 'Merge PDF', slug: 'merge-pdf', category: 'pdf', icon: 'Files', status: 'live', engine: 'browser', description: 'Combine multiple PDF files into one document online, free.' },
  { name: 'Split PDF', slug: 'split-pdf', category: 'pdf', icon: 'Scissors', status: 'live', engine: 'browser', description: 'Split a PDF into separate pages or extract a page range.' },
  { name: 'Compress PDF', slug: 'compress-pdf', category: 'pdf', icon: 'Minimize2', status: 'live', engine: 'browser', description: 'Reduce PDF file size online while keeping quality.' },
  { name: 'PDF to JPG', slug: 'pdf-to-jpg', category: 'pdf', icon: 'FileImage', status: 'live', engine: 'browser', description: 'Convert each PDF page into a high-quality JPG image.' },
  { name: 'JPG to PDF', slug: 'jpg-to-pdf', category: 'pdf', icon: 'FileText', status: 'live', engine: 'browser', description: 'Turn JPG and PNG images into a single PDF file.' },
  { name: 'Rotate PDF', slug: 'rotate-pdf', category: 'pdf', icon: 'RotateCw', status: 'live', engine: 'browser', description: 'Rotate PDF pages and save them in the right orientation.' },
  { name: 'Organize PDF', slug: 'organize-pdf', category: 'pdf', icon: 'ListOrdered', status: 'live', engine: 'browser', description: 'Reorder, rotate, and delete pages in a PDF document.' },
  { name: 'Add Page Numbers', slug: 'add-page-numbers', category: 'pdf', icon: 'Hash', status: 'soon', engine: 'browser', description: 'Add page numbers to a PDF document in seconds.' },
  { name: 'Add Watermark', slug: 'watermark-pdf', category: 'pdf', icon: 'Stamp', status: 'soon', engine: 'browser', description: 'Add a text or image watermark to your PDF pages.' },
  { name: 'Protect PDF', slug: 'protect-pdf', category: 'pdf', icon: 'Lock', status: 'soon', engine: 'browser', description: 'Add a password to encrypt and protect a PDF file.' },
  { name: 'Unlock PDF', slug: 'unlock-pdf', category: 'pdf', icon: 'Unlock', status: 'soon', engine: 'browser', description: 'Remove a password from a PDF you have the rights to.' },
  { name: 'Sign PDF', slug: 'sign-pdf', category: 'pdf', icon: 'FileSignature', status: 'soon', engine: 'browser', description: 'Draw or type a signature and place it on your PDF.' },

  // ---------- Image ----------
  { name: 'Compress Image', slug: 'compress-image', category: 'image', icon: 'Minimize2', status: 'soon', engine: 'browser', description: 'Reduce JPG, PNG, and WebP image size without losing quality.' },
  { name: 'Resize Image', slug: 'resize-image', category: 'image', icon: 'Expand', status: 'soon', engine: 'browser', description: 'Change image dimensions to any width and height online.' },
  { name: 'Crop Image', slug: 'crop-image', category: 'image', icon: 'Crop', status: 'soon', engine: 'browser', description: 'Crop images to the exact frame or aspect ratio you need.' },
  { name: 'Convert Image', slug: 'convert-image', category: 'image', icon: 'RefreshCw', status: 'soon', engine: 'browser', description: 'Convert between JPG, PNG, WebP, and GIF image formats.' },
  { name: 'Rotate Image', slug: 'rotate-image', category: 'image', icon: 'RotateCw', status: 'soon', engine: 'browser', description: 'Rotate or flip images and save them instantly.' },
  { name: 'Image to Text (OCR)', slug: 'image-to-text', category: 'image', icon: 'ScanText', status: 'soon', engine: 'browser', description: 'Extract text from an image with free online OCR.' },
  { name: 'Favicon Generator', slug: 'favicon-generator', category: 'image', icon: 'Image', status: 'soon', engine: 'browser', description: 'Create a favicon for your website from any image.' },

  // ---------- Convert ----------
  { name: 'File Converter', slug: 'file-converter', category: 'convert', icon: 'RefreshCw', status: 'soon', engine: 'server', description: 'Convert documents, images, audio, and video across 1000+ formats.' },
  { name: 'Video Converter', slug: 'video-converter', category: 'convert', icon: 'Video', status: 'soon', engine: 'server', description: 'Convert video files between MP4, MOV, WebM, and more.' },
  { name: 'Audio Converter', slug: 'audio-converter', category: 'convert', icon: 'Music', status: 'soon', engine: 'server', description: 'Convert audio files between MP3, WAV, AAC, and more.' },
  { name: 'Unit Converter', slug: 'unit-converter', category: 'convert', icon: 'RefreshCw', status: 'soon', engine: 'browser', description: 'Convert length, weight, temperature, and other units.' },

  // ---------- SEO ----------
  { name: 'Website SEO Audit', slug: 'seo-audit', category: 'seo', icon: 'Gauge', status: 'soon', engine: 'server', description: 'Check key on-page SEO signals and get an actionable report.' },
  { name: 'Meta Tag Generator', slug: 'meta-tag-generator', category: 'seo', icon: 'Tags', status: 'soon', engine: 'browser', description: 'Generate title, description, and meta tags for your pages.' },
  { name: 'Schema Generator', slug: 'schema-generator', category: 'seo', icon: 'Braces', status: 'soon', engine: 'browser', description: 'Create JSON-LD structured data markup for rich results.' },
  { name: 'SERP Snippet Preview', slug: 'serp-preview', category: 'seo', icon: 'Search', status: 'soon', engine: 'browser', description: 'Preview how your page looks in Google search results.' },
  { name: 'Sitemap Generator', slug: 'sitemap-generator', category: 'seo', icon: 'Map', status: 'soon', engine: 'server', description: 'Generate an XML sitemap for your website.' },
  { name: 'Robots.txt Generator', slug: 'robots-txt-generator', category: 'seo', icon: 'FileText', status: 'soon', engine: 'browser', description: 'Create a robots.txt file to control search crawlers.' },
  { name: 'Open Graph Generator', slug: 'open-graph-generator', category: 'seo', icon: 'Tags', status: 'soon', engine: 'browser', description: 'Generate Open Graph tags for social media previews.' },

  // ---------- Email & Validation ----------
  { name: 'Email Verifier', slug: 'email-verifier', category: 'email', icon: 'MailCheck', status: 'soon', engine: 'server', description: 'Check whether an email address is valid and deliverable.' },
  { name: 'Bulk Email Verifier', slug: 'bulk-email-verifier', category: 'email', icon: 'Mail', status: 'soon', engine: 'server', description: 'Verify a list of email addresses in one batch.' },
  { name: 'Email Extractor', slug: 'email-extractor', category: 'email', icon: 'AtSign', status: 'soon', engine: 'browser', description: 'Extract all email addresses from any block of text.' },
  { name: 'Disposable Email Detector', slug: 'disposable-email-detector', category: 'email', icon: 'ShieldAlert', status: 'soon', engine: 'browser', description: 'Identify temporary and disposable email addresses.' },
  { name: 'Card & BIN Checker', slug: 'bin-checker', category: 'email', icon: 'CreditCard', status: 'soon', engine: 'server', description: 'Look up card BIN details for developer testing.' },

  // ---------- Text ----------
  { name: 'Word Counter', slug: 'word-counter', category: 'text', icon: 'AlignLeft', status: 'soon', engine: 'browser', description: 'Count words, characters, sentences, and paragraphs.' },
  { name: 'Case Converter', slug: 'case-converter', category: 'text', icon: 'Type', status: 'soon', engine: 'browser', description: 'Change text to upper, lower, title, or sentence case.' },
  { name: 'Text Compare', slug: 'text-compare', category: 'text', icon: 'Replace', status: 'soon', engine: 'browser', description: 'Compare two blocks of text and spot the differences.' },
  { name: 'Lorem Ipsum Generator', slug: 'lorem-ipsum-generator', category: 'text', icon: 'AlignLeft', status: 'soon', engine: 'browser', description: 'Generate placeholder Lorem Ipsum text for designs.' },
  { name: 'Text to Slug', slug: 'text-to-slug', category: 'text', icon: 'Link', status: 'soon', engine: 'browser', description: 'Turn any text into a clean, SEO-friendly URL slug.' },
  { name: 'Remove Line Breaks', slug: 'remove-line-breaks', category: 'text', icon: 'AlignLeft', status: 'soon', engine: 'browser', description: 'Remove extra line breaks and clean up messy text.' },

  // ---------- Developer ----------
  { name: 'JSON Formatter', slug: 'json-formatter', category: 'developer', icon: 'Braces', status: 'soon', engine: 'browser', description: 'Format, validate, and beautify JSON online.' },
  { name: 'Base64 Encode/Decode', slug: 'base64', category: 'developer', icon: 'Code', status: 'soon', engine: 'browser', description: 'Encode text to Base64 or decode Base64 back to text.' },
  { name: 'URL Encode/Decode', slug: 'url-encode-decode', category: 'developer', icon: 'Link', status: 'soon', engine: 'browser', description: 'Encode or decode URL and query string values.' },
  { name: 'Hash Generator', slug: 'hash-generator', category: 'developer', icon: 'Hash', status: 'soon', engine: 'browser', description: 'Generate MD5, SHA-1, and SHA-256 hashes from text.' },
  { name: 'UUID Generator', slug: 'uuid-generator', category: 'developer', icon: 'Code', status: 'soon', engine: 'browser', description: 'Generate random UUID version 4 identifiers instantly.' },
  { name: 'QR Code Generator', slug: 'qr-code-generator', category: 'developer', icon: 'QrCode', status: 'soon', engine: 'browser', description: 'Create a free QR code for any link or text.' },
  { name: 'Timestamp Converter', slug: 'timestamp-converter', category: 'developer', icon: 'Clock', status: 'soon', engine: 'browser', description: 'Convert Unix timestamps to dates and back.' },
  { name: 'Test Card Generator', slug: 'test-card-generator', category: 'developer', icon: 'CreditCard', status: 'soon', engine: 'browser', description: 'Generate Luhn-valid test card numbers for checkout testing.' },
  { name: 'BIN Generator', slug: 'bin-generator', category: 'developer', icon: 'CreditCard', status: 'soon', engine: 'browser', description: 'Generate test BIN-based numbers for development use.' },

  // ---------- Security ----------
  { name: 'Password Generator', slug: 'password-generator', category: 'security', icon: 'KeyRound', status: 'soon', engine: 'browser', description: 'Generate strong, random, secure passwords online.' },
  { name: 'Password Strength Checker', slug: 'password-strength-checker', category: 'security', icon: 'Shield', status: 'soon', engine: 'browser', description: 'Check how strong a password is against common attacks.' },
  { name: 'Random Number Generator', slug: 'random-number-generator', category: 'security', icon: 'Dice5', status: 'soon', engine: 'browser', description: 'Generate random numbers within any range you choose.' },
  { name: 'Barcode Generator', slug: 'barcode-generator', category: 'security', icon: 'Barcode', status: 'soon', engine: 'browser', description: 'Create barcodes in common formats for free.' },

  // ---------- Business ----------
  { name: 'Invoice Generator', slug: 'invoice-generator', category: 'business', icon: 'Receipt', status: 'soon', engine: 'browser', description: 'Create and download professional PDF invoices for free.' },
  { name: 'Document Signer', slug: 'document-signer', category: 'business', icon: 'FileSignature', status: 'soon', engine: 'server', description: 'Sign documents and request signatures online.' },

  // ---------- Media ----------
  { name: 'Audio/Video Transcription', slug: 'transcription', category: 'media', icon: 'Captions', status: 'soon', engine: 'server', description: 'Transcribe audio and video files to text automatically.' },
  { name: 'Video Downloader', slug: 'video-downloader', category: 'media', icon: 'Download', status: 'soon', engine: 'server', description: 'Download video from popular platforms for personal use.' },
];

// ---- Helpers ----
export function getCategory(key) {
  return categories.find((c) => c.key === key);
}
export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug);
}
export function getTool(slug) {
  return tools.find((t) => t.slug === slug);
}
export function getToolsByCategory(key) {
  return tools.filter((t) => t.category === key);
}
export function getLiveTools() {
  return tools.filter((t) => t.status === 'live');
}
export function getRelatedTools(slug, limit = 4) {
  const tool = getTool(slug);
  if (!tool) return [];
  return tools
    .filter((t) => t.category === tool.category && t.slug !== slug)
    .slice(0, limit);
}
