import re
import sys
import io

# UTF-8 stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

path = r'C:\Users\권용준\.claude\projects\C--Users-----Documents-Claude-Projects-K-BeautyStation---\77fb3097-6d00-4c8c-8405-4c56f4e77973\tool-results\mcp-2452b100-ae2f-4c82-bfe2-1dfefd2b3be8-get_metadata-1777881670869.txt'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all top-level Host frames (children of canvas 36:2577)
# These are at depth 1 from canvas
matches = re.findall(r'<frame id="(\d+:\d+)" name="(Host[^"]+|호스트[^"]*)"', content)
print(f"Total Host frames: {len(matches)}")
for fid, name in matches[:50]:
    print(f"  {fid}\t{name}")
