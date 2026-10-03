'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';

const MAX_MB = 100;
const ACCEPT = '.mp3,.wav,.m4a,.aac,.ogg,.oga,.flac,.wma,.opus,.amr,.aiff,.aif,.mp4,.mov,.mkv,.webm,.avi,.wmv,.flv,.m4v,.3gp,.mpeg,.mpg';
const LANGS = [
  ['', 'Auto-detect'], ['en', 'English'], ['ur', 'Urdu'], ['hi', 'Hindi'], ['ar', 'Arabic'], ['es', 'Spanish'],
  ['fr', 'French'], ['de', 'German'], ['pt', 'Portuguese'], ['ru', 'Russian'], ['tr', 'Turkish'], ['id', 'Indonesian'],
  ['bn', 'Bengali'], ['pa', 'Punjabi'], ['zh', 'Chinese'], ['ja', 'Japanese'], ['ko', 'Korean'], ['it', 'Italian'],
  ['nl', 'Dutch'], ['fa', 'Persian'],
];

function getDeviceId() {
  try {
    let id = localStorage.getItem('cdid');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('cdid', id); }
    document.cookie = `cdid=${id}; path=/; max-age=31536000; SameSite=Lax; Secure`;
    return id;
  } catch (e) { return ''; }
}

function stamp(sec, sep) {
  const ms = Math.max(0, Math.round(sec * 1000));
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(h)}:${p(m)}:${p(s)}${sep}${String(ms % 1000).padStart(3, '0')}`;
}
function short(sec) {
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
function toSrt(segs) {
  return segs.map((s, i) => `${i + 1}\n${stamp(s.start, ',')} --> ${stamp(s.end, ',')}\n${s.text}\n`).join('\n');
}
function toVtt(segs) {
  return 'WEBVTT\n\n' + segs.map((s) => `${stamp(s.start, '.')} --> ${stamp(s.end, '.')}\n${s.text}\n`).join('\n');
}

export default function TranscriptionTool() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | uploading | queued | running | done
  const [uploadPct, setUploadPct] = useState(0);
  const [progress, setProgress] = useState(0);
  const [ahead, setAhead] = useState(0);
  const [result, setResult] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [error, setError] = useState('');
  const [view, setView] = useState('text');
  const [copied, setCopied] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function pick(f) {
    setError(''); setResult(null);
    if (!f) return;
    const ext = '.' + (f.name.split('.').pop() || '').toLowerCase();
    if (!ACCEPT.split(',').includes(ext)) { setError('Please choose an audio file (MP3, WAV, M4A...) or a video (MP4, MOV, MKV...).'); return; }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`File is too large. The limit is ${MAX_MB} MB.`); return; }
    setFile(f);
  }

  function poll(id) {
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tools/transcribe?id=${id}`, { cache: 'no-store' });
        const data = await res.json();
        if (!data.ok) { setError(data.error || 'Lost track of this job.'); setPhase('idle'); return; }
        if (data.status === 'done') {
          setResult(data); setProgress(100); setPhase('done'); return;
        }
        if (data.status === 'error') { setError(data.error || 'Transcription failed.'); setPhase('idle'); return; }
        setPhase(data.status === 'running' ? 'running' : 'queued');
        setProgress(data.progress || 0);
        setAhead(data.ahead || 0);
        poll(id);
      } catch (e) {
        poll(id); // temporary network hiccup, keep trying
      }
    }, 2000);
  }

  function start() {
    if (!file) return;
    setError(''); setResult(null); setUploadPct(0); setProgress(0); setPhase('uploading');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('language', language);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/tools/transcribe');
    const did = getDeviceId();
    if (did) xhr.setRequestHeader('X-Device-Id', did);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setUploadPct(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      let data = null;
      try { data = JSON.parse(xhr.responseText); } catch (e) {}
      if (xhr.status >= 200 && xhr.status < 300 && data?.ok) {
        setRemaining(data.remaining);
        setPhase('queued');
        poll(data.id);
      } else {
        setError(data?.error || 'Upload failed. Please try again.');
        setPhase('idle');
      }
    };
    xhr.onerror = () => { setError('Network error during upload. Please try again.'); setPhase('idle'); };
    xhr.send(fd);
  }

  function reset() {
    clearTimeout(timer.current);
    setFile(null); setResult(null); setError(''); setPhase('idle'); setUploadPct(0); setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  }

  function download(content, ext, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = (file?.name || 'transcript').replace(/\.[^.]+$/, '') + '.' + ext;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function copyText() {
    navigator.clipboard.writeText(result?.text || '').then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }

  const size = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
  const busy = phase === 'uploading' || phase === 'queued' || phase === 'running';

  let barPct = 0, barLabel = '';
  if (phase === 'uploading') { barPct = uploadPct; barLabel = `Uploading ${uploadPct}%`; }
  if (phase === 'queued') { barPct = 0; barLabel = ahead > 0 ? `Waiting in line, ${ahead} ahead of you` : 'Starting...'; }
  if (phase === 'running') { barPct = progress; barLabel = `Transcribing ${progress}%`; }

  if (status === 'loading') {
    return <div className="border surface rounded-2xl p-8 text-center muted" style={{ background: 'var(--surface)' }}>Loading...</div>;
  }
  if (!session?.user) {
    return (
      <div className="border surface rounded-2xl p-8 text-center" style={{ background: 'var(--surface)' }}>
        <Lucide.Lock className="w-8 h-8 mx-auto mb-4 brand-text" />
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>Sign in to transcribe audio and video</h3>
        <p className="muted text-sm mb-5 max-w-md mx-auto">Transcription runs on our servers, so a free account is needed. You get 30 minutes of transcription per day, with text and subtitle downloads.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="rounded-xl px-5 py-2.5 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>Sign in</Link>
          <Link href="/signup" className="rounded-xl px-5 py-2.5 font-semibold text-sm border surface" style={{ color: 'var(--ink)' }}>Create account</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-xl px-4 py-3 text-sm mb-5 flex gap-2" style={{ background: 'var(--surface-soft)', color: 'var(--ink)' }}>
        <Lucide.Info className="w-4 h-4 shrink-0 mt-0.5 brand-text" />
        <span>You get 30 minutes of transcription per day. Processing takes about 1 minute for every 2 to 3 minutes of audio. You can keep this tab open while it works.</span>
      </div>

      {remaining !== null && phase !== 'idle' && (
        <p className="muted text-sm text-right mb-2">{remaining} minutes left today</p>
      )}

      {!file ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
          className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer text-center"
          style={{ background: 'var(--surface)', borderColor: drag ? 'var(--brand)' : 'var(--line, #d6d9e6)' }}
        >
          <Lucide.Captions className="w-10 h-10 mb-3 brand-text" />
          <span className="font-bold" style={{ color: 'var(--ink)' }}>Choose an audio or video file, or drop it here</span>
          <span className="muted text-sm mt-1">MP3, WAV, M4A, OGG, FLAC, MP4, MOV, MKV, WEBM and more, up to {MAX_MB} MB</span>
          <input ref={inputRef} type="file" accept={ACCEPT} onChange={(e) => pick(e.target.files?.[0])} className="hidden" />
        </label>
      ) : (
        <div className="border surface rounded-2xl p-5" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center gap-3">
            <Lucide.FileAudio className="w-8 h-8 brand-text shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>{file.name}</p>
              <p className="muted text-xs">{size(file.size)}</p>
            </div>
            {!busy && <button onClick={reset} className="muted" title="Remove"><Lucide.X className="w-5 h-5" /></button>}
          </div>

          {phase === 'idle' && (
            <>
              <div className="mt-5 max-w-xs">
                <p className="text-xs font-bold uppercase tracking-wide muted mb-2">Spoken language</p>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-lg border surface px-3 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }}>
                  {LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <button onClick={start} className="mt-6 w-full rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center justify-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
                <Lucide.Captions className="w-4 h-4" /> Transcribe
              </button>
            </>
          )}

          {busy && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}><Lucide.Loader2 className="w-4 h-4 animate-spin" /> {barLabel}</span>
                {phase !== 'queued' && <span className="font-bold brand-text">{barPct}%</span>}
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-soft)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${phase === 'queued' ? 4 : barPct}%`, background: 'var(--brand)' }} />
              </div>
              <p className="muted text-xs mt-2">{phase === 'uploading' ? 'Step 1 of 2: uploading your file.' : 'Step 2 of 2: converting speech to text.'}</p>
            </div>
          )}
        </div>
      )}

      {error && <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#e5484d' }}>{error}</div>}

      {phase === 'done' && result && (
        <div className="mt-6 border surface rounded-2xl p-5" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Lucide.CircleCheck className="w-5 h-5" style={{ color: '#0f9d76' }} />
              <span className="font-bold text-sm" style={{ color: 'var(--ink)' }}>Done: {short(result.duration)} of audio{result.language ? `, language: ${result.language.toUpperCase()}` : ''}</span>
            </div>
            <div className="flex gap-2">
              {['text', 'timestamps'].map((v) => (
                <button key={v} onClick={() => setView(v)} className="rounded-lg px-3 py-1.5 text-xs font-semibold border surface capitalize"
                  style={view === v ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>{v}</button>
              ))}
            </div>
          </div>

          {view === 'text' ? (
            <textarea readOnly value={result.text || '(No speech detected)'} rows={10} className="w-full rounded-xl border surface p-4 text-sm bg-transparent leading-6" style={{ color: 'var(--ink)' }} />
          ) : (
            <div className="rounded-xl border surface p-4 max-h-80 overflow-y-auto space-y-2">
              {(result.segments || []).map((s, i) => (
                <p key={i} className="text-sm" style={{ color: 'var(--ink)' }}>
                  <span className="font-mono text-xs brand-text mr-2">{short(s.start)}</span>{s.text}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={copyText} className="rounded-lg px-4 py-2 text-sm font-bold inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
              {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy text</>}
            </button>
            <button onClick={() => download(result.text || '', 'txt', 'text/plain')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}><Lucide.Download className="w-4 h-4" /> TXT</button>
            <button onClick={() => download(toSrt(result.segments || []), 'srt', 'application/x-subrip')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}><Lucide.Download className="w-4 h-4" /> SRT subtitles</button>
            <button onClick={() => download(toVtt(result.segments || []), 'vtt', 'text/vtt')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}><Lucide.Download className="w-4 h-4" /> VTT subtitles</button>
            <button onClick={reset} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={{ color: 'var(--ink)' }}>Transcribe another</button>
          </div>
        </div>
      )}

      <p className="muted text-xs mt-6">Your file is processed on our server and deleted as soon as the transcript is ready. Transcripts expire after 1 hour, so download what you need.</p>
    </div>
  );
}
