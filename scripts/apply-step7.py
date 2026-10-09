#!/usr/bin/env python3
"""Craftora step 7: admin portal wiring (cron secret, nightly cleanup). Safe to run more than once.
Run from ~/craftora:  python3 scripts/apply-step7.py
"""
import os, re, secrets, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
report = []

def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def write(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

# 1. CRON_SECRET in .env (random, never printed)
env = read('.env') if os.path.exists('.env') else ''
if re.search(r'^CRON_SECRET=.{16,}$', env, re.M):
    report.append('Env: CRON_SECRET already set')
else:
    env = re.sub(r'^CRON_SECRET=.*\n?', '', env, flags=re.M)
    env = env.rstrip('\n') + '\nCRON_SECRET=' + secrets.token_hex(24) + '\n'
    write('.env', env)
    os.chmod('.env', 0o600)
    report.append('Env: CRON_SECRET generated and saved to .env (value not shown)')

# 2. Make sure the container receives CRON_SECRET
dc = read('docker-compose.yml')
if 'env_file' in dc:
    report.append('Compose: uses env_file, CRON_SECRET will be passed automatically')
elif 'CRON_SECRET' in dc:
    report.append('Compose: CRON_SECRET already passed')
else:
    out, added = [], False
    lines = dc.split('\n')
    for i, line in enumerate(lines):
        out.append(line)
        if not added and re.match(r'\s*-?\s*NOREPLY_SMTP_PASS', line):
            indent = line[:len(line) - len(line.lstrip())]
            if line.strip().startswith('-'):
                out.append(f'{indent}- CRON_SECRET=${{CRON_SECRET}}')
            else:
                out.append(f'{indent}CRON_SECRET: ${{CRON_SECRET}}')
            added = True
    if added:
        write('docker-compose.yml', '\n'.join(out))
        report.append('Compose: added CRON_SECRET next to NOREPLY_SMTP_PASS')
    else:
        report.append('Compose: could not find where env vars are set. SEND ME docker-compose.yml')

# 3. Nightly cleanup: call the cleanup endpoint from /root/craftora-cleanup.sh
script = '/root/craftora-cleanup.sh'
block = (
    '\n# Craftora Sign storage cleanup (old drafts, old voided/declined/expired docs, leftover files)\n'
    'CRON_SECRET=$(grep "^CRON_SECRET=" /root/craftora/.env | cut -d= -f2-)\n'
    'curl -s -m 120 -X POST -H "x-cron-secret: $CRON_SECRET" https://craftora.dev/api/admin/cleanup >> /var/log/craftora-cleanup.log 2>&1\n'
    'echo " $(date -Is)" >> /var/log/craftora-cleanup.log\n'
)
if os.path.exists(script):
    s = read(script)
    if '/api/admin/cleanup' in s:
        report.append('Cleanup script: already calls the signer cleanup')
    else:
        write(script, s.rstrip('\n') + '\n' + block)
        report.append('Cleanup script: added signer cleanup to /root/craftora-cleanup.sh')
else:
    write(script, '#!/bin/bash\n' + block)
    report.append('Cleanup script: created /root/craftora-cleanup.sh')
os.chmod(script, 0o700)

try:
    cur = subprocess.run(['crontab', '-l'], capture_output=True, text=True).stdout
except FileNotFoundError:
    cur = None
if cur is None:
    report.append('Cron: crontab command not found, add a daily job for /root/craftora-cleanup.sh manually')
elif 'craftora-cleanup.sh' in cur:
    report.append('Cron: daily job already scheduled')
else:
    new = cur.rstrip('\n') + ('\n' if cur.strip() else '') + '30 3 * * * /root/craftora-cleanup.sh\n'
    subprocess.run(['crontab', '-'], input=new, text=True, check=True)
    report.append('Cron: scheduled /root/craftora-cleanup.sh daily at 03:30 server time')

print('\n'.join(report))
