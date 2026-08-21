// Byt senare ut demo-inställningarna mot riktiga ljudfiler, till exempel:
// { title: "Min låt", subtitle: "Singel · 2026", duration: "3:42", src: "music/min-lat.mp3" }
const tracks = [
  { title: "Mellan världar", subtitle: "Demo · 2026", duration: "0:24", frequency: 110, mood: "minor" },
  { title: "Nattens signal", subtitle: "Demo · 2026", duration: "0:24", frequency: 146.83, mood: "major" },
  { title: "Ingenstans nära", subtitle: "Demo · 2026", duration: "0:24", frequency: 98, mood: "minor" },
  { title: "Efter ljuset", subtitle: "Demo · 2026", duration: "0:24", frequency: 130.81, mood: "major" }
];

const audio = new Audio();
audio.preload = "metadata";
let activeIndex = -1;
let generatedUrls = [];

const els = {
  list: document.querySelector("#trackList"), player: document.querySelector("#player"),
  title: document.querySelector("#playerTitle"), meta: document.querySelector("#playerMeta"),
  play: document.querySelector("#playPause"), icon: document.querySelector("#playIcon"),
  previous: document.querySelector("#previous"), next: document.querySelector("#next"),
  progress: document.querySelector("#progress"), current: document.querySelector("#currentTime"),
  duration: document.querySelector("#duration"), volume: document.querySelector("#volume"),
  heroPlay: document.querySelector("#heroPlay")
};

function renderTracks() {
  els.list.innerHTML = tracks.map((track, index) => `
    <article class="track" data-index="${index}" tabindex="0" aria-label="Spela ${track.title}">
      <span class="track-index">${String(index + 1).padStart(2, "0")}</span>
      <div><span class="track-title">${track.title}</span><span class="track-subtitle">${track.subtitle}</span></div>
      <span class="track-duration">${track.duration}</span>
      <button class="track-play" aria-label="Spela ${track.title}">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
      </button>
    </article>`).join("");
}

function createDemoAudio(track) {
  if (track.src) return track.src;
  const sampleRate = 22050;
  const seconds = 24;
  const samples = sampleRate * seconds;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const writeText = (offset, value) => [...value].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  writeText(0, "RIFF"); view.setUint32(4, 36 + samples * 2, true); writeText(8, "WAVE");
  writeText(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  writeText(36, "data"); view.setUint32(40, samples * 2, true);
  const scale = track.mood === "minor" ? [1, 1.2, 1.5, 1.78] : [1, 1.25, 1.5, 2];
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const note = scale[Math.floor(t / 3) % scale.length];
    const beat = Math.pow(Math.max(0, Math.sin(Math.PI * (t % .75) / .75)), 3);
    const fade = Math.min(1, t * 2, (seconds - t) * .6);
    const wave = Math.sin(2 * Math.PI * track.frequency * note * t) * .27 + Math.sin(2 * Math.PI * track.frequency * note * 2.01 * t) * .09;
    const pulse = Math.sin(2 * Math.PI * track.frequency / 2 * t) * beat * .14;
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, (wave + pulse) * fade)) * 32767, true);
  }
  const url = URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
  generatedUrls.push(url);
  return url;
}

function selectTrack(index, autoplay = true) {
  const wasSame = index === activeIndex;
  if (wasSame && !audio.paused) { audio.pause(); return; }
  if (!wasSame) {
    activeIndex = index;
    audio.src = createDemoAudio(tracks[index]);
    els.title.textContent = tracks[index].title;
    els.meta.textContent = `Elfos Elb · ${tracks[index].subtitle}`;
    els.duration.textContent = tracks[index].duration.replace(/^0:/, "0:");
    document.querySelectorAll(".track").forEach((row, i) => row.classList.toggle("active", i === index));
  }
  els.player.classList.add("visible");
  if (autoplay) audio.play().catch(() => {});
}

function updatePlayState() {
  const playing = !audio.paused;
  els.icon.setAttribute("d", playing ? "M7 5h4v14H7zm6 0h4v14h-4z" : "M8 5v14l11-7z");
  els.play.setAttribute("aria-label", playing ? "Pausa" : "Spela");
  document.querySelectorAll(".track-play svg path").forEach((icon, i) => {
    icon.setAttribute("d", playing && i === activeIndex ? "M7 5h4v14H7zm6 0h4v14h-4z" : "M8 5v14l11-7z");
  });
}

function formatTime(value) {
  if (!Number.isFinite(value)) return "0:00";
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
}

renderTracks();
document.querySelectorAll(".track").forEach((row) => {
  const activate = () => selectTrack(Number(row.dataset.index));
  row.addEventListener("click", activate);
  row.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
});
els.heroPlay.addEventListener("click", () => selectTrack(activeIndex < 0 ? 0 : activeIndex));
els.play.addEventListener("click", () => activeIndex < 0 ? selectTrack(0) : audio.paused ? audio.play() : audio.pause());
els.previous.addEventListener("click", () => selectTrack((activeIndex - 1 + tracks.length) % tracks.length));
els.next.addEventListener("click", () => selectTrack((activeIndex + 1) % tracks.length));
els.volume.addEventListener("input", () => { audio.volume = Number(els.volume.value); els.volume.style.setProperty("--value", `${els.volume.value * 100}%`); });
els.progress.addEventListener("input", () => { if (audio.duration) audio.currentTime = (Number(els.progress.value) / 100) * audio.duration; });
audio.addEventListener("play", updatePlayState);
audio.addEventListener("pause", updatePlayState);
audio.addEventListener("ended", () => selectTrack((activeIndex + 1) % tracks.length));
audio.addEventListener("timeupdate", () => {
  const percent = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
  els.progress.value = percent;
  els.progress.style.setProperty("--value", `${percent}%`);
  els.current.textContent = formatTime(audio.currentTime);
  if (audio.duration) els.duration.textContent = formatTime(audio.duration);
});
audio.volume = Number(els.volume.value);
document.querySelector("#year").textContent = new Date().getFullYear();
window.addEventListener("beforeunload", () => generatedUrls.forEach(URL.revokeObjectURL));
