# Local Mandarin preparation helper

The extension’s **Prepare this video** button asks this helper to retrieve the current public Bilibili recording for private processing, transcribe Mandarin with Whisper-1, correct/translate with GPT-4.1-mini, create pinyin and vocabulary notes, run local forced alignment with stable-ts / Whisper tiny, add character glosses, and load the editable lesson back into the extension. Playback remains on Bilibili.

## One-time setup on macOS

1. Install [uv](https://docs.astral.sh/uv/) and [FFmpeg](https://ffmpeg.org/). Homebrew users can run `brew install uv ffmpeg`.
2. Extract this helper ZIP. Double-click **Install helper.command**. The installer creates its own Python environment if necessary, installs its requirements, and asks for an OpenAI API key when one is not already configured.
3. Load or reload extension **0.3.0**, then refresh the Bilibili tab. The stable extension ID is printed by the installer. If an older extension remains listed, use the new 0.3 card; older installations may have a different ID.
4. Open a Mandarin Bilibili video and press **Prepare this video**. Preparation uses the configured API account and incurs provider usage charges. Progress appears in the panel; the lesson loads and is saved automatically.

The helper is registered only for this extension using Chrome native messaging. Chrome starts it when needed; no public server or continuously running web service is required. Chrome’s Native Messaging permission is needed in addition to local lesson storage. The installer uses the current user’s Chrome native-host directory; no administrator access is required.

For an existing Python environment with the required libraries, the installer supports `python3 install.py --python /absolute/path/to/python`. It also accepts `--jobs`, `--models`, `--app-dir`, and `--native-dir` for explicit installation locations. Standard installs use `~/Library/Application Support/Tingdong Pipeline/` and Chrome’s per-user `NativeMessagingHosts` directory.

## Privacy, progress and resume

The API key lives only in the helper’s local `.env` with owner-only permissions. No key is included in either ZIP or lesson JSON. Audio chunks are sent to the OpenAI transcription endpoint; the transcript is sent for editing/translation. Audio, provider results and checkpoints stay in the local job folder and are not rehosted. Imported or generated lessons stay in local Chrome storage unless you explicitly export/share them.

Each video and multipart episode has its own cached source, ASR, editing, forced-alignment and final JSON files. Repeating preparation resumes completed stages instead of paying for them again. A cached finished lesson returns directly. Cancel stops new submissions, requests termination of the current media operation, and preserves completed stages. An API request already in progress may finish before cancellation takes effect. Closing Chrome or reloading the extension stops the local worker; reopen the video and press Prepare to resume.

Only canonical Bilibili BV IDs and integer part numbers are accepted. Arbitrary URLs, cookies, shell commands and local file paths are not accepted from the extension. Login-only, paid, region-restricted or otherwise inaccessible recordings are not bypassed. Failure is shown rather than substituting another recording.

All attempted API calls are recorded, including failures. Further submissions stop when more than ten attempts have occurred and over half are operational failures. Provider rejections are recorded separately. There are no automatic billable retries; pressing Prepare resumes from saved stages. Cancellation is checked before each new submission.

## Quality and output

The resulting lesson remains an automated draft, without a complete human linguistic/acoustic review. Forced alignment uses sentence bounds derived from ASR. Zero-length forced results use ASR timing and are explicitly flagged, with an `alignment-review.json` sidecar. The extension still validates video identity, word coverage and timing before replacing any existing lesson. Generated compact lesson data must fit the extension’s 5 MB import limit and Chrome’s local storage quota.

Character glosses are adapted from [CC-CEDICT](https://cc-cedict.org/wiki/) under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), with abridged senses and added learner/composition notes. The derived dictionary and notes use the same license. Character meanings are reading aids, not etymologies; sense and pronunciation choices can need correction.

The first alignment run downloads the open-source Whisper tiny model if it is not already cached. This uses this Mac’s CPU. Long videos take time, and Chrome must remain open. The pipeline prepares the full selected part; it never publishes the source audio.

## Remove

Delete `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.tingdong.pipeline.json` to unregister the helper. Delete `~/Library/Application Support/Tingdong Pipeline/` to remove its runtime, API key and local caches. Removing the extension separately clears its Chrome-local lessons.

Chunks are prepared with up to three concurrent API operations, while local alignment runs in recording order. The attempt log is synchronized across workers. If the editing model’s word groups omit characters, exact Chinese sentence text is preserved and missing vocabulary is filled from CC-CEDICT, flagged `segmentationStatus: "dictionary-fallback"`. This repair does not submit another API request. These dictionary senses may need contextual review.

## Linked meanings and inline notes (0.4)

Hover or focus a word in either language to underline its connections in the other language. Tap to keep the connection selected and read the explanation directly beneath that bilingual sentence. Pinyin follows its Chinese base. Playback also highlights the corresponding English phrase. Notes work below the player, in the transcript and in fullscreen, and opening one pauses playback for reading. Close the note or press Escape, then resume with Play. Matching underlines use three muted accents; double underlines indicate overlapping connections.

Links support reordered, discontinuous, many-to-many and overlapping phrases. Chinese grammar without a separate English counterpart and English-only wording have explicit notes. The natural English translation is preserved. These are automatic contextual links, not a full linguistic review; uncertain counterparts stay unlinked and marked for review.

Existing known lessons get a text-fingerprint-checked upgrade when the extension loads them. It preserves source identity, edited text, timestamps and existing meaning links. The public upgrade file contains token indices/fingerprints and generic unmatched-word notices; private lesson transcripts and detailed new-video teaching notes remain local. A modified translation or word segmentation needs its own updated links: import a matching upgraded JSON or use Prepare with the updated helper. Preparing a cached old lesson adds links without repeating ASR or forced alignment. Future preparation includes this stage automatically. The helper on this Mac is updated with this release; other installations must update the helper files.

Editable JSON: each sentence may contain `meaningLinks: [{zh: [0, 1], en: [2, 3], note: "optional explanation"}]`. Indices are zero-based into Chinese `words` and English word tokens. English punctuation/spacing are preserved; contractions and hyphenated words are single tokens. A token can occur in several links; indices inside a single link must be unique and ordered. Every token is accounted for, including explicitly unmatched groups with a note. `meaningAlignment.reviewed` remains false.
