// Daily limits for browser tools (files are processed on the visitor's device, never uploaded).
// Only the tool name, file count and file sizes are sent to the server so the use can be counted.
// Daily counts live in tool_limits (anon_limit = visitors, daily_limit = free accounts) so admin can change them.

export const LIMITED_BROWSER_TOOLS = [
  'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf', 'rotate-pdf', 'organize-pdf',
  'add-page-numbers', 'watermark-pdf', 'protect-pdf', 'unlock-pdf', 'sign-pdf',
  'compress-image', 'resize-image', 'crop-image', 'convert-image', 'rotate-image', 'image-to-text', 'image-upscaler',
];

export const isLimitedBrowserTool = (slug) => LIMITED_BROWSER_TOOLS.includes(slug);

// Defaults used when a tool has no tool_limits row yet.
export const DEFAULT_DAILY = { guest: 3, free: 5 };

// Per-file size and files-per-use caps by plan. Paid plans have no daily cap on these tools.
export const FILE_RULES = {
  guest: { maxMb: 10, maxFiles: 5, label: 'without an account' },
  free: { maxMb: 25, maxFiles: 10, label: 'on the free plan' },
  pro: { maxMb: 200, maxFiles: 50, label: 'on Pro' },
  business: { maxMb: 500, maxFiles: 100, label: 'on Business' },
};

export const PAID_PLANS = ['pro', 'business'];

// Server tools that take a file: what happens to it, shown on the tool page.
export const SERVER_FILE_NOTES = {
  'word-to-pdf': 'convert',
  'pdf-to-word': 'convert',
  'excel-to-pdf': 'convert',
  'pdf-to-excel': 'convert',
  'powerpoint-to-pdf': 'convert',
  'pdf-to-powerpoint': 'convert',
  'pdf-ocr': 'convert',
  'ebook-to-pdf': 'convert',
  'video-converter': 'convert',
  'audio-converter': 'convert',
  'video-to-mp3': 'convert',
  transcription: 'transcribe',
  'document-signer': 'store',
};
