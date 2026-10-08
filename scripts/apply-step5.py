#!/usr/bin/env python3
"""Craftora step 5: Document Signer wiring. Safe to run more than once.
Run from ~/craftora:  python3 scripts/apply-step5.py
"""
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
report = []

def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def write(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

# 1. Header: "My Documents" under "SEO Dashboard" (desktop and mobile)
p = 'components/Header.jsx'
s = read(p)
if '/account/documents' in s:
    report.append('Header: already has My Documents link')
else:
    out, added = [], 0
    for line in s.split('\n'):
        out.append(line)
        if 'href="/account/seo"' in line:
            out.append(line.replace('href="/account/seo"', 'href="/account/documents"').replace('<Lucide.Gauge ', '<Lucide.FileSignature ').replace('SEO Dashboard</Link>', 'My Documents</Link>'))
            added += 1
    write(p, '\n'.join(out))
    report.append(f'Header: added {added} My Documents links (expected 2)')

# 2. Profile page quick link
p = 'app/profile/page.js'
s = read(p)
if '/account/documents' in s:
    report.append('Profile: already has My Documents link')
elif '> SEO Dashboard</a></div>' in s:
    link = ('<a href="/account/documents" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold hover:soft-surface" '
            'style={{ color: \'var(--ink)\' }}><Lucide.FileSignature className="w-4 h-4" /> My Documents</a>')
    s = s.replace('> SEO Dashboard</a></div>', '> SEO Dashboard</a>' + link + '</div>', 1)
    write(p, s)
    report.append('Profile: added My Documents link')
else:
    report.append('Profile: SEO Dashboard link not found, skipped')

# 3. Tool catalog: Document Signer goes live
p = 'lib/tools.js'
s = read(p)
old = "slug: 'document-signer', category: 'business', icon: 'FileSignature', status: 'soon'"
if old in s:
    s = s.replace(old, "slug: 'document-signer', category: 'business', icon: 'FileSignature', status: 'live'")
    write(p, s)
    report.append('Tools: Document Signer is now live')
elif "slug: 'document-signer'" in s and "status: 'live'" in [l for l in s.split('\n') if "slug: 'document-signer'" in l][0]:
    report.append('Tools: Document Signer already live')
else:
    report.append('Tools: document-signer line not found, CHECK lib/tools.js')

# 4. package.json: signature font
p = 'package.json'
pkg = json.loads(read(p))
if '@fontsource/dancing-script' in pkg.get('dependencies', {}):
    report.append('package.json: font already added')
else:
    pkg['dependencies']['@fontsource/dancing-script'] = '5.1.0'
    write(p, json.dumps(pkg, indent=2) + '\n')
    report.append('package.json: added @fontsource/dancing-script')

# 5. docker-compose.yml: storage volume for documents
p = 'docker-compose.yml'
s = read(p)
if 'craftora_docs' in s:
    report.append('Volume: already configured')
else:
    out, svc, top = [], False, False
    for line in s.split('\n'):
        out.append(line)
        if 'craftora_images:/app/storage/images' in line and not svc:
            out.append(line.replace('craftora_images:/app/storage/images', 'craftora_docs:/app/storage/docs'))
            svc = True
        elif line.strip() == 'craftora_images:' and not top:
            out.append(line.replace('craftora_images:', 'craftora_docs:'))
            top = True
    write(p, '\n'.join(out))
    report.append(f'Volume: service mount {"added" if svc else "NOT FOUND"}, volume definition {"added" if top else "NOT FOUND"}')

# 6. robots.txt: verify page sitemap
p = 'public/robots.txt'
s = read(p)
line = 'Sitemap: https://craftora.dev/verify-document/sitemap.xml'
if line in s:
    report.append('robots.txt: already lists verify sitemap')
else:
    write(p, s.rstrip('\n') + '\n' + line + '\n')
    report.append('robots.txt: added verify sitemap')

# 7. llms.txt: describe the new tools for AI search
p = 'public/llms.txt'
if os.path.exists(p):
    s = read(p)
    if '/document-signer' in s:
        report.append('llms.txt: already mentions Document Signer')
    else:
        s = s.rstrip('\n') + ('\n\n## E-signatures\n'
            '- [Document Signer](https://craftora.dev/document-signer): Free e-signature tool. Upload a PDF, add up to 10 signers, place signature fields, send by email, track status, and get a signed PDF with a certificate of completion.\n'
            '- [Verify Document](https://craftora.dev/verify-document): Check that a PDF signed with Craftora Sign is authentic and unchanged.\n'
            '- [SEO Audit Checklist](https://craftora.dev/seo-audit/checks): 52 SEO checks, each with a step-by-step fix guide.\n')
        write(p, s)
        report.append('llms.txt: added E-signatures section')

# 8. .env: confirm the noreply mailbox password exists (value is never printed)
env = read('.env') if os.path.exists('.env') else ''
report.append('Env: NOREPLY_SMTP_PASS is set' if 'NOREPLY_SMTP_PASS=' in env and 'NOREPLY_SMTP_PASS=\n' not in env else 'Env: NOREPLY_SMTP_PASS MISSING (invites will be sent from support@ instead)')

print('\n'.join(report))
