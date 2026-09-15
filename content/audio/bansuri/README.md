# Bansuri audio intake

This folder is the intake boundary for recorded Bansuri assets used by the
practice prototype.

## Ventus drop location

Place the vendor-provided files under:

```text
content/audio/bansuri/ventus/
```

Do not rename files before the first intake review. Keep the vendor's folder
structure intact so the sample mapping can be verified against the original
package.

## What to upload

- The relevant WAV/AIFF/MP3 sample files.
- The vendor's included documentation or license text, if supplied.
- The original file names and folders.

Do not upload account credentials, purchase receipts containing personal data,
or unrelated files.

## Integration sequence

1. Inventory files and identify note names, MIDI anchors, articulations, and
   loop information.
2. Create a checked-in manifest with exact paths and anchor MIDI values.
3. Connect the manifest to the existing `bansuri.guide` audio role.
4. Keep the procedural Bansuri voice as a deterministic fallback.
5. Test pitch, onset, duration, stop behavior, cache behavior, and browser
   playback before changing the default prototype voice.

## Intake status (2026-09-01)

The supplied Ventus package was inspected in place at the user's OneDrive
folder. It contains approximately 5.95 GB across 5,476 files: 770 WAV files,
Kontakt instrument files, and 4,698 NCW files. The WAV content is organized
primarily as Close/Room phrases (including Long, Medium, Short, Arps/Runs, and
Unique Notes phrase folders), plus Sitar/Tambura drone samples. The filenames
are phrase indexes rather than explicit MIDI note names, so the package is not
yet a safe one-to-one browser sampler map.

The included 15-page manual confirms that the package is built around Kontakt:
the main `Bansuri.nki` patch contains 14 articulations, while the phrase patches
map keys to phrases. The manual documents fixed utility notes (breath E2/F2/G2/A2
and release B2), but it does not publish a complete pitch-to-WAV table for the
main playable patch. That table must therefore be obtained from the Kontakt
instrument mapping or by rendering known MIDI notes through the patch.

Do not copy the full package into Git or Vercel. The next intake step is to
render or export a small, documented chromatic set from the Kontakt instrument
(or obtain a vendor-supplied web-ready mapping), then add only those approved
assets under this folder with a manifest. Until that mapping exists, the
procedural Bansuri guide remains the default fallback.
