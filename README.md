# Mandarin listening room

Exact source: [《战国策》：看透人心，守住自己 — 故纸观今](https://m.bilibili.com/video/BV1MRJa6sEsk), 36:11.

The public website uses Bilibili's official embedded player, documented at https://player.bilibili.com/. No source audio is included or rehosted. The source metadata has `no_reprint: 1`; a download flag is not a redistribution license.

Bilibili's documented embed does not expose an external playback clock. Consequently this website does not claim automatic synchronization in embed mode. A desktop Chrome extension is supplied separately to connect directly to the original video element and its real clock. Chrome on iPhone cannot run Chrome extensions.

Native web controls are available when choosing a local, original, untrimmed copy of this exact recording. The file stays on the device and is not uploaded. Hosted audio is supported only with `audio: {"url": "https://…", "authorized": true}` in lesson JSON. Set that only when redistribution is authorized. The server must support byte range requests and an iPhone-compatible audio format; `preload="metadata"` avoids requesting the full file up front.

## Lesson data

Edit `data/lesson.json` or import an edited JSON from the page. Imports are validated before replacing the current lesson. They remain in memory and can be exported. Imported hosted audio URLs do not auto-load. The exact Bilibili ID is enforced. Each sentence needs `start`, `end`, `zh`, `en`, `pinyin`, and `words`. Every word needs `start`, `end`, `zh`, `en`, `pinyin`, and optionally `note`. Times are absolute seconds in the original recording, sorted, positive duration, and contained within each sentence. Word Chinese must concatenate to sentence Chinese, ignoring punctuation and whitespace.

`alignment.method` and `alignment.reviewed` distinguish ASR timestamps, forced alignment, and completed editorial review. Empty lesson data is an explicit pending state, not a transcribed recording.

## Local checks

Requires Node 18+ for tests and Python 3 for local serving; the website has no runtime libraries, external fonts, or build step.

```
npm test
npm run serve
```

Open http://localhost:8080. Deploy these static files to GitHub Pages or Cloudflare Pages. No server functions, secrets, or source audio are required.

## Bundled lesson status

The complete recording was transcribed with Whisper-1 in 37 chunks. The lesson contains 460 subtitle segments and 5,714 vocabulary units, with automated Chinese correction, English translation, and contextual tone-marked pinyin. Stable-ts / Whisper tiny performed forced alignment within ASR-derived sentence ranges. 97 zero-length forced word results use ASR timing as a fallback, identified by `timingStatus: "asr-fallback"`. Common names and idioms received an additional manual correction pass. The transcript remains an automated draft; no complete human linguistic or acoustic review is claimed.

A second editorial pass with GPT-4.1 refined all 460 English subtitles for fluency and historical names. This does not constitute a complete human review.

## Character meanings and ruby pinyin (0.2)

Chinese captions and transcript words now use HTML ruby: small pinyin annotations directly above their Chinese bases. Word buttons retain their original aligned timing spans. If syllables cannot be mapped safely, pronunciation is attached to the whole word instead.

Word explanations include the combined contextual meaning, individual character senses, and available notes explaining idioms/compounds. All 2,347 distinct multi-character groups in the bundled lesson have a breakdown in `characterBreakdowns`. Character senses are dictionary aids, not etymologies or guarantees about a compound’s historical construction. Sense/reading selection is automated and has not received complete human review.

Character glosses are adapted from [CC-CEDICT](https://cc-cedict.org/wiki/), downloaded from MDBG under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Senses were abridged and learner glosses/composition notes added. The derived `characterBreakdowns` data and notes are shared under that license. Attribution is visible in word explanations. The recording remains on its original host.

The desktop extension now supports playback controls on other Bilibili BV videos, with separately imported and locally saved lessons for each video and part. Version 0.3 adds a Prepare this video button connected to a locally installed helper, which transcribes, translates and aligns new videos using the configured API account. Each video retains its own lesson. The extension panel docks below the player and becomes an overlay inside browser fullscreen. Native video-only fullscreen/PiP cannot host the HTML panel.

The website’s **Fullscreen study view** keeps the embedded player and lesson together in a fullscreen workspace. Bilibili’s iframe’s own fullscreen is separate and cannot display this website’s external captions. The cross-origin embed clock limitation remains unchanged.

## Prepare this video (0.3)

The extension’s preparation button connects through Chrome native messaging to a per-user local helper. The helper uses the existing Whisper-1 / GPT-4.1-mini / stable-ts pipeline, reports progress, supports checkpoint resume/cancel, and returns the validated lesson to local Chrome storage. No API key or audio is included in either public ZIP. Preparing a new recording incurs API usage and sends audio/text to OpenAI for processing. See [the helper README](pipeline/README.md) and [extension README](extension/README.md).

Source for the extension is in `extension/`; source for the local helper is in `pipeline/`. Build the two ZIPs with `python3 scripts/build_extension.py`. This produces the website download files and sibling output copies. The helper ZIP uses an explicit file allowlist to exclude local credentials, audio, caches and checkpoints. The extension has a stable public manifest key so Chrome’s registered native host can allow only this extension.

Regression checks: `npm test` and `python3 -m unittest discover -s pipeline/tests -v` (the latter’s grouping fallback test requires the helper’s Python dependencies).

## Compact reading layout (0.3.1)

The extension puts subtitles immediately beneath the video, with a single control strip underneath. Routine connection/completion banners stay hidden; Transcript contains preparation and lesson tools. The video height leaves room for readable Chinese, pinyin and English on laptop screens, and minimizing restores its normal size. Long captions scroll inside their own area. The companion website also uses a compact heading and puts source notices below its captions.

The optional browser regression in `scripts/check_layout.cjs` requires Playwright and an extension-capable Chromium. Set `CHROMIUM_PATH` and `STUDY_AUDIO` to a local original recording, then run `node scripts/check_layout.cjs`. It checks laptop/narrow layouts, long sentences, replay, character notes, fullscreen, and restoration after minimizing. `STUDY_EXTENSION` can point to an earlier package to reproduce the old layout failure.

## Dark and Focus modes (0.3.2)

The website and extension default to a dark palette. Dark and Focus switches preserve their choices locally. The extension themes original Bilibili video pages without applying image filters to the video. Focus hides surrounding navigation/recommendations and centers the player; switching it off restores the regular page. The website’s Focus mode hides introductory material and the transcript column. Appearance preferences contain no account data or API credentials.

The extension applies page appearance at document start through `extension/appearance.js` and `extension/appearance.css`; the learning panel uses matching semantic color variables. The website loads `appearance.js` before the stylesheet so saved preferences are applied before rendering.

## Linked meanings and inline notes (0.4)

Hover or focus a word in either language to underline its connections in the other language. Tap to keep the connection selected and read the explanation directly beneath that bilingual sentence. Pinyin follows its Chinese base. Playback also highlights the corresponding English phrase. Notes work below the player, in the transcript and in fullscreen, and opening one pauses playback for reading. Close the note or press Escape, then resume with Play. Matching underlines use three muted accents; double underlines indicate overlapping connections.

Links support reordered, discontinuous, many-to-many and overlapping phrases. Chinese grammar without a separate English counterpart and English-only wording have explicit notes. The natural English translation is preserved. These are automatic contextual links, not a full linguistic review; uncertain counterparts stay unlinked and marked for review.

Existing known lessons get a text-fingerprint-checked upgrade when the extension loads them. It preserves source identity, edited text, timestamps and existing meaning links. The public upgrade file contains token indices/fingerprints and generic unmatched-word notices; private lesson transcripts and detailed new-video teaching notes remain local. A modified translation or word segmentation needs its own updated links: import a matching upgraded JSON or use Prepare with the updated helper. Preparing a cached old lesson adds links without repeating ASR or forced alignment. Future preparation includes this stage automatically. The helper on this Mac is updated with this release; other installations must update the helper files.

Editable JSON: each sentence may contain `meaningLinks: [{zh: [0, 1], en: [2, 3], note: "optional explanation"}]`. Indices are zero-based into Chinese `words` and English word tokens. English punctuation/spacing are preserved; contractions and hyphenated words are single tokens. A token can occur in several links; indices inside a single link must be unique and ordered. Every token is accounted for, including explicitly unmatched groups with a note. `meaningAlignment.reviewed` remains false.
