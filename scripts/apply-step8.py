#!/usr/bin/env python3
"""Craftora step 8: Donate buttons go to /support, sitemaps, llms.txt. Safe to run more than once.
Run from ~/craftora:  python3 scripts/apply-step8.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
report = []

def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def write(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

# 1. Header and Footer: Donate (external GoFundMe link) becomes Support (our /support page)
for p in ['components/Header.jsx', 'components/Footer.jsx']:
    if not os.path.exists(p):
        report.append(f'{p}: not found, skipped')
        continue
    s = read(p)
    n_links = s.count('href={DONATE_URL}')
    if not n_links:
        report.append(f'{p}: already points to /support')
        continue
    s = s.replace('href={DONATE_URL} target="_blank" rel="noopener noreferrer"', 'href="/support"')
    s = s.replace('href={DONATE_URL}', 'href="/support"')
    s = re.sub(r'^(\s*)Donate\s*$', r'\1Support', s, flags=re.M)
    write(p, s)
    report.append(f'{p}: {n_links} Donate button(s) now open /support')

# 2. robots.txt sitemaps
p = 'public/robots.txt'
s = read(p)
line = 'Sitemap: https://craftora.dev/support/sitemap.xml'
if line not in s:
    write(p, s.rstrip('\n') + '\n' + line + '\n')
    report.append('robots.txt: added support sitemap')
else:
    report.append('robots.txt: support sitemap already listed')
s = read(p)
line = 'Sitemap: https://craftora.dev/supporters/sitemap.xml'
if line not in s:
    write(p, s.rstrip('\n') + '\n' + line + '\n')
    report.append('robots.txt: added supporters sitemap')

# 3. llms.txt
p = 'public/llms.txt'
if os.path.exists(p):
    s = read(p)
    if '/support)' not in s:
        s = s.rstrip('\n') + ('\n- [Support Craftora](https://craftora.dev/support): Ways to support the free tools: campaign backing, monthly membership, or a one-time donation.\n'
                              '- [Founding Supporters](https://craftora.dev/supporters): The people and companies who keep Craftora free.\n')
        write(p, s)
        report.append('llms.txt: added support pages')

# 4. Folder for wall photos inside the images volume
report.append('Wall photos are stored in /app/storage/images/wall (inside the existing images volume)')

print('\n'.join(report))
