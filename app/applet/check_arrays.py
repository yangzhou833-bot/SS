import os
import re

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            lines = content.split('\n')
            for line_no, line in enumerate(lines):
                if 'key=' in line:
                    km = re.search(r'key=\{([^}]+)\}', line)
                    if km:
                        kexpr = km.group(1).strip()
                        # check if it contains any index identifier
                        has_index = False
                        for v in ['idx', 'Idx', 'index', 'Index', 'itemIdx', 'pIdx', 'sIdx', 'cIdx', 'fIdx', 'aIdx', 'bIdx', 'waveIdx', 'emojiIdx', 'emIdx', 'fistIdx', 'taskIdx', 'rIdx', 'ri', 'ci', '-i}', '-i`', '-i$', '`${i}', '${i}-', 'key={i}', 'key={i ']:
                            if v in kexpr or (v in line and 'map' in line):
                                has_index = True
                                break
                        if not has_index:
                            print(f'{filepath}:{line_no+1} -> key={{{kexpr}}}')
