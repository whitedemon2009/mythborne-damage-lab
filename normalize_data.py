"""Lossless, source-indexed content normalization. Does not invent runtime rules."""
import hashlib
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'data'
snapshot = json.loads((DATA / 'live-snapshot.json').read_text())
user_rules = json.loads((DATA / 'user-rules.json').read_text())
issues = []

def slug(text):
    text = unicodedata.normalize('NFKD', text.replace('Đ','D').replace('đ','d')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', text).strip('-')

def number(text):
    return float(text.replace(',', '.')) if ',' in text or '.' in text else int(text)

def lines(tab):
    out = []
    for i, p in enumerate(snapshot['tabs'][tab]['paragraphs']):
        for j, text in enumerate(p['text'].splitlines()):
            if text.strip():
                out.append({'text': text.strip(), 'source': {'tabId': p['tabId'], 'paragraph': i,
                    'startIndex': p['startIndex'], 'endIndex': p['endIndex'], 'line': j}})
    return out

def field(ps, label):
    for p in ps:
        m = re.match(re.escape(label) + r'\s*:\s*(.+)', p['text'], re.I)
        if m:
            return m[1]
    return None

def stats(ps):
    out = {}
    for p in ps:
        m = re.search(r'Lv\s*(1|60)\s*:', p['text'], re.I)
        if not m:
            continue
        vals = {}
        for name, key in [('HP', 'hp'), ('Tấn Công', 'atk'), ('Phòng Thủ', 'def'), ('Tốc Độ', 'speed')]:
            s = re.search(name + r'\s*[:+]?\s*(\d+(?:[.,]\d+)?)', p['text'], re.I)
            if s:
                vals[key] = number(s[1])
        if vals:
            out[m[1]] = {'values': vals, 'source': p['source']}
    return out

def clause(p):
    t = p['text']
    return {**p, 'numbers': [{'value': number(m[1]), 'unit': '%' if m[2] else None,
                             'offset': m.start()} for m in re.finditer(r'(\d+(?:[.,]\d+)?)(%)?', t)],
            'effectNames': list(dict.fromkeys(re.findall(r'[‘“]([^’”]+)[’”]', t))),
            'runtimeStatus': 'NOT_IMPLEMENTED'}

def section_key(t):
    pairs = [(r'^Tấn Công Thường\s*[-—–]', 'basic'), (r'^Chiến K[ỹĩ]\s*[-—–]', 'skill'),
             (r'^Tuyệt K[ỹĩ](?:\s+I{1,2})?\s*[-—–]', 'ultimate'), (r'^Thiên Phú\s*[-—–]', 'talent'),
             (r'^Đòn Đánh Theo Sau\s*[-—–]', 'followUp'),
             (r'^Đột Phá\s*$', 'ascension'), (r'^Mốc phụ\b', 'minorNodes'),
             (r'^Vận Mệnh\s*$', 'fates'), (r'^Tóm tắt kit(?:\s*$|:)', 'summary'),
             (r'^Ngoại hình(?:\s*$|:)', 'appearance'), (r'^Chỉ số cơ bản\s*$', 'baseStats')]
    for pattern, key in pairs:
        if re.match(pattern, t, re.I):
            return key
    m = re.match(r'^(?:A([123])|Mốc ([123]))(?:\s|:|$)', t)
    if m:
        return 'A' + (m[1] or m[2])
    m = re.match(r'^Lv(20|40|60)\s*[-—–]', t)
    if m:
        return {'20':'A1','40':'A2','60':'A3'}[m[1]]
    m = re.match(r'^(?:VM\s*|Vận Mệnh\s*)([1-6])(?:\s|:|$)', t, re.I)
    if m:
        return 'VM' + m[1]
    if re.match(r'^(Tấn Công Thường|Chiến K[ỹĩ]|Tuyệt K[ỹĩ]) Cường', t, re.I) and re.search(r'[-—–]', t):
        return 'variant'
    return None

def sections(ps):
    out = []
    for p in ps:
        key = section_key(p['text'])
        if key or not out:
            out.append({'kind': key or 'metadata', 'heading': p['text'] if key else None,
                        'source': p['source'], 'clauses': []})
        out[-1]['clauses'].append(clause(p))
    return out

def record(kind, title, ps):
    name = re.sub(r'^\d+\s*\.\s*(?:Nhân vật\s*[-—–]\s*)?', '', title['text'], flags=re.I)
    name = re.sub(r'^Mảnh Ký Ức Trấn\s*[-—–]\s*', '', name, flags=re.I)
    return {'id': kind + ':' + slug(name), 'name': name, 'status': 'CANON_SOURCE',
            'source': title['source'], 'text': [p['text'] for p in ps],
            'paragraphs': ps, 'contentHash': hashlib.sha256('\n'.join(p['text'] for p in ps).encode()).hexdigest(),
            'runtimeStatus': 'NOT_IMPLEMENTED'}

def blocks(tab, predicate):
    ps = lines(tab)
    starts = [i for i, p in enumerate(ps) if predicate(ps, i)]
    return [(ps[i], ps[i+1:j]) for i, j in zip(starts, starts[1:] + [len(ps)])]

def warn(r, code, message):
    issues.append({'entityId': r['id'], 'name': r['name'], 'code': code, 'message': message, 'source': r['source']})

characters = []
for title, ps in blocks('characters', lambda ps, i: bool(re.match(r'^\d+\s*\.\s*Nhân vật\s*[-—–]', ps[i]['text'], re.I))):
    r = record('veyr', title, ps)
    r.update({k: field(ps, label) for k, label in [('rarityText','Độ hiếm'),('aspect','Aspect'),('element','Nguyên tố'),('gender','Giới tính'),('weapon','Vũ khí')]})
    m = re.search(r'([345])★', r['rarityText'] or '')
    r['rarity'] = int(m[1]) if m else None
    r['baseStats'] = stats(ps)
    r['sections'] = sections(ps)
    r['energy'] = {'cap': None, 'ultimateCost': None, 'ultimateVariants': [], 'evidence': []}
    for p in ps:
        t = p['text']
        m = re.search(r'(?:Giới hạn Năng Lượng(?: của .+?)?(?: là|:)|Năng Lượng yêu cầu:)\s*(\d+)', t, re.I)
        if m:
            value = int(m[1]); r['energy']['cap'] = value
            r['energy']['evidence'].append(p)
            if 'yêu cầu' in t.lower(): r['energy']['ultimateCost'] = value
    # Cost is separate from cap. Explicit Ult consumption takes precedence.
    for s in r['sections']:
        if s['kind'] == 'ultimate':
            cost = None
            for p in s['clauses']:
                m = re.search(r'Tiêu hao (\d+) Năng Lượng', p['text'], re.I) or re.match(r'Năng Lượng:\s*(\d+)', p['text'], re.I)
                if m:
                    cost = int(m[1]); r['energy']['evidence'].append({'text':p['text'],'source':p['source']})
                    if p['text'].startswith('Năng Lượng:'):r['energy']['cap']=cost
            r['energy']['ultimateVariants'].append({'heading':s['heading'],'cost':cost,'source':s['source']})
    costs=[v['cost'] for v in r['energy']['ultimateVariants'] if v['cost'] is not None]
    if len(costs)==1:r['energy']['ultimateCost']=costs[0]
    confirmed_cap=user_rules.get('energy',{}).get('characterCaps',{}).get(r['id'])
    if confirmed_cap is not None:
        r['energy']['cap']=confirmed_cap
        r['energy']['capConfirmation']={'source':'data/user-rules.json','rule':'energy.characterCaps.'+r['id']}
    if r['energy']['cap'] is None: warn(r, 'MISSING_ENERGY_CAP', 'Chưa tách được giới hạn Năng Lượng; không dùng 120 thay thế.')
    if r['energy']['ultimateCost'] is None and not costs: warn(r, 'ULT_COST_NOT_EXPLICIT', 'Có giới hạn NL nhưng chưa có chi phí Tuyệt Kĩ tách riêng trong nguồn; chưa mặc định tiêu toàn bộ.')
    for lv in ['1','60']:
        if set(r['baseStats'].get(lv,{}).get('values',{})) != {'hp','atk','def','speed'}:
            warn(r, 'MISSING_BASE_STATS', 'Chỉ số Lv'+lv+' thiếu hoặc cần đọc lại cách trình bày.')
    kinds = {s['kind'] for s in r['sections']}
    for k in ['basic','skill','ultimate','talent','A1','A2','A3','minorNodes',*[f'VM{i}' for i in range(1,7)]]:
        if k not in kinds: warn(r, 'MISSING_SECTION', 'Chưa tách được mục '+k)
    characters.append(r)

memories = []
for title, ps in blocks('memories', lambda ps,i: i+1<len(ps) and ps[i+1]['text'].startswith('Độ hiếm:')):
    r = record('memory',title,ps)
    r.update({'rarityText':field(ps,'Độ hiếm'),'aspect':field(ps,'Aspect'),'representative':field(ps,'Nhân vật đại diện'),'baseStats':stats(ps)})
    m = re.search(r'([345])★',r['rarityText'] or ''); r['rarity']=int(m[1]) if m else None
    at = next((i for i,p in enumerate(ps) if p['text'].lower().startswith('nội tại')),None)
    r['passive'] = [clause(p) for p in ps[at:]] if at is not None else []
    r['refinementRanges'] = []
    for p in r['passive']:
        for m in re.finditer(r'(\d+(?:[.,]\d+)?)(%)?\s*[-–]\s*(\d+(?:[.,]\d+)?)(%)?',p['text']):
            a,b=number(m[1]),number(m[3])
            r['refinementRanges'].append({'source':p['source'],'span':[m.start(),m.end()],
                'text':m[0],'unit':'percent' if m[2] or m[4] else 'flat',
                'values':[a+(b-a)*i/4 for i in range(5)],'rule':'USER_LINEAR_TL1_TL5'})
    if not r['passive']:warn(r,'MISSING_PASSIVE','Không tìm được nội tại.')
    for lv in ['1','60']:
        if set(r['baseStats'].get(lv,{}).get('values',{})) != {'hp','atk','def'}:warn(r,'MISSING_BASE_STATS','Thiếu chỉ số Mảnh Ký Ức Lv'+lv)
    memories.append(r)

artifacts = []
for title,ps in blocks('artifacts',lambda ps,i:bool(re.match(r'^\d+\.',ps[i]['text']))):
    r=record('artifact',title,ps);r['bonuses']={}
    for p in ps:
        m=re.match(r'^([245]) món\s*[-—–]',p['text'])
        if m:r['bonuses'][m[1]]=clause(p)
    if set(r['bonuses'])!={'2','4','5'}:warn(r,'MISSING_SET_TIER','Thiếu mốc 2/4/5 món.')
    artifacts.append(r)

myrk=[]
for title,ps in blocks('myrk',lambda ps,i:bool(re.match(r'^\d+\.',ps[i]['text']))):
    r=record('myrk',title,ps);r.update({'classification':field(ps,'Phân loại'),'element':field(ps,'Nguyên tố'),'weaknesses':field(ps,'Điểm yếu'),'baseStats':stats(ps)})
    r['abilities']=[]
    for p in ps:
        if re.match(r'^(Kỹ năng \d|Nội tại|Chiêu Cuối|Chiêu cuối)\s*[-—–]',p['text']):
            r['abilities'].append({'heading':p['text'],'source':p['source'],'clauses':[]})
        if r['abilities']:r['abilities'][-1]['clauses'].append(clause(p))
    if not r['baseStats']:warn(r,'MYRK_STATS_NOT_DEFINED','Nguồn có kit nhưng chưa xác định bộ HP/ATK/DEF/SPD theo cấp.')
    myrk.append(r)

# Record collisions without renaming approved content.
effect_index={}
for r in characters+memories+artifacts+myrk:
    for p in r['paragraphs']:
        for name in dict.fromkeys(re.findall(r'[‘“]([^’”]+)[’”]',p['text'])):
            effect_index.setdefault(name,{}).setdefault(r['id'],[]).append(p['source'])
duplicates=[{'name':n,'references':v,'status':'REVIEW_REFERENCE_OR_COLLISION'} for n,v in effect_index.items() if len(v)>1]

result={'schemaVersion':1,'source':{'documentId':snapshot['tabs']['characters']['documentId'],
 'retrievedAt':snapshot['retrievedAt'],'revisionId':snapshot['tabs']['characters']['revisionId'],
 'tabs':[{'kind':k,'tabId':v['tabId'],'paragraphCount':len(v['paragraphs'])} for k,v in snapshot['tabs'].items()]},
 'characters':characters,'memories':memories,'artifacts':artifacts,'myrk':myrk,
 'unresolved':issues,'effectNameReview':duplicates,
 'policy':{'missingValue':None,'intermediateCharacterLevels':'UNRESOLVED_NO_INTERPOLATION',
 'runtimeRules':'Clauses and numeric mentions are source data, not executable effects.',
 'precedence':'Explicit latest user decisions override live Doc; conflicts remain visible.'}}
# Runtime coverage is a separate layer from parsed source clauses.
gear_path=ROOT/'gear-data.mjs'
if gear_path.exists():
    gear_text=gear_path.read_text()
    for category,variable in [('memories','memoryRules'),('artifacts','setRules')]:
        match=re.search(r'export const '+variable+r'=(.*?);(?:\n|$)',gear_text,re.S)
        if match:
            registry=json.loads(match.group(1))
            for item in result[category]:
                rule=registry.get(item['id'],{})
                item['runtimeStatus']='IMPLEMENTED_BY_GEAR_EVENTS' if rule.get('complete') and rule.get('sourceHash')==item['contentHash'] else 'NEEDS_SOURCE_REVIEW'
character_path=ROOT/'character-data.mjs'
if character_path.exists():
    registry=json.loads(character_path.read_text().split('=',1)[1].strip().removesuffix(';'))
    for item in result['characters']:
        entry=registry.get(item['id'])
        if entry:
            item['runtimeStatus']='IMPLEMENTED_EXCEPT_SKILL_LEVEL_UPGRADES' if entry['hash']==item['contentHash'] else 'NEEDS_SOURCE_REVIEW'
            item['runtimeExclusions']=['VM3/VM5 skill level increases deferred by user']
DATA.mkdir(exist_ok=True)
(DATA/'normalized.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
catalog={k:[{**{q:r[q] for q in ['id','name','text','source','contentHash']},
                 **{q:r[q] for q in ['baseStats','energy','aspect','element','rarity','refinementRanges','passive','bonuses'] if q in r}} for r in result[k]] for k in ['characters','memories','artifacts']}
(ROOT/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2))
report=['# Kiểm kê dữ liệu Mythborne — bước 1','',f"Đọc live: {snapshot['retrievedAt']}; 4 thẻ. Không sửa Google Doc.",'',
 '## Số lượng','',*[f'- {k}: {len(result[k])}' for k in ['characters','memories','artifacts','myrk']], '',
 '## Cách sử dụng','', 'Mỗi hồ sơ có ID theo tên, chỉ số tại các cấp được ghi rõ, nguyên văn và vị trí nguồn. Kỹ năng/Đột Phá/VM được tách thành các mục và điều khoản. Các con số trong câu giữ vị trí, không được tự coi là hệ số sát thương. Nội tại và hiệu ứng chưa được thực thi; đó là bước 2–6.', '',
 'Không nội suy cấp nhân vật/Mảnh Ký Ức khi chưa có quy tắc. TL2–TL4 được nội suy từ khoảng TL1–TL5, giữ số lẻ.', '',
 '## Những mục cần làm rõ hoặc kiểm tra tiếp','',*[f"- **{i['name']} / {i['code']}**: {i['message']}" for i in issues], '',
 '## Tên hiệu ứng dùng ở nhiều hồ sơ','', 'Có thể là tương tác chủ ý hoặc trùng tên; không tự đổi tên.', '',*[f"- {d['name']}: {', '.join(d['references'])}" for d in duplicates]]
report += ['', '## Chỉ số gốc Veyr Lv60', '', '| Veyr | HP | ATK | DEF | SPD | NL tối đa |', '|---|---:|---:|---:|---:|---:|']
for r in characters:
    v=r['baseStats']['60']['values']
    report.append(f"| {r['name']} | {v['hp']} | {v['atk']} | {v['def']} | {v['speed']} | {r['energy']['cap'] if r['energy']['cap'] is not None else 'Chưa rõ'} |")
(DATA/'AUDIT.md').write_text('\n'.join(report)+'\n')
print(json.dumps({'counts':{k:len(result[k]) for k in ['characters','memories','artifacts','myrk']},'issues':len(issues),'sharedEffectNames':len(duplicates)},ensure_ascii=False))
