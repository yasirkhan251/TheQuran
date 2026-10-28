# TheQuran — Read, Understand, Reflect

A free, responsive Qur'an reader prototype built as a single HTML file.

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. An internet connection is needed to load content the first time. Chapters and the chapter index are cached in the browser after they have loaded successfully.

## Current features

- Index of all 114 surahs, with search by name or number.
- Arabic text from the `quran-uthmani` edition and English translation `en.sahih`.
- Previous/next surah navigation and direct chapter links using the URL hash.
- Adjustable Arabic text size.
- Local bookmarks, a saved-verse library with jump-to-verse navigation, and copy-verse actions.
- Last-read surah and verse progress saved on this device.
- Verse-by-verse recitation streamed from the `ar.alafasy` edition.
- Best-effort local cache for the chapter index and chapters already opened.
- Retry/error states when the content API is unavailable.
- Responsive layout and keyboard-visible focus styles.

## Run the structural content check

With Node.js 18 or newer and an internet connection, run:

```bash
node scripts/verify-content.js
```

The check requests the 114 surahs and verifies the API-reported total of 6,236 ayahs, Arabic/English verse counts, non-empty text fields, and sequential numbering. It is a structural/API consistency check—not an independent verification of the exact Arabic wording or scholarly approval of a translation.

## Content sources and integrity

- Arabic Qur'an text: Uthmani edition, identifier `quran-uthmani`, served by [AlQuran Cloud](https://alquran.cloud/api).
- English translation: Saheeh International, identifier `en.sahih`, served by AlQuran Cloud.
- Audio recitation: Mishary Rashid Alafasy, identifier `ar.alafasy`, streamed from AlQuran Cloud.
- The app displays the API-provided text without generating or paraphrasing verses. Browser auto-translation is discouraged because it can alter the meaning of a vetted translation.

**Important:** This is an early prototype, not a scholarly verification certificate. Before public release, check surah and ayah numbering against a trusted mushaf, review the displayed source metadata, test audio coverage and failures, and confirm the applicable reuse/attribution terms for translation and audio. Tafsir is not implemented yet; it should be added only from a named, traceable source and kept distinct from translation and personal study notes.

## Current limitations

- Bookmarks and reading progress are stored in this browser only; they do not sync between devices.
- Offline access is best-effort and limited to content already cached by the browser. Audio requires a network connection.
- Tafsir, multi-language translations, full-text verse search, user accounts, automated content-integrity tests, and the React Native/Expo app are not implemented yet.
- No deployment URL is configured by this repository itself. GitHub Pages can be enabled in repository settings when ready.

## Roadmap

1. **Reliability:** test all 114 surahs and expected ayah counts, guard against out-of-order requests, add stronger offline handling, and document content checks.
2. **Study tools:** add a source-attributed tafsir panel, reciter controls, saved-verse view, and more robust progress/bookmark UX.
3. **Android:** build a React Native + Expo app and share the same documented content sources.
4. **Community release:** usability testing, accessibility checks, privacy review, and a clear report/correction workflow.

## Privacy

The current prototype does not require an account. Bookmarks, cached chapters, and reading progress are stored in the browser's local storage. Clearing browser site data removes them.
