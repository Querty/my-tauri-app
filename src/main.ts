import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { setupAlbums, syncPlayerState, playPause, playNext, playPrevious, setVolume, setShuffle} from "./methods";
import { getCurrentWindow } from '@tauri-apps/api/window';

// --- SVG Icons Constants ---
export const ICONS = {
    prev: `<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6l-8.5 6z"/></svg>`,
    next: `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
    play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    shuffle: `<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`,
    volume: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`
};

// get elemnts
const trackBtn = document.getElementById("trackBtn") as HTMLButtonElement;
const prevBtn = document.getElementById("prevBtn") as HTMLButtonElement;
const playPauseBtn = document.getElementById("playPauseBtn") as HTMLButtonElement;
const nextBtn = document.getElementById("nextBtn") as HTMLButtonElement;
const shuffleBtn = document.getElementById("shuffleBtn") as HTMLButtonElement;
const volumeBtn = document.getElementById("volumeBtn") as HTMLInputElement;
const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;
const dropWindowIcon = document.getElementById("dropWindowIcon") as HTMLDivElement
const dropWindowVolume = document.getElementById("dropWindowVolume") as HTMLDivElement;

/// Initialize Static Icons
prevBtn.innerHTML = ICONS.prev;
nextBtn.innerHTML = ICONS.next;
volumeBtn.innerHTML = ICONS.volume;
shuffleBtn.innerHTML = ICONS.shuffle;

// display albums
await setupAlbums();

// dropdown menus and closings
trackBtn.addEventListener("click", async (event) => {
  event.stopPropagation();
  dropWindowIcon.classList.toggle("hidden");
  dropWindowVolume.classList.add("hidden");
});

volumeBtn.addEventListener("click", async (event) => {
  event.stopPropagation();
  dropWindowVolume.classList.toggle("hidden");
  dropWindowIcon.classList.add("hidden");
});

window.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".menu-container")) {
    dropWindowIcon.classList.add("hidden");
    dropWindowVolume.classList.add("hidden");
  }
});

playPauseBtn.addEventListener("click", async () => playPause());
shuffleBtn.addEventListener("click", async () => setShuffle());
nextBtn.addEventListener("click", async () => playNext());
prevBtn.addEventListener("click", async () => playPrevious());
volumeSlider.addEventListener("input", async () => setVolume());
// closing logic
const closeBtn = document.getElementById("closeBtn");

closeBtn?.addEventListener("click", async () => {
  const appWindow = getCurrentWindow();
  await appWindow.close();
});

const startPolling = async () => {
  try {
    await syncPlayerState();
  } catch (error) {
    console.error("Polling error:", error);
  }
  setTimeout(startPolling, 2000);
};

startPolling();