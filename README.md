# Elfos Elb — musikspelare

En fristående, responsiv artistsida med musikspelare. Öppna `index.html` direkt eller starta en lokal server:

```bash
python3 -m http.server 8080
```

Besök sedan `http://localhost:8080`.

## Lägg in riktiga låtar

1. Skapa mappen `music` och lägg dina MP3-filer där.
2. Öppna `app.js` och ändra listan `tracks`.
3. Ersätt demo-fälten `frequency` och `mood` med exempelvis `src: "music/min-lat.mp3"`.

```js
{
  title: "Min låt",
  subtitle: "Singel · 2026",
  duration: "3:42",
  src: "music/min-lat.mp3"
}
```

Använd gärna MP3-filer omkring 192–256 kbps för en bra balans mellan ljudkvalitet och laddningstid.
