#!/usr/bin/env python3
"""Craftora step 11: one-time purchases with Apple Pay and Google Pay. Safe to run more than once.
Run from ~/craftora:  python3 scripts/apply-step11.py
"""
import os, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# Apple Pay domain verification files from PayPal (one for sandbox, one for live).
FILES = {
    'sandbox': 'https://paypalobjects.com/devdoc/apple-pay/sandbox/apple-developer-merchantid-domain-association',
    'live': 'https://paypalobjects.com/devdoc/apple-pay/well-known/apple-developer-merchantid-domain-association',
}
os.makedirs('public/applepay', exist_ok=True)
for mode, url in FILES.items():
    dest = f'public/applepay/{mode}'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 Craftora setup'})
        data = urllib.request.urlopen(req, timeout=30).read()
        if len(data) < 100:
            raise ValueError(f'file looks too small ({len(data)} bytes)')
        open(dest, 'wb').write(data)
        print(f'Apple Pay {mode} domain file: saved ({len(data)} bytes)')
    except Exception as e:
        print(f'Apple Pay {mode} domain file: FAILED ({e}). Download it manually from {url} to {dest}')

line = '- [Pay once](https://craftora.dev/pricing): Pro or Business for 1 year with a single payment by Apple Pay, Google Pay, PayPal, card, or crypto.'
p = 'public/llms.txt'
if os.path.exists(p):
    s = open(p, encoding='utf-8').read()
    if line not in s:
        open(p, 'w', encoding='utf-8').write(s.rstrip('\n') + '\n' + line + '\n')
        print('llms.txt: added pay-once line')
