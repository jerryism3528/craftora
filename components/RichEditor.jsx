'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';

export default function RichEditor({ value, onChange }) {
  const [mode, setMode] = useState('visual'); // visual | html
  const [html, setHtml] = useState(value || '');
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener', target: '_blank' } }),
      Image.configure({ HTMLAttributes: { class: 'article-img' } }),
      Placeholder.configure({ placeholder: 'Start writing your article here...' }),
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const h = editor.getHTML();
      setHtml(h);
      onChange(h);
    },
    editorProps: {
      attributes: { class: 'tiptap-content' },
    },
  });

  // Keep HTML textarea and editor in sync when switching modes.
  useEffect(() => {
    if (mode === 'visual' && editor) {
      if (editor.getHTML() !== html) editor.commands.setContent(html || '', false);
    }
  }, [mode]);

  const wordCount = (html || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  function applyHtmlChange(v) {
    setHtml(v);
    onChange(v);
  }

  async function uploadInline(e) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.ok) editor.chain().focus().setImage({ src: data.url, alt: '' }).run();
    } catch (e) {}
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function setLink() {
    const url = prompt('Enter the URL (use /merge-pdf for internal links):');
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  if (!editor) return null;

  const Btn = ({ onClick, active, title, children }) => (
    <button type="button" onClick={onClick} title={title}
      className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-sm font-bold"
      style={{ background: active ? 'var(--brand)' : 'transparent', color: active ? '#fff' : 'var(--ink)' }}>
      {children}
    </button>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <span className="muted text-sm">{wordCount} words ({readTime} min read)</span>
        <div className="flex gap-1">
          <button type="button" onClick={() => setMode('visual')} className="rounded-lg px-3 py-1.5 text-sm font-semibold inline-flex items-center gap-1" style={mode === 'visual' ? { background: 'var(--brand)', color: '#fff' } : { color: 'var(--ink)', border: '1px solid var(--line)' }}><Lucide.Eye className="w-4 h-4" /> Visual</button>
          <button type="button" onClick={() => setMode('html')} className="rounded-lg px-3 py-1.5 text-sm font-semibold inline-flex items-center gap-1" style={mode === 'html' ? { background: 'var(--brand)', color: '#fff' } : { color: 'var(--ink)', border: '1px solid var(--line)' }}><Lucide.Code className="w-4 h-4" /> HTML</button>
        </div>
      </div>

      <div className="border surface rounded-xl overflow-hidden" style={{ background: 'var(--surface)' }}>
        {mode === 'visual' ? (
          <>
            <div className="flex items-center gap-1 flex-wrap p-2 border-b surface">
              <select onChange={(e) => {
                const v = e.target.value;
                if (v === 'p') editor.chain().focus().setParagraph().run();
                else editor.chain().focus().toggleHeading({ level: Number(v) }).run();
              }} value={editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : 'p'}
                className="rounded-lg border surface px-2 py-1.5 text-sm bg-transparent mr-1" style={{ color: 'var(--ink)' }}>
                <option value="p">Normal</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
              </select>
              <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Lucide.Bold className="w-4 h-4" /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Lucide.Italic className="w-4 h-4" /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><Lucide.Underline className="w-4 h-4" /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Lucide.Strikethrough className="w-4 h-4" /></Btn>
              <span className="w-px h-6 mx-1" style={{ background: 'var(--line)' }} />
              <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><Lucide.ListOrdered className="w-4 h-4" /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><Lucide.List className="w-4 h-4" /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><Lucide.Quote className="w-4 h-4" /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block"><Lucide.Code2 className="w-4 h-4" /></Btn>
              <span className="w-px h-6 mx-1" style={{ background: 'var(--line)' }} />
              <Btn onClick={setLink} active={editor.isActive('link')} title="Add link"><Lucide.Link className="w-4 h-4" /></Btn>
              <button type="button" onClick={() => fileRef.current?.click()} title="Upload image" className="w-9 h-9 rounded-lg inline-flex items-center justify-center" style={{ color: 'var(--ink)' }}>
                {uploading ? <Lucide.Loader2 className="w-4 h-4 animate-spin" /> : <Lucide.Image className="w-4 h-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={uploadInline} className="hidden" />
              <Btn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting"><Lucide.RemoveFormatting className="w-4 h-4" /></Btn>
            </div>
            <EditorContent editor={editor} />
          </>
        ) : (
          <textarea value={html} onChange={(e) => applyHtmlChange(e.target.value)} rows={18} className="w-full p-4 text-sm bg-transparent font-mono" style={{ color: 'var(--ink)', outline: 'none', resize: 'vertical' }} placeholder="<p>Write or paste raw HTML here.</p>" />
        )}
      </div>
      <p className="muted text-xs mt-2">Visual mode: use the toolbar for headings, lists, links, and the image button to upload images into the article. HTML mode: paste or write raw HTML for tables and advanced formatting.</p>
    </div>
  );
}
