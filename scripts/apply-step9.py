#!/usr/bin/env python3
"""Craftora step 9: indexing fixes. Safe to run more than once.
Run from ~/craftora:  python3 scripts/apply-step9.py
"""
import os, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# 1. www to non-www 301 redirect (Next.js middleware)
src = 'scripts/www-middleware.js'
found = [p for p in ('middleware.js', 'middleware.ts', 'src/middleware.js') if os.path.exists(p)]
if not found:
    shutil.copy(src, 'middleware.js')
    print('middleware.js: created (www.craftora.dev now 301s to craftora.dev)')
else:
    s = open(found[0], encoding='utf-8').read()
    if "startsWith('www.')" in s:
        print(f'{found[0]}: www redirect already present')
    else:
        print(f'{found[0]}: EXISTS with other code, not changed. Send it to Claude to merge the www redirect.')

# 2. /all-tools check
s = open('app/all-tools/page.js', encoding='utf-8').read()
print('all-tools: server rendered with own metadata' if "canonical: '/all-tools'" in s and "'use client'" not in s else 'all-tools: OLD VERSION, tarball not extracted?')
