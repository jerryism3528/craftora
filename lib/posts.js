// Craftora Insights (blog) posts.
// To add a post: copy one entry, change the fields, add it to the array (newest first).

export const posts = [
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
