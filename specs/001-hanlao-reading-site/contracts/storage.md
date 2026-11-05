# localStorage contract

- `hanlao:prefs:v1` → `{theme:'light'|'sepia'|'mint'|'blue'|'pink'|'dark'|'night', font:'serif'|'sans', size:14..28 (px), lineHeight:1.4..2.4, width:520..900 (px), speed:1..10}`
- `hanlao:progress:v1` → `{ "<series>/<episode>": {ratio:0..1, y:number, t:epochMs} }`
- `hanlao:last:v1` → `{series, episode, title, url, t}`
All access wrapped in try/catch; invalid values fall back to defaults.
