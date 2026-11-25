import zipfile
import xml.etree.ElementTree as ET
import json
import re

xlsx_path = '/Users/lakshayverma/.gemini/antigravity/brain/a2c1b13b-9135-4feb-8862-a8b6c0825d53/.user_uploaded/media_1795253028633_b6d7b10f.xlsx'
ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

def get_sheet_rows(z, sheet_file, sst):
    root = ET.fromstring(z.read(sheet_file))
    rows = []
    for row in root.iter(ns + 'row'):
        row_cells = {}
        for c in row.iter(ns + 'c'):
            cell_ref = c.attrib.get('r', '')
            col = ''.join([ch for ch in cell_ref if ch.isalpha()])
            t = c.attrib.get('t')
            v_elem = c.find(ns + 'v')
            val = ''
            if v_elem is not None and v_elem.text is not None:
                if t == 's':
                    val = sst[int(v_elem.text)]
                else:
                    val = v_elem.text
            elif c.find(ns + 'is') is not None:
                is_elem = c.find(ns + 'is')
                val = ''.join([t.text for t in is_elem.iter(ns + 't') if t.text])
            row_cells[col] = val
        rows.append(row_cells)
    return rows

def clean_urn(v):
    if not v: return ''
    try:
        f = float(str(v).strip())
        return str(int(f))
    except:
        m = re.search(r'\b\d{7}\b', str(v))
        return m.group(0) if m else ''

def clean_text(v):
    if not v: return ''
    return str(v).strip().strip('"').strip("'").strip()

def clean_phone_last4(v):
    if not v: return ''
    v_str = str(v).strip()
    try:
        f = float(v_str)
        s = f'{int(f):010d}'
        if len(s) >= 4:
            return s[-4:]
    except:
        pass
    digits = re.sub(r'\D', '', v_str)
    if len(digits) >= 4:
        return digits[-4:]
    return ''

with zipfile.ZipFile(xlsx_path, 'r') as z:
    sst = []
    if 'xl/sharedStrings.xml' in z.namelist():
        root = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in root.iter(ns + 'si'):
            text = ''.join([t.text for t in si.iter(ns + 't') if t.text])
            sst.append(text)

    sheet4_rows = get_sheet_rows(z, 'xl/worksheets/sheet4.xml', sst)
    sheet11_rows = get_sheet_rows(z, 'xl/worksheets/sheet11.xml', sst)
    sheet3_rows = get_sheet_rows(z, 'xl/worksheets/sheet3.xml', sst)
    sheet2_rows = get_sheet_rows(z, 'xl/worksheets/sheet2.xml', sst)
    sheet6_rows = get_sheet_rows(z, 'xl/worksheets/sheet6.xml', sst)

students = {}

# 1. Parse 2024-28 (2nd Year) from Sheet 4
for r in sheet4_rows[5:]:
    # Section A: B=URN, C=Name, D=Email, E=Sec
    urn_a = clean_urn(r.get('B', ''))
    name_a = clean_text(r.get('C', ''))
    if urn_a.startswith('2481') and name_a:
        students[urn_a] = {
            'id': f'stu-{urn_a}',
            'urn': urn_a,
            'name': name_a,
            'email': clean_text(r.get('D', '')) or f'{urn_a}@iilm.edu',
            'course': 'B.Tech CSE',
            'semester': 3,
            'section': clean_text(r.get('E', 'A')) or 'A',
            'batch': '2024-28'
        }
    # Section B: H=URN, I=Name, J=Email, K=Sec
    urn_b = clean_urn(r.get('H', ''))
    name_b = clean_text(r.get('I', ''))
    if urn_b.startswith('2481') and name_b:
        students[urn_b] = {
            'id': f'stu-{urn_b}',
            'urn': urn_b,
            'name': name_b,
            'email': clean_text(r.get('J', '')) or f'{urn_b}@iilm.edu',
            'course': 'B.Tech CSE',
            'semester': 3,
            'section': clean_text(r.get('K', 'B')) or 'B',
            'batch': '2024-28'
        }
    # Section C: N=URN, O=Name, P=Email, Q=Sec
    urn_c = clean_urn(r.get('N', ''))
    name_c = clean_text(r.get('O', ''))
    if urn_c.startswith('2481') and name_c:
        students[urn_c] = {
            'id': f'stu-{urn_c}',
            'urn': urn_c,
            'name': name_c,
            'email': clean_text(r.get('P', '')) or f'{urn_c}@iilm.edu',
            'course': 'B.Tech CSE',
            'semester': 3,
            'section': clean_text(r.get('Q', 'C')) or 'C',
            'batch': '2024-28'
        }

# Enhance 2024-28 with Sheet 11 (Contact numbers and parents email if available)
for r in sheet11_rows[2:]:
    urn = clean_urn(r.get('B', ''))
    if urn in students:
        if r.get('D') and '@' in r.get('D'):
            students[urn]['email'] = clean_text(r.get('D'))
        p4 = clean_phone_last4(r.get('E'))
        if p4:
            students[urn]['phoneLast4'] = p4
        if r.get('F') and '@' in r.get('F'):
            students[urn]['parentEmail'] = clean_text(r.get('F'))

# 2. Parse 2025-29 (1st Year) from Sheet 3 (Section data: A to G)
sec_map_cols = [
    ('B', 'C', 'D', 'E', 'A'), # Sec A
    ('H', 'I', 'J', 'K', 'B'), # Sec B
    ('N', 'O', 'P', 'Q', 'C'), # Sec C
    ('T', 'U', 'V', 'W', 'D'), # Sec D
    ('Z', 'AA', 'AB', 'AC', 'E'), # Sec E
    ('AF', 'AG', 'AH', 'AI', 'F'), # Sec F
    ('AL', 'AM', 'AN', 'AO', 'G'), # Sec G
]

for r in sheet3_rows[4:]:
    for (col_urn, col_name, col_email, col_sec, default_sec) in sec_map_cols:
        urn = clean_urn(r.get(col_urn, ''))
        name = clean_text(r.get(col_name, ''))
        if urn.startswith('2581') and name:
            sec = clean_text(r.get(col_sec, default_sec)) or default_sec
            email = clean_text(r.get(col_email, '')) or f'{urn}@iilm.edu'
            students[urn] = {
                'id': f'stu-{urn}',
                'urn': urn,
                'name': name,
                'email': email,
                'course': 'B.Tech CSE',
                'semester': 1,
                'section': sec,
                'batch': '2025-29'
            }

# Add any missing 2025-29 students from Sheet 2 and attach phone numbers
for r in sheet2_rows[3:]:
    urn = clean_urn(r.get('B', ''))
    name = clean_text(r.get('D', ''))
    p4 = clean_phone_last4(r.get('G'))
    fp4 = clean_phone_last4(r.get('H'))
    p_email = clean_text(r.get('I', ''))
    pers_email = clean_text(r.get('J', ''))
    off_email = clean_text(r.get('K', ''))

    if urn.startswith('2581'):
        if urn not in students and name:
            students[urn] = {
                'id': f'stu-{urn}',
                'urn': urn,
                'name': name,
                'email': off_email or f'{urn}@iilm.edu',
                'course': 'B.Tech CSE',
                'semester': 1,
                'section': 'General',
                'batch': '2025-29'
            }
        if urn in students:
            if p4:
                students[urn]['phoneLast4'] = p4
            if fp4:
                students[urn]['parentPhoneLast4'] = fp4
            if p_email and '@' in p_email:
                students[urn]['parentEmail'] = p_email
            if pers_email and '@' in pers_email:
                students[urn]['personalEmail'] = pers_email

# Ensure every student has a phoneLast4 (fallback to last 4 digits of URN if none registered)
for urn, s in students.items():
    if 'phoneLast4' not in s or not s['phoneLast4']:
        s['phoneLast4'] = urn[-4:]

print(f"Total Unique Students Loaded: {len(students)}")
print(f"- Batch 2024-28 (2nd Year, Sem 3): {sum(1 for s in students.values() if s['batch'] == '2024-28')}")
print(f"- Batch 2025-29 (1st Year, Sem 1): {sum(1 for s in students.values() if s['batch'] == '2025-29')}")
print(f"- Students with phoneLast4: {sum(1 for s in students.values() if 'phoneLast4' in s)}")

# Sort students by URN
sorted_students = sorted(list(students.values()), key=lambda s: s['urn'])

# Save to JSON
with open('src/data/students_master.json', 'w', encoding='utf-8') as f:
    json.dump(sorted_students, f, indent=2)

print("Saved to src/data/students_master.json")
