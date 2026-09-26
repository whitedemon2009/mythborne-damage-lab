"""Build a standalone page that works without a local server."""
import json
import hashlib
import re
from pathlib import Path
root = Path(__file__).resolve().parent
artifacts = (root / 'artifacts.mjs').read_text().replace('export ', '')
builder = (root / 'builder.js').read_text()
builder = builder[builder.index('export async function'):].replace('export ', '')
start = builder.index('  const catalog =')
end = builder.index('\n', start)
builder = builder[:start] + '  const catalog = ' + json.dumps(json.loads((root / 'catalog.json').read_text()), ensure_ascii=False) + ';' + builder[end:]
app = (root / 'app.js').read_text()
start = app.index('await import("./builder.js")')
app = app[:start] + '''mountBuilder({characters,presets,getTeam:()=>team,renderTeam,simulate}).catch(error=>{
 const note=document.querySelector('.status-note');
 note.textContent='Không tải được bộ chọn nhân vật: '+error.message;
 note.setAttribute('role','alert');
});'''
def classic(name):
    source=(root/name).read_text()
    source=re.sub(r'^(?:import .*|export \* .*|export \{.*)\n','',source,flags=re.M)
    return source.replace('export ', '')
combat = '\n'.join(classic(name) for name in ['formulas.mjs','dot-system.mjs','life-system.mjs','element-conversion.mjs','report.mjs','rotation.mjs','support-targeting.mjs','action-patterns.mjs','character-rules.mjs','timeline.mjs','effects.mjs','memory-events.mjs','artifact-events.mjs','gear-events.mjs','character-data.mjs',*[str(p.relative_to(root)) for p in sorted((root/'characters').glob('*.mjs'))],'character-runtime.mjs','combat.mjs','team-comparison.mjs'])
combat_ui = (root / 'combat-ui.js').read_text()+'\n'+(root / 'rotation-ui.js').read_text()+'\n'+(root / 'report-ui.js').read_text()+'\n'+classic('recommendation-review.mjs')+'\n'+classic('recommendations.mjs')+'\n'+(root / 'experience-ui.js').read_text()
script = '(function(){\n' + combat + '\n' + combat_ui + '\n' + artifacts + '\n' + classic('gear-data.mjs') + '\n' + classic('gear.mjs') + '\n' + builder + '\n' + app + '\n})();'
(root / 'bundle.js').write_text(script)
page = (root / 'index.html').read_text()
page = page.replace('<script type="module" src="app.js"></script>', '<script src="bundle.js"></script>')
script_tag = '<script src="bundle.js?v='+hashlib.sha256(script.encode()).hexdigest()[:12]+'"></script>'
page = re.sub(r'<script src="bundle\.js(?:\?[^\"]*)?"></script>', script_tag, page)
(root / 'index.html').write_text(page)
standalone = page.replace('<link rel="stylesheet" href="styles.css" />', '<style>'+(root / 'styles.css').read_text()+'</style>')
standalone = standalone.replace(script_tag, '<script>'+script.replace('</script','<\\/script')+'</script>')
(root / 'Mythborne-Damage-Lab.html').write_text(standalone)
(root / 'public' / 'index.html').write_text(standalone)
print('Built bundle.js, standalone HTML and public/index.html')
