#!/usr/bin/env node
/**
 * Structural integrity check for TheQuran's current API editions.
 *
 * Run with Node.js 18+:
 *   node scripts/verify-content.js
 *
 * This checks API consistency and numbering. It does NOT independently
 * authenticate the Arabic text or certify a translation; that requires
 * comparison against trusted, separately maintained source material.
 */
const API = "https://api.alquran.cloud/v1";
const EXPECTED_SURAHS = 114;
const EXPECTED_AYAHS = 6236;
const EDITIONS = "quran-uthmani,en.sahih";

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const json = await response.json();
  if (json.code !== 200 || !Array.isArray(json.data)) {
    throw new Error(`Unexpected API response for ${url}`);
  }
  return json.data;
}

async function main() {
  const surahs = await getJson(`${API}/surah`);
  const errors = [];
  if (surahs.length !== EXPECTED_SURAHS) {
    errors.push(`Expected ${EXPECTED_SURAHS} surahs; API returned ${surahs.length}.`);
  }
  if (surahs.some((s, i) => s.number !== i + 1)) {
    errors.push("Surah numbering is not a complete 1–114 sequence.");
  }
  const declaredTotal = surahs.reduce((sum, s) => sum + Number(s.numberOfAyahs || 0), 0);
  if (declaredTotal !== EXPECTED_AYAHS) {
    errors.push(`Expected ${EXPECTED_AYAHS} total ayahs in metadata; got ${declaredTotal}.`);
  }

  let next = 0;
  const concurrency = 6;
  const results = new Array(surahs.length);
  async function worker() {
    while (true) {
      const index = next++;
      if (index >= surahs.length) return;
      const surah = surahs[index];
      try {
        const editions = await getJson(`${API}/surah/${surah.number}/editions/${EDITIONS}`);
        const arabic = editions.find(x => x.edition && x.edition.identifier === "quran-uthmani");
        const english = editions.find(x => x.edition && x.edition.identifier === "en.sahih");
        if (!arabic || !english) {
          results[index] = `Surah ${surah.number}: missing Arabic or English edition.`;
          continue;
        }
        const a = arabic.ayahs || [];
        const e = english.ayahs || [];
        if (a.length !== surah.numberOfAyahs || e.length !== surah.numberOfAyahs) {
          results[index] = `Surah ${surah.number}: expected ${surah.numberOfAyahs} verses; Arabic=${a.length}, English=${e.length}.`;
          continue;
        }
        for (let i = 0; i < a.length; i++) {
          if (a[i].numberInSurah !== i + 1 || e[i].numberInSurah !== i + 1) {
            results[index] = `Surah ${surah.number}, verse index ${i + 1}: non-sequential verse numbering.`;
            break;
          }
          if (a[i].numberInSurah !== e[i].numberInSurah) {
            results[index] = `Surah ${surah.number}, verse ${i + 1}: Arabic/English numbering mismatch.`;
            break;
          }
          if (typeof a[i].text !== "string" || !a[i].text.trim() ||
              typeof e[i].text !== "string" || !e[i].text.trim()) {
            results[index] = `Surah ${surah.number}, verse ${i + 1}: empty text field.`;
            break;
          }
        }
      } catch (error) {
        results[index] = `Surah ${surah.number}: request failed — ${error.message}`;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, surahs.length) }, worker));
  errors.push(...results.filter(Boolean));
  if (errors.length) {
    console.error(`FAILED: ${errors.length} content integrity issue(s) found.`);
    for (const error of errors) console.error(" - " + error);
    process.exitCode = 1;
    return;
  }
  console.log("PASS: 114 surahs and 6,236 ayahs returned with matching Arabic/English counts and sequential verse numbering.");
  console.log("NOTE: Structural validation only; it is not an independent scholarly verification of text accuracy.");
}
main().catch(error => {
  console.error("Content check could not complete:", error.message);
  process.exitCode = 1;
});
