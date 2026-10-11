#!/usr/bin/env python3
"""Craftora step 10: PayPal subscriptions. Safe to run more than once.
Run from ~/craftora:  python3 scripts/apply-step10.py
"""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def add_line(p, line, label):
    if not os.path.exists(p):
        print(f'{p}: not found, skipped'); return
    s = open(p, encoding='utf-8').read()
    if line in s:
        print(f'{p}: {label} already there'); return
    open(p, 'w', encoding='utf-8').write(s.rstrip('\n') + '\n' + line + '\n')
    print(f'{p}: added {label}')

add_line('public/robots.txt', 'Sitemap: https://craftora.dev/pricing/sitemap.xml', 'pricing sitemap')
add_line('public/llms.txt', '- [Pricing](https://craftora.dev/pricing): Free, Pro ($5/month) and Business ($15/month) plans. Every browser tool stays free.', 'pricing page')

# .env check (names only, never values)
env = open('.env', encoding='utf-8').read() if os.path.exists('.env') else ''
for k in ['PAYPAL_MODE', 'PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_WEBHOOK_ID']:
    m = re.search(rf'^{k}=(.+)$', env, re.M)
    print(f'.env {k}: {"set" if m and m.group(1).strip() else "MISSING"}' + (f' ({m.group(1).strip()})' if k == 'PAYPAL_MODE' and m else ''))

# Privacy page should name PayPal as the payment processor
for p in ['app/privacy/page.js', 'app/privacy/page.jsx']:
    if os.path.exists(p):
        print(f'{p}: ' + ('mentions PayPal' if 'PayPal' in open(p, encoding='utf-8').read() else 'does NOT mention PayPal yet (send it to Claude to update)'))
