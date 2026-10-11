#!/usr/bin/env python3
"""Craftora step 12: add Pricing to the header and footer menus. Safe to run more than once.
Run from ~/craftora:  python3 scripts/apply-step12.py
"""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def patch(path):
    if not os.path.exists(path):
        print(f'{path}: not found'); return
    s = open(path, encoding='utf-8').read()
    if "'/pricing'" in s or '"/pricing"' in s:
        print(f'{path}: Pricing link already there'); return
    n = 0
    # 1. JSX links:  <Link ... href="/about" ...>About</Link>  (also <a>)
    pat = re.compile(r'(<(Link|a)\b[^>]*?href=(["\'])/about\3[^>]*>\s*About\s*</\2>)', re.S)
    def jsx(m):
        nonlocal n; n += 1
        el = m.group(1)
        dup = re.sub(r'href=(["\'])/about\1', r'href=\1/pricing\1', el, count=1)
        dup = re.sub(r'>\s*About\s*<', '>Pricing<', dup, count=1)
        # keep the same indentation as the About link
        line_start = s.rfind('\n', 0, m.start()) + 1
        indent = re.match(r'\s*', s[line_start:m.start()]).group(0)
        return el + '\n' + indent + dup
    s2 = pat.sub(jsx, s)
    # 2. Arrays of objects:  { href: '/about', label: 'About' }
    if n == 0:
        pat2 = re.compile(r"(\{\s*(\w+)\s*:\s*(['\"])/about\3\s*,\s*(\w+)\s*:\s*(['\"])About\5\s*\})")
        def obj(m):
            nonlocal n; n += 1
            return m.group(1) + f", {{ {m.group(2)}: '/pricing', {m.group(4)}: 'Pricing' }}"
        s2 = pat2.sub(obj, s)
    # 3. Arrays of pairs:  ['/about', 'About']
    if n == 0:
        pat3 = re.compile(r"(\[\s*(['\"])/about\2\s*,\s*(['\"])About\3\s*\])")
        def pair(m):
            nonlocal n; n += 1
            return m.group(1) + ", ['/pricing', 'Pricing']"
        s2 = pat3.sub(pair, s)
    if n:
        open(path, 'w', encoding='utf-8').write(s2)
        print(f'{path}: added Pricing next to About ({n} place{"s" if n > 1 else ""})')
    else:
        print(f'{path}: could NOT find the About link pattern. Lines mentioning /about:')
        for i, line in enumerate(s.splitlines(), 1):
            if '/about' in line or "'About'" in line or '>About<' in line:
                print(f'   {i}: {line.strip()[:160]}')

patch('components/Header.jsx')
patch('components/Footer.jsx')
