#!/usr/bin/env python3
"""Craftora step 6: company details (GE Promo Hub LLC), About page wiring. Safe to run more than once.
Run from ~/craftora:  python3 scripts/apply-step6.py
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

def add_import(s, line):
    if line in s:
        return s
    lines = s.split('\n')
    last = -1
    for i, l in enumerate(lines):
        if l.startswith('import '):
            last = i
    if last == -1:
        # after 'use client' if present, else at top
        idx = 1 if lines and lines[0].strip().strip(';') in ("'use client'", '"use client"') else 0
        lines.insert(idx, line)
    else:
        # handle multi-line imports: move to the line that ends the statement
        j = last
        while j < len(lines) and not re.search(r"from\s+['\"][^'\"]+['\"];?\s*$|^import\s+['\"][^'\"]+['\"];?\s*$", lines[j]):
            j += 1
        lines.insert(min(j, len(lines) - 1) + 1, line)
    return '\n'.join(lines)

# 1. Footer: legal line + Organization schema on every page
footer = next((p for p in ['components/Footer.jsx', 'components/Footer.js'] if os.path.exists(p)), None)
if not footer:
    report.append('Footer: components/Footer.jsx NOT FOUND, skipped')
else:
    s = read(footer)
    if '<CompanyLegal' in s:
        report.append('Footer: already shows company details')
    elif '</footer>' in s:
        i = s.rfind('</footer>')
        s = s[:i] + '<CompanyLegal />' + s[i:]
        s = add_import(s, "import CompanyLegal from './CompanyLegal';")
        write(footer, s)
        report.append('Footer: added company line and Organization schema')
    else:
        report.append('Footer: no </footer> tag found, skipped (send me the file)')

# 2. Privacy and Terms pages: "Who we are" box under the heading
for kind, cands in [('privacy', ['app/privacy/page.js', 'app/privacy-policy/page.js']),
                    ('terms', ['app/terms/page.js', 'app/terms-of-service/page.js', 'app/terms-and-conditions/page.js'])]:
    p = next((c for c in cands if os.path.exists(c)), None)
    if not p:
        report.append(f'{kind.title()}: page not found, skipped')
        continue
    s = read(p)
    if '<CompanyNotice' in s:
        report.append(f'{kind.title()}: already has company notice ({p})')
        continue
    if '</h1>' not in s:
        report.append(f'{kind.title()}: no <h1> found in {p}, skipped (send me the file)')
        continue
    s = s.replace('</h1>', f'</h1>\n<CompanyNotice kind="{kind}" />', 1)
    depth = p.count('/')
    s = add_import(s, f"import CompanyNotice from '{'../' * depth}components/CompanyNotice';")
    write(p, s)
    report.append(f'{kind.title()}: added company notice ({p})')

# 3. Layout: X/Twitter handle in default metadata, report any existing Organization schema
p = 'app/layout.js'
s = read(p)
if "@craftoraaa" in s:
    report.append('Layout: X handle already set')
else:
    m = re.search(r'twitter:\s*\{', s)
    if m:
        block_end = s.find('}', m.end())
        block = s[m.end():block_end]
        if re.search(r'\bsite\s*:', block):
            report.append('Layout: twitter.site already set to another value, left unchanged')
        else:
            s = s[:m.end()] + " site: '@craftoraaa', creator: '@craftoraaa'," + s[m.end():]
            report.append('Layout: added X handle to twitter metadata')
    else:
        s2, n = re.subn(r'(metadataBase:\s*new URL\([^)]*\),)', r"\1\n  twitter: { card: 'summary_large_image', site: '@craftoraaa', creator: '@craftoraaa' },", s, count=1)
        if n:
            s = s2
            report.append('Layout: added twitter metadata with X handle')
        else:
            report.append('Layout: metadataBase not found, X handle NOT added')
    write(p, s)
if re.search(r"""['"]@type['"]\s*:\s*['"]Organization['"]""", s):
    report.append('Layout: NOTE an Organization schema already exists in layout.js, send me that block so I can merge it')

# 4. robots.txt: About sitemap
p = 'public/robots.txt'
s = read(p)
line = 'Sitemap: https://craftora.dev/about/sitemap.xml'
if line in s:
    report.append('robots.txt: already lists About sitemap')
else:
    write(p, s.rstrip('\n') + '\n' + line + '\n')
    report.append('robots.txt: added About sitemap')

# 5. llms.txt: company info for AI search
p = 'public/llms.txt'
if os.path.exists(p):
    s = read(p)
    if 'GE Promo Hub LLC' in s:
        report.append('llms.txt: already has company info')
    else:
        s = s.rstrip('\n') + ('\n\n## Company\n'
            '- [About Craftora](https://craftora.dev/about): Craftora is a product of GE Promo Hub LLC, a Florida limited liability company led by Maria Vindell (Founder and CEO). '
            'Address: 4251 Mahogany Run, Winter Haven, FL 33884, USA. Support: support@craftora.dev. Business: maria@craftora.dev. X: @craftoraaa.\n')
        write(p, s)
        report.append('llms.txt: added Company section')

# 6. Photo placeholder folder
os.makedirs('public/team', exist_ok=True)
report.append('Photo: put Maria\'s photo at public/team/maria-vindell.jpg, then set photo in lib/company.js')

print('\n'.join(report))
