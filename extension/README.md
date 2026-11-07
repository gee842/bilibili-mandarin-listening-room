# 听懂 — Bilibili Mandarin Listening Room 0.4.0

A desktop Chrome extension that connects to Bilibili’s original video element. Playback stays on Bilibili. The bundled full lesson is for [《战国策》：看透人心，守住自己 — 故纸观今](https://www.bilibili.com/video/BV1MRJa6sEsk/). Other BV videos and multipart episodes can have separately prepared or imported lessons.

## Install or update

1. Extract the extension ZIP to a permanent folder.
2. In desktop Chrome, open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the folder containing `manifest.json`.
3. For an existing unpacked installation, replace its files, press **Reload** on its extension card, then refresh Bilibili.
4. Open a Bilibili video. The panel appears below the player; the extension toolbar button shows or hides it.

Version 0.3 uses a stable extension ID for its local helper: `cmepppkccifipfbkjmkcdhggecnahfji`. If Chrome shows both an older version and 0.3, export any imported lessons you want to keep before removing the older card. Lessons stored under an older extension ID do not move automatically.

Chrome on iPhone does not support Chrome extensions. The companion website remains available for mobile use.

## Prepare this video

Install the one-time [local preparation helper](https://gee842.github.io/bilibili-mandarin-listening-room/mandarin-pipeline-helper.zip), then open **Transcript** and press **Prepare this video** on the current recording. Chrome starts the helper when needed. It retrieves the publicly accessible audio for private processing, transcribes Mandarin, corrects/translates the text, adds pinyin/vocabulary, runs forced alignment and adds literal character meanings. A valid finished lesson loads automatically and is saved for this video and part.

Progress and Cancel appear in the panel. Preparation uses your configured OpenAI API account and incurs usage charges. Audio chunks are sent for transcription and transcript text for editing/translation. Audio and provider checkpoints remain local and are not rehosted. The API key stays in the helper’s private local `.env`; it is not included in the extension or either downloadable ZIP.

Finished stages are cached. Failed/cancelled jobs can resume without repeating those stages. An API operation already in progress may finish before cancellation takes effect. There are no automatic billable retries. The pipeline stops further submissions if over half of more than ten attempted calls have operationally failed; provider rejections are tracked separately.

Inaccessible, login-only, paid or region-restricted videos are not bypassed. The pipeline fails rather than selecting another recording. New lessons remain automated drafts, not fully reviewed transcripts.

## Dark and Focus modes (0.3.2)

Video pages start in dark mode. **Dark** in the control strip switches between dark and the original light appearance. This themes the Bilibili page, captions, transcript and vocabulary notes without inverting or dimming video pixels. **Focus** hides the site header, recommendations and surrounding page clutter, leaving the original video and learning panel. Both choices are saved locally and shared between this extension’s video tabs. Turn Focus off to restore the original page layout. The same switches are available on the companion website.

## Compact study layout (0.3.1)

Chinese, ruby pinyin and English sit immediately below the original video. A single compact control strip sits below the subtitles. Routine connection and completed-job banners stay hidden. The video’s available height adjusts to keep subtitles and controls in the same viewport; minimizing the panel restores Bilibili’s normal size. Long subtitles scroll within the caption area without pushing the video out of view. Vocabulary notes open directly underneath the bilingual sentence, inside its caption area or transcript row. Opening a note pauses playback; the note scrolls independently and leaves the video unobstructed.

## Study controls

- Tone-marked pinyin directly above Chinese using compact ruby annotations, with natural English below. Logical word groups remain clickable and highlight together.
- Click a word for its whole meaning, individual character senses and available idiom/composition notes. Literal character senses are reading aids, not etymologies. Personal names are identified as names.
- Sentence and word replay, play/pause, ±10 seconds, position slider and speed 0.5×–2×.
- The panel stays below the player in normal/wide viewing and moves inside the fullscreen video container as an overlay. **Fullscreen** in the panel opens this study view. Native system video-only fullscreen and picture-in-picture cannot host arbitrary HTML overlays.
- **Transcript** opens the following transcript, preparation button, search and file controls, including during fullscreen.

## Editable lessons

Import a matching aligned lesson JSON or export the current lesson/template. Imports are validated, saved only in local extension storage and reloaded on return. Each BV ID and `?p=` part uses its own lesson; changing videos clears the previous captions and scheduled replay stop. Without a lesson, playback controls remain available and subtitles show an explicit empty state.

The schema is version 1. `source.bvid` must match the current video and `source.page` its current part (default 1). Each sentence needs `start`, `end`, `zh`, `en`, `pinyin`, `words`; each word needs those same timing/text fields. Times are absolute seconds in the original recording. Words concatenate to sentence Chinese, ignoring punctuation/spacing. Optional `characterBreakdowns` maps a word to `{characters:[{zh,pinyin,en}],note}`; the character list must reproduce the word exactly. JSON imports must be under 5 MB. Chrome’s local storage quota also applies.

## Privacy and limitations

Permissions: `storage` for local lessons and `nativeMessaging` for the installed preparation helper. Content scripts run on the desktop/mobile Bilibili domains; they do not request cookie, browsing-history or microphone permissions. No source audio or API credentials are published. Clicking Prepare sends only the current BV ID and part number to the local helper; arbitrary URLs, file paths and shell commands are not accepted.

The bundled lesson has 460 subtitle segments, 5,714 vocabulary occurrences and 2,347 distinct multi-character breakdowns. Whisper-1 supplied ASR, automated editorial passes supplied corrections/English/pinyin, and stable-ts / Whisper tiny supplied forced alignment. 97 zero-length forced results retain ASR timing and are flagged. The original and newly generated lessons remain drafts without complete human linguistic/acoustic review. New lessons flag dictionary vocabulary fallback and ASR timing fallback separately.

Bilibili may change its layout or override settings. Background tabs may delay replay stopping; study with the tab visible. Long recordings take time and require Chrome to remain open. Loading a generated lesson into a separate Chrome profile requires either running Prepare there (which returns the local cached lesson) or importing its exported JSON.

## Dictionary attribution

Character and fallback vocabulary glosses are adapted from [CC-CEDICT](https://cc-cedict.org/wiki/), downloaded from MDBG, under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Senses were abridged, readings selected automatically and learner/composition notes added. The derived dictionary, character data and adapted notes use that license, with attribution in the interface. This does not change any recording’s rights.

## Linked meanings and inline notes (0.4)

Hover or focus a word in either language to underline its connections in the other language. Tap to keep the connection selected and read the explanation directly beneath that bilingual sentence. Pinyin follows its Chinese base. Playback also highlights the corresponding English phrase. Notes work below the player, in the transcript and in fullscreen, and opening one pauses playback for reading. Close the note or press Escape, then resume with Play. Matching underlines use three muted accents; double underlines indicate overlapping connections.

Links support reordered, discontinuous, many-to-many and overlapping phrases. Chinese grammar without a separate English counterpart and English-only wording have explicit notes. The natural English translation is preserved. These are automatic contextual links, not a full linguistic review; uncertain counterparts stay unlinked and marked for review.

Existing known lessons get a text-fingerprint-checked upgrade when the extension loads them. It preserves source identity, edited text, timestamps and existing meaning links. The public upgrade file contains token indices/fingerprints and generic unmatched-word notices; private lesson transcripts and detailed new-video teaching notes remain local. A modified translation or word segmentation needs its own updated links: import a matching upgraded JSON or use Prepare with the updated helper. Preparing a cached old lesson adds links without repeating ASR or forced alignment. Future preparation includes this stage automatically. The helper on this Mac is updated with this release; other installations must update the helper files.

Editable JSON: each sentence may contain `meaningLinks: [{zh: [0, 1], en: [2, 3], note: "optional explanation"}]`. Indices are zero-based into Chinese `words` and English word tokens. English punctuation/spacing are preserved; contractions and hyphenated words are single tokens. A token can occur in several links; indices inside a single link must be unique and ordered. Every token is accounted for, including explicitly unmatched groups with a note. `meaningAlignment.reviewed` remains false.
