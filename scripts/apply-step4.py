#!/usr/bin/env python3
"""Craftora step 4: dashboard links, homepage meta description, share image, HSTS.
Safe to run more than once. Run from ~/craftora:  python3 scripts/apply-step4.py
"""
import os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
report = []

def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def write(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

# 1. Header: add "SEO Dashboard" under "Profile" (desktop menu and mobile menu)
p = 'components/Header.jsx'
s = read(p)
if '/account/seo' in s:
    report.append('Header: already has SEO Dashboard link')
else:
    out, added = [], 0
    for line in s.split('\n'):
        out.append(line)
        if 'href="/profile"' in line and 'setAcctOpen(false)' in line:
            out.append(line.replace('href="/profile"', 'href="/account/seo"').replace('<Lucide.User ', '<Lucide.Gauge ').replace('> Profile</Link>', '> SEO Dashboard</Link>'))
            added += 1
        elif 'href="/profile"' in line and 'setMobileOpen(false)' in line:
            out.append(line.replace('href="/profile"', 'href="/account/seo"').replace('>Profile</Link>', '>SEO Dashboard</Link>'))
            added += 1
    write(p, '\n'.join(out))
    report.append(f'Header: added {added} SEO Dashboard links (expected 2)')

# 2. Profile page: quick link under the heading
p = 'app/profile/page.js'
s = read(p)
if '/account/seo' in s:
    report.append('Profile: already has SEO Dashboard link')
else:
    link = ('        <div className="mt-3 flex flex-wrap gap-2"><a href="/account/seo" className="inline-flex items-center gap-1.5 px-3 py-1.5 '
            'rounded-lg border text-sm font-semibold hover:soft-surface" style={{ color: \'var(--ink)\' }}><Lucide.Gauge className="w-4 h-4" /> SEO Dashboard</a></div>')
    out, added = [], 0
    for line in s.split('\n'):
        out.append(line)
        if '>Your profile</h1>' in line and not added:
            out.append(link)
            added = 1
    write(p, '\n'.join(out))
    report.append('Profile: added SEO Dashboard link' if added else 'Profile: heading not found, skipped')

# 3. Layout: shorter homepage description + metadataBase
p = 'app/layout.js'
s = read(p)
old_desc = "'Craftora is a free online tools suite: merge PDF, compress images, convert files, verify emails, run SEO audits, and more. Privacy-first, no signup, no watermarks. Fast browser-based tools that just work.'"
new_desc = "'Free online tools to merge PDFs, compress images, convert files, verify emails, and audit SEO. Privacy-first, no signup, no watermarks.'"
if old_desc in s:
    s = s.replace(old_desc, new_desc)
    report.append(f'Layout: meta description shortened to {len(new_desc) - 2} characters')
else:
    report.append('Layout: old description not found (already changed?)')
if 'metadataBase' not in s:
    s, n = re.subn(r'export const metadata\s*=\s*\{', "export const metadata = {\n  metadataBase: new URL('https://craftora.dev'),", s, count=1)
    report.append('Layout: added metadataBase' if n else 'Layout: metadata export not found, metadataBase NOT added')
else:
    report.append('Layout: metadataBase already set')
write(p, s)

# 4. Share image on every page that defines its own openGraph block
IMG = "images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], "
patched = 0
for f in glob.glob('app/**/*.js', recursive=True):
    if '/api/' in f.replace('\\', '/'):
        continue
    s = read(f)
    if 'openGraph' not in s:
        continue
    out, i, changed = [], 0, False
    for m in re.finditer(r'openGraph:\s*\{', s):
        start = m.end()
        depth, j = 1, start
        while j < len(s) and depth:
            if s[j] == '{': depth += 1
            elif s[j] == '}': depth -= 1
            j += 1
        block = s[start:j]
        if 'images' in block:
            continue
        out.append(s[i:start])
        out.append(' ' + IMG)
        i = start
        changed = True
    if changed:
        out.append(s[i:])
        write(f, ''.join(out))
        patched += 1
report.append(f'Share image: added to openGraph in {patched} files')

# 5. HSTS header through Traefik
p = 'docker-compose.yml'
s = read(p)
if 'stsSeconds' in s:
    report.append('HSTS: already configured')
else:
    out, added = [], False
    for line in s.split('\n'):
        out.append(line)
        if 'traefik.http.services.craftora.loadbalancer.server.port' in line and not added:
            indent = line[:len(line) - len(line.lstrip())]
            out.append(f'{indent}- "traefik.http.middlewares.craftora-hsts.headers.stsSeconds=31536000"')
            out.append(f'{indent}- "traefik.http.routers.craftora.middlewares=craftora-hsts"')
            added = True
    write(p, '\n'.join(out))
    report.append('HSTS: added Traefik labels' if added else 'HSTS: service label not found, skipped')

print('\n'.join(report))
