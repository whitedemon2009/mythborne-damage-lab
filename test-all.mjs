const suites = [
  './action-patterns.test.mjs',
  './artifacts.test.mjs',
  './character-rules.test.mjs',
  './combat.test.mjs',
  './divinity-triumph.test.mjs',
  './engine.test.mjs',
  './gear.test.mjs',
  './gear-integration.test.mjs',
  './infinite-hp.test.mjs',
  './optimizer.test.mjs',
  './recommendations.test.mjs',
  './report.test.mjs',
  './rotation.test.mjs',
  './step3-characters.test.mjs',
  './step4-characters.test.mjs',
  './support-targeting.test.mjs',
  './system-foundations.test.mjs',
  './character-runtime.test.mjs',
  './character-team.test.mjs',
  './character-roster.test.mjs',
];

for (const suite of suites) {
  await import(suite);
}

console.log(`PASS: ${suites.length} bộ kiểm tra Damage Lab`);
