// Craftora Insights (blog) posts.
// To add a post: copy one entry, change the fields, add it to the array (newest first).

export const posts = [
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
