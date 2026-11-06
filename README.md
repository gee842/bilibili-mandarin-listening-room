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
