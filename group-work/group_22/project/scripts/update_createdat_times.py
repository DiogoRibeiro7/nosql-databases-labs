import re
import random
import shutil
from pathlib import Path

infile = Path(r"c:\Users\Seele\nosql-databases-labs\group-work\group_22\project\data\foodexpress_db.orders.json")
backup = infile.with_suffix(infile.suffix + '.bak')
shutil.copy2(infile, backup)

text = infile.read_text(encoding='utf-8')

pattern = re.compile(r'("\$date"\s*:\s*")(?P<date>\d{4}-\d{2}-\d{2})T00:00:00\.000Z(" )')
# Note: some files might have the closing quote immediately followed by \n, keep the pattern generic
pattern = re.compile(r'("\$date"\s*:\s*")(?P<date>\d{4}-\d{2}-\d{2})T00:00:00\.000Z(")')

rng = random.Random(42)  # deterministic seed for reproducibility; change or remove if you want different runs


def gen_time():
    r = rng.random()
    if r < 0.75:
        # daytime orders: 10:00 - 21:59
        hour = rng.randint(10, 21)
    elif r < 0.9:
        # morning early: 06:00 - 09:59
        hour = rng.randint(6, 9)
    else:
        # late night deviants: 22:00 - 02:59 (wrap-around handled)
        hour = rng.choice(list(range(22, 24)) + [0, 1, 2])

    minute = rng.randint(0, 59)
    second = rng.randint(0, 59)
    ms = rng.randint(0, 999)
    return f"{hour:02d}:{minute:02d}:{second:02d}.{ms:03d}Z"


count = 0

def repl(m):
    global count
    date = m.group('date')
    newtime = gen_time()
    count += 1
    return f'"$date": "{date}T{newtime}"'

new_text, nsubs = pattern.subn(repl, text)

if nsubs == 0:
    print("No matches found. Nothing changed.")
else:
    infile.write_text(new_text, encoding='utf-8')
    print(f"Replaced {nsubs} createdAt times. Backup saved to: {backup}")

# Quick verification: ensure there are no remaining T00:00:00.000Z occurrences
if "T00:00:00.000Z" in new_text:
    print("Warning: Some timestamps remain at 00:00:00.000Z")
else:
    print("All timestamps updated.")
