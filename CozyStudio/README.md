# CozyStudio

Static Web Bluetooth app for CozyLady / LotusLamp X-style LED bars. Plain HTML/CSS/JS, no build step, ~40 KB.
Files: `index.html`, `styles.css`, `js/{app,bluetooth,protocol,animations,presets}.js`. To change protocol, replace only `js/protocol.js`.

## Run locally (no installs)
Web Bluetooth needs HTTPS or localhost; `file://` will not work (ES modules).
- Python (if installed): `python -m http.server 8000` in this folder, open http://localhost:8000
- No Python: any static server, or just deploy to GitHub Pages.

## Deploy to GitHub Pages
```
git init && git add . && git commit -m "CozyStudio"
git branch -M main
git remote add origin https://github.com/<you>/CozyStudio.git
git push -u origin main
```
Repo > Settings > Pages > Source: "Deploy from a branch", branch `main`, folder `/ (root)`. Open `https://<you>.github.io/CozyStudio/`.

## Connect
- Windows 11: Chrome or Edge, Bluetooth on, light bars powered. Close LotusLamp X on your phone first (the controller reportedly accepts one connection).
- Android: Chrome, Bluetooth on, Location on (older Android needs it for BLE scans), then open the Pages URL.
1. Click **Connect Lights**. Default discovery is "All advertising devices" because the CozyLady name is unknown. Pick your controller (likely a `MELK-...`/`ELK-...` name, but not assumed).
2. Diagnostics shows real services/characteristics. If FFF0/FFF3 are present, run **Send test colour**, then confirm whether the lights turned blue. Until you confirm, no other command is sent.

Web Bluetooth cannot do unrestricted scanning or read services you did not declare. `acceptAllDevices` lists every advertiser, but only services in `optionalServices` (FFF0 plus anything in Settings) are accessible. If your controller uses a different service, find its UUID (e.g. nRF Connect on Android) and add it in Settings.

## Protocol report
Sources reviewed: wporter82/lotus-lamp-python `docs/PROTOCOL.md` and the l0lsec/LotusLampX page. Neither was tested on CozyLady.

| Item | Status |
|---|---|
| Service FFF0, write FFF3 (no response), notify FFF4 | Reported by both sources (MELK-OA10 device) |
| 9-byte frame `7E LEN CMD p3 p4 p5 p6 p7 EF`, unused params `FF` | Reported (wporter82; l0lsec agrees on 9 bytes) |
| Colour `7E 07 05 03 RR GG BB 10 EF` | Reported "tested" by wporter82 only |
| Brightness `7E 07 01 XX FF FF FF 00 EF`, 0-100 | wporter82. l0lsec says 0-255: **conflict**, unresolved |
| Speed `7E 04 02 XX FF FF FF 00 EF`, 0-100; no effect on solid colour | wporter82; l0lsec says 0-255: **conflict** |
| Mode `7E 07 03 XX FF FF FF 00 EF`, 0-212 | wporter82 numbering for MELK-OA10; l0lsec lists different small mode/scene IDs (frames not shown on its page) |
| Power on/off bytes | **Not documented in the pages fetched.** App uses black colour for off. Sources warn `7E 00 05/06 ...` freezes the lamp, so none are sent |
| Single zone (two bars not independent) | Reported single-zone; not verified for CozyLady |
| Per-pixel / RGBW | No evidence; treated as unsupported |
| Streaming colour | Reported ~10 Hz max, 50 ms minimum; default here 150 ms |
| Acks/notifications | None documented; a GATT write success does not prove the LEDs changed |
| Timer commands (`7E 07 82`, `7E 06 83`) | Documented upstream, deliberately not implemented |

Consequence: spatial effects (gradient, wave, running, bounce, meteor) are **preview only**. Solid, fade, rainbow, alternating and keyframe animations can be streamed as a single colour. Built-in effects are sent by mode number.

## Test checklist (H = needs your hardware)
1. Page loads, no console errors. 2. Preview animates while disconnected. 3. Connect Lights opens the chooser (H). 4. Real device name shown (H). 5. Connects (H). 6. Services/characteristics listed (H). 7. Disconnect, and power-cycling the bars, leave the app responsive (H). 8. Test colour changes the lights (H). 9. Answering "No" locks commands. 10. All animation types preview. 11. Apply to Lights streams a stream-type animation (H). 12. Presets survive reload. 13. Windows Chrome/Edge and Android Chrome (H). 14. Pages URL loads over HTTPS.
Automated here: JS syntax, frame bytes versus the documented examples, and animation output ranges. Browser UI and Bluetooth were not run.

## Troubleshooting
Chooser empty: bars off, connected to the phone app, or Bluetooth off. "Unavailable": use Chrome/Edge over HTTPS. Permission blocked: reset site permissions (lock icon). GATT error: move closer, power-cycle, close other apps. Windows: pair is not needed; remove stale pairing if connect hangs.

## Roadmap
Verified on-hardware mode names; power command once confirmed; per-keyframe timing; music reactivity (needs mic permission, only if you want it); detection for other controller families via additional adapters.

## Custom colours and patterns
Animation Studio: pick a type, then edit the palette (colour boxes; "+ Colour" / "- Last colour"; up to 12). Examples:
- Red/blue strobe: type Strobe, palette red + blue; Speed sets flashes per second (0.5-3.5). Flashes stream at your command interval, so keep it low; faster strobing should use the controller's built-in strobe mode (mode number unconfirmed for CozyLady).
- Red > orange > yellow flow: type "Colour loop", palette red, orange, yellow (add more stops freely); Direction reverses the flow.
Press Apply to Lights after the protocol test.
