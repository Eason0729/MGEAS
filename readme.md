# MGEAS

[website](http://mgeas.surge.sh)
mgeas is a music game(which is also one of my homework).

```json
{
  "path": {
    "audio": "relative path to audio file(*.mp3)",
    "midi": "relative path to track file(*.json)"
  },
  "play": {
    "track": {
      "forbid": "the track iter which you don't want to play in game",
      "total": "total melody"
    },
    "drop": {
      "speed": "the speed of melody",
      "delay": "gameplay delay which should great enough for meloady drop from top to buttom of the screen(second)",
      "maxdur": "max duration of each molody",
      "end": "how long the song is"
    },
    "click": {
      "per": 4,
      "low": "define the lowest melody",
      "high": "define the highest melody",
      "cal": "high - low",
      "trans": {}
    }
  }
}
```
- [ ] add a logo to website 
