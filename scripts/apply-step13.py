#!/usr/bin/env python3
"""Craftora step 13: USDC payments through Coinbase Business, in-page subscription checkout with card, payment icons.
Safe to run more than once. Run from ~/craftora:  python3 scripts/apply-step13.py
"""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

line = '- Payments: monthly and yearly plans by card or PayPal; one-time yearly plans also by Apple Pay, Google Pay, and USDC through Coinbase.'
p = 'public/llms.txt'
if os.path.exists(p):
    s = open(p, encoding='utf-8').read()
    if line not in s:
        open(p, 'w', encoding='utf-8').write(s.rstrip('\n') + '\n' + line + '\n')
        print('llms.txt: added payments line')
    else:
        print('llms.txt: payments line already there')

# .env check (names only, never values)
env = open('.env', encoding='utf-8').read() if os.path.exists('.env') else ''
for k in ['COINBASE_MODE', 'COINBASE_API_KEY_ID', 'COINBASE_API_KEY_SECRET', 'COINBASE_WEBHOOK_SECRET']:
    m = re.search(rf'^{k}=(.+)$', env, re.M)
    val = m.group(1).strip() if m else ''
    extra = f' ({val})' if k == 'COINBASE_MODE' and val else ''
    if k == 'COINBASE_API_KEY_SECRET' and val:
        import base64
        try:
            n = len(base64.b64decode(val.strip('"\'')))
            extra = ' (looks right: 64 bytes)' if n == 64 else f' (WRONG: decodes to {n} bytes, expected 64. Use the Ed25519 secret)'
        except Exception:
            extra = ' (WRONG: not valid base64)'
    print(f'.env {k}: {"set" if val else "MISSING"}{extra}')
print('USDC button shows only when COINBASE_API_KEY_ID, COINBASE_API_KEY_SECRET and COINBASE_WEBHOOK_SECRET are all set.')

for p in ['app/privacy/page.js', 'app/privacy/page.jsx']:
    if os.path.exists(p):
        print(f'{p}: ' + ('mentions Coinbase' if 'Coinbase' in open(p, encoding='utf-8').read() else 'does NOT mention Coinbase yet (send it to Claude to update)'))
