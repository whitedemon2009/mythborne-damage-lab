"""Check normalized data against independently inspected live source records."""
import json
from pathlib import Path

root=Path(__file__).resolve().parent
data=json.loads((root/'data/normalized.json').read_text())
snapshot=json.loads((root/'data/live-snapshot.json').read_text())
tabs={v['tabId']:v for v in snapshot['tabs'].values()}
assert len(tabs)==4
for kind,count in [('characters',74),('memories',114),('artifacts',22),('myrk',46)]:
    records=data[kind]
    assert len(records)==count,(kind,len(records))
    assert len({r['id'] for r in records})==count
    for r in records:
        for p in r['paragraphs']:
            source=p['source'];raw=tabs[source['tabId']]['paragraphs'][source['paragraph']]
            assert p['text'] in raw['text'],(r['name'],p['text'])
            assert source['startIndex']==raw['startIndex']
        if kind in ['characters','memories']:
            assert r['rarity'] in [3,4,5]
            assert r['aspect'] in ['Gungnir','Trishula','Mjolnir','Pandora','Keraunos','Aegis','Caduceus','Vajra','Fragarach']
            for lv in ['1','60']:
                assert all(v>0 for v in r['baseStats'][lv]['values'].values())
        if kind=='characters':
            kinds={s['kind'] for s in r['sections']}
            assert {'basic','skill','ultimate','talent','A1','A2','A3','minorNodes',*[f'VM{i}' for i in range(1,7)]}<=kinds,r['name']
            assert sum(len(s['clauses']) for s in r['sections'])==len(r['paragraphs'])
        if kind=='memories':
            assert r['passive'],r['name']
            for ran in r['refinementRanges']:
                a,b=ran['values'][0],ran['values'][-1]
                assert ran['values']==[a+(b-a)*i/4 for i in range(5)]
        if kind=='artifacts':assert set(r['bonuses'])=={'2','4','5'}
byname={r['name']:r for r in data['characters']}
assert byname['Apollo']['baseStats']['60']['values']=={'hp':1073,'atk':735,'def':478,'speed':101}
assert byname['Apollo']['energy']['cap']==400
assert byname['Astraeus']['energy']['cap']==200
assert [v['cost'] for v in byname['Astraeus']['energy']['ultimateVariants']]==[100,200]
assert byname['Surtr']['energy']['cap']==160
assert byname['Janus']['energy']['cap']==130
assert byname['Nephele']['energy']['cap']==130
assert byname['Týr']['energy']['cap']==140
assert byname['Nezha']['energy']['cap']==130
assert all(c['energy']['cap']>0 for c in byname.values())
assert byname['Hestia']['energy']['cap']==130
assert next(r for r in data['memories'] if r['name']=='Dưới Con Ngươi Của Bạch Hổ')['baseStats']['60']['values']['atk']==658
assert next(r for r in data['memories'] if r['name']=='Mặt Trời Không Đội Vương Miện')['refinementRanges'][0]['values']==[24,28,32,36,40]
print('PASS: 256 records, source references, all character sections, level stats, refinement and energy variants')
