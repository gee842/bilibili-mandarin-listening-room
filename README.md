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
