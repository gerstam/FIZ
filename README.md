# Monaco RedZone - FiveM Loading Screen

A custom loading screen for FiveM ESX servers with a red/dark hardcore roleplay aesthetic.

## Features

- Animated logo with floating effect and red glow
- Real FiveM loading progress (falls back to fake progress when previewed in browser)
- Background video + music with mute toggle (top-right)
- Live-feel server tag, players counter, ping & region
- Discord card + staff team panel with online indicators
- Quick rules card
- Floating red particles, scanlines, and vignette for cinematic feel
- Fully responsive (1080p, 1440p, 4K)

## Setup

1. Drop the whole folder into your server's `resources/` directory and rename it (e.g. `monaco_loadingscreen`).
2. Add this to your `server.cfg`:
   ```
   ensure monaco_loadingscreen
   ```
3. Place these files inside the resource folder:
   - **`logo.png`** - the Monaco RedZone logo image you provided
   - **`video.mp4`** - your background video (loops, muted)
   - **`music.mp3`** - your background music

   Recommended sizes:
   - Logo: 1920x1080 PNG with transparency (or just the artwork)
   - Video: 1080p, <30 MB, H.264 MP4
   - Music: ~3-5 minutes, <8 MB, MP3 128-192 kbps

4. Restart your server. Done.

## Preview in browser

Just open `index.html` directly - the progress bar will animate from 0 to 100% with rotating loading messages so you can see exactly how it'll look in-game.

## Customizing

| What | Where |
|------|-------|
| Server name / version | `index.html` (`.server-tag`) |
| Logo tagline | `index.html` (`.tagline`) |
| Discord invite | `index.html` (`.discord-link`) |
| Staff members | `index.html` (`.staff-grid`) |
| Quick rules | `index.html` (`.rules-list`) |
| Loading messages | `script.js` (`messages` array) |
| Player count fake numbers | `script.js` (`animatePlayers`) |
| Colors (red / black) | `style.css` (`:root` variables) |

## Notes

- `loadscreen_manual_shutdown 'yes'` keeps the screen up until the client is fully in-game.
- Music autoplay is restricted by Chromium - in FiveM it works fine, but in browser preview you may need to click once to start the audio.
