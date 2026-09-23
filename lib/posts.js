// Craftora Insights (blog) posts.
// To add a post: copy one entry, change the fields, add it to the array (newest first).

export const posts = [
  {
    slug: 'jpg-vs-png-vs-webp',
    title: 'JPG vs PNG vs WebP: Which Image Format Should You Use? (2026 Guide)',
    description:
      'JPG vs PNG vs WebP explained simply. Learn the real differences, when to use each image format, and how to convert between them free, so your images look great and load fast.',
    keywords: ['jpg vs png', 'png vs webp', 'webp vs jpg', 'jpg vs png vs webp', 'which image format', 'best image format for web', 'difference between jpg and png'],
    date: '2026-09-23',
    author: 'Maria V.',
    excerpt:
      'JPG, PNG, and WebP all store images, but picking the wrong one gives you blurry photos, huge files, or lost transparency. Here is exactly when to use each, in plain English.',
    body: [
      { p: 'You export an image and get asked: JPG, PNG, or WebP? Most people just pick whatever is default and move on. But that one choice quietly decides how sharp your image looks, how big the file is, whether it keeps a transparent background, and how fast your web page loads. Pick wrong and you end up with a blurry logo, a 5 MB photo that will not attach to an email, or a missing background.' },
      { p: 'The good news is the rules are simple once you understand what each format is actually good at. This guide breaks down JPG vs PNG vs WebP in plain language, tells you exactly when to use each one, and shows you how to convert between them for free.' },
      { h2: 'The quick answer' },
      { p: 'If you want the short version: use JPG for photos, use PNG when you need a transparent background or crisp text and lines, and use WebP when you are putting images on a website and want them to load fast. The rest of this guide explains why, and covers the edge cases where the quick answer is not enough.' },
      { h2: 'What is a JPG?' },
      { p: 'JPG (also written JPEG) is the format built for photographs. It uses lossy compression, which means it throws away small details your eye is unlikely to notice in order to make the file much smaller. That is why a detailed photo saved as JPG can be a fraction of the size of the same photo saved as PNG.' },
      { p: 'The tradeoff is that JPG does not support transparency, and if you compress it too hard you start to see blocky artifacts, especially around sharp edges and text. JPG is perfect for camera photos, complex images with lots of colors, and anything where a slightly smaller file matters more than pixel-perfect edges.' },
      { ul: [
        'Best for: photographs, complex or colorful images, email attachments, and social media posts.',
        'Avoid for: logos, screenshots with text, or anything needing a transparent background.',
      ] },
      { h2: 'What is a PNG?' },
      { p: 'PNG uses lossless compression, so it keeps every pixel exactly as it was. Nothing is thrown away. That makes PNG the right choice when sharpness matters: logos, icons, screenshots, diagrams, and any image with hard edges or text. PNG also supports transparency, so you can have a logo with no background that sits cleanly on any color.' },
      { p: 'The downside is size. Because PNG keeps all the detail, a photo saved as PNG can be several times larger than the same photo as JPG. So PNG is excellent for graphics and transparency, but a poor choice for large photographs where that extra size buys you nothing you can actually see.' },
      { ul: [
        'Best for: logos, icons, screenshots, graphics with text, and images that need a transparent background.',
        'Avoid for: large photographs, where it creates needlessly huge files.',
      ] },
      { h2: 'What is WebP?' },
      { p: 'WebP is the modern format built by Google specifically for the web. Its trick is that it can do both jobs: it supports lossy compression like JPG and lossless with transparency like PNG, and at similar quality it usually produces noticeably smaller files than either. A WebP image can often be 25 to 35 percent smaller than the same JPG, and much smaller than a PNG.' },
      { p: 'Smaller files mean faster page loads, which visitors and search engines both reward. Every current browser supports WebP now, so for images you are putting on a website, WebP is usually the smartest choice. The main time to avoid it is when you are sending a file to someone who needs to open it in older software that may not recognize WebP, in which case JPG or PNG is safer.' },
      { ul: [
        'Best for: images on websites and web apps where load speed matters.',
        'Avoid for: sharing with older software or workflows that do not support WebP yet.',
      ] },
      { h2: 'JPG vs PNG vs WebP: side by side' },
      { ul: [
        'Photos: JPG is the classic choice, WebP is smaller at the same quality. PNG is overkill.',
        'Logos and graphics with transparency: PNG is the safe standard, WebP can do it smaller for web use.',
        'Screenshots and text: PNG keeps text crisp. JPG can make text look fuzzy.',
        'Website speed: WebP wins, then JPG, with PNG usually the largest.',
        'Universal compatibility: JPG and PNG open everywhere, including old software. WebP is web-first.',
      ] },
      { h2: 'How to convert between JPG, PNG, and WebP' },
      { p: 'Once you know which format you need, converting is quick and free. Craftora\u2019s converter runs entirely in your browser, so your images are never uploaded to a server.' },
      { tool: 'convert-image', label: 'Open the free Image Converter' },
      { p: 'For example, convert a heavy PNG photo to JPG or WebP to shrink it for email, or convert a JPG logo to PNG if you need to work with transparency. You can convert many images at once and download them together.' },
      { h2: 'Reduce file size without changing format' },
      { p: 'Sometimes you do not need a different format, you just need the file to be smaller. If a JPG photo is too big to upload or email, compressing it keeps the same format while cutting the size, and you control how much quality to keep.' },
      { tool: 'compress-image', label: 'Open the free Image Compressor' },
      { p: 'And if the image is simply larger in dimensions than you need, for example a 4000 pixel wide photo going onto a website, resizing it down is often the biggest single size saving you can make.' },
      { tool: 'resize-image', label: 'Open the free Image Resizer' },
      { h2: 'Which format should you use? A simple checklist' },
      { ul: [
        'It is a photo going in an email or a post: use JPG, or WebP if the recipient supports it.',
        'It is a logo, icon, or screenshot: use PNG to keep it sharp, or when you need transparency.',
        'It is going on a website and speed matters: use WebP.',
        'You need it to open in older software: stick with JPG or PNG.',
        'It is going to be a website icon: generate a proper favicon set instead of using a single image.',
      ] },
      { tool: 'favicon-generator', label: 'Open the free Favicon Generator' },
      { h2: 'The bottom line' },
      { p: 'JPG, PNG, and WebP are not better or worse than each other, they are built for different jobs. JPG is for photos, PNG is for graphics and transparency, and WebP is the modern all-rounder for the web. Match the format to the job and your images will look great and load fast. When you need to switch between them, Craftora\u2019s free browser-based tools make it a few clicks, with nothing uploaded and no watermarks.' },
    ],
    related: ['convert-image', 'compress-image', 'resize-image'],
  },
  {
    slug: 'how-to-compress-pdf-without-losing-quality',
    title: 'How to Compress a PDF Without Losing Quality (2026 Guide)',
    description:
      'Learn how to compress a PDF without losing quality. A clear, step-by-step guide to reducing PDF file size for email and upload, free and private, with the text kept sharp.',
    keywords: ['compress pdf without losing quality', 'reduce pdf file size', 'compress pdf', 'shrink pdf', 'make pdf smaller', 'compress pdf free'],
    date: '2026-09-20',
    author: 'Maria V.',
    excerpt:
      'A large PDF is a pain to email or upload, but most compressors either barely shrink it or turn your crisp text into a blurry mess. Here is how to reduce PDF file size while keeping it looking clean.',
    body: [
      { p: 'You have a PDF that is too big to email or upload, so you run it through a free compressor. One of two things usually happens. Either the file barely shrinks, or it shrinks a lot but the text comes out soft and fuzzy. Neither is what you wanted.' },
      { p: 'The good news is that compressing a PDF without wrecking its quality is completely doable once you understand the one tradeoff at the heart of it. This guide walks through exactly how PDF compression works, how to keep your text sharp, and how to get the smallest possible file for the job.' },
      { h2: 'Why PDF files get so large in the first place' },
      { p: 'Most oversized PDFs are big for one reason: images. A PDF made from a Word document with a few photos, a scanned contract, or a design exported from Canva or Photoshop can easily balloon to many megabytes, because every image is stored at full resolution. Text, by contrast, takes up almost no space. So when a PDF is huge, it is nearly always the images, not the words, causing it.' },
      { p: 'This matters because it tells you where the savings come from. To meaningfully shrink a PDF, you have to do something about the images. That is where the quality question comes in.' },
      { h2: 'The one tradeoff behind every PDF compressor' },
      { p: 'There are two honest ways to compress a PDF, and every tool uses one or the other.' },
      { ul: [
        'Lossless (structure only): the file is repacked and hidden bloat like old metadata is stripped out, but nothing visible changes. Your text stays perfectly sharp and selectable. The catch is that the savings are modest, often just a few percent, because the images are left untouched.',
        'Lossy (image compression): the images inside the PDF are re-encoded at a lower quality to make them much smaller. This is where the big savings come from, often 40 to 70 percent. The tradeoff is that pushing the quality too low makes images and text look soft.',
      ] },
      { p: 'The trick to compressing without losing quality is not avoiding lossy compression. It is using it at the right strength, so the file gets dramatically smaller while still looking clean to the eye.' },
      { h2: 'How to compress a PDF without losing quality, step by step' },
      { p: 'Craftora\u2019s free Compress PDF tool runs entirely in your browser, so your file is never uploaded to a server. It gives you control over exactly this tradeoff.' },
      { tool: 'compress-pdf', label: 'Open the free Compress PDF tool' },
      { ul: [
        'Add your PDF by dropping it into the box or choosing it from your device.',
        'If your PDF is text-heavy and you need the text to stay selectable, choose Light compression. It keeps everything sharp and still trims the file.',
        'If your PDF is image-heavy or scanned and you need a big size reduction, choose Strong compression.',
        'In Strong mode, start with the Better quality setting. It shrinks the file a lot while keeping images looking clean. Only drop to Balanced or Smaller file if you need it even smaller.',
        'Click Compress, check the before and after sizes, and download your smaller PDF.',
      ] },
      { h2: 'Which setting should you use?' },
      { p: 'If you are sending a document where the words matter most, like a resume, a report, or a contract you want to keep searchable, use Light compression so the text stays selectable and razor sharp. If you are dealing with a scanned document, a photo-heavy brochure, or anything where getting under an email limit matters more than perfect crispness, use Strong compression with Better quality. That combination is where most people find the sweet spot: a much smaller file that still looks professional.' },
      { h2: 'Why compress in your browser instead of uploading?' },
      { p: 'Popular sites like iLovePDF and Smallpdf upload your PDF to their servers to compress it. For a private contract, an ID scan, or an internal report, that means your document leaves your device and sits on someone else\u2019s server. Craftora compresses the file right in your browser, so it never gets uploaded anywhere. It is also faster, since there is no upload and download round trip, and there are no daily limits or watermarks on the free tool.' },
      { h2: 'Quick tips to keep quality high' },
      { ul: [
        'Always try Better quality first. You can re-run with a smaller setting in seconds if you need more shrink.',
        'For documents that are mostly text, Light compression plus keeping the file as-is is often all you need.',
        'If a file barely shrinks in Light mode, that is normal. It means the PDF is already efficient, or the size is coming from images that only Strong mode can compress.',
        'Compressing an already-compressed PDF again rarely helps and can hurt quality. Start from the original when you can.',
      ] },
      { h2: 'Related free PDF tools' },
      { p: 'Once your PDF is the right size, you might also want to combine it with others, or pull out just a few pages. Craftora has free, browser-based tools for both, with no upload required.' },
    ],
    related: ['compress-pdf', 'merge-pdf', 'split-pdf'],
  },
  {
    slug: 'how-to-merge-pdf-files-free',
    title: 'How to Merge PDF Files for Free (2026 Guide)',
    description:
      'Learn how to merge PDF files for free in your browser. Combine multiple PDFs into one document in seconds, with no signup, no watermarks, and full privacy.',
    keywords: ['merge pdf', 'combine pdf', 'how to merge pdf files', 'merge pdf free', 'join pdf files', 'combine pdf online'],
    date: '2026-09-18',
    author: 'Maria V.',
    excerpt:
      'Combining several PDFs into one file used to mean paid software or uploading private documents to a stranger server. Here is the faster, safer way to merge PDF files for free.',
    body: [
      { p: 'Combining several PDF files into one clean document is one of the most common everyday tasks, and one of the most frustrating. Many free tools cap you at a few files a day, stamp a watermark on the result, or make you sign up first. Worse, most of them upload your private documents to their servers to do the job.' },
      { p: 'There is a better way. With a browser-based tool, you can merge PDF files for free, in seconds, without any of your files ever leaving your device. Here is exactly how to do it.' },
      { h2: 'The fastest way to merge PDF files for free' },
      { p: 'Craftora free tool combines your PDFs directly in your browser, so nothing is uploaded and there are no limits or watermarks.' },
      { tool: 'merge-pdf', label: 'Open the free Merge PDF tool' },
      { h2: 'Step by step: how to combine PDFs into one file' },
      { ul: [
        'Open the Merge PDF tool and drop your PDF files into the box, or choose them from your device.',
        'Use the up and down arrows to put the files in the exact order you want them combined.',
        'Remove any file you added by mistake with the X button.',
        'Click Merge PDFs and download, and your single combined PDF downloads instantly.',
      ] },
      { h2: 'Why merge PDFs in your browser instead of uploading them?' },
      { p: 'Popular sites like iLovePDF and Smallpdf upload every file you give them to their servers before processing. That works, but it means your documents (contracts, invoices, IDs, anything) leave your computer. Craftora merges the files on your own device, so they stay private. It is also faster, because there is no upload and download round trip.' },
      { h2: 'Is it really free?' },
      { p: 'Yes. There is no signup, no daily limit, and no watermark added to your merged PDF. It works the same on desktop, tablet, and phone.' },
      { h2: 'Related free PDF tools' },
      { p: 'Once your PDFs are combined, you may want to shrink the file for email, or split out a few pages. Craftora has free browser-based tools for those too, no upload required.' },
    ],
    related: ['merge-pdf', 'compress-pdf', 'split-pdf'],
  },
];

export function getPost(slug) {
  return posts.find((p) => p.slug === slug);
}

export function getAllPosts() {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}
