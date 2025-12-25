import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { setupAlbums, syncPlayerState, playPause, playNext, playPrevious, setVolume, setShuffle, connect} from "./methods";

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
//check connection
await connect();
// icon setup
prevBtn.textContent = "⏮️";
nextBtn.textContent = "⏭️";
volumeBtn.textContent = "🔊";

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

await syncPlayerState();

setInterval(() => {syncPlayerState();}, 2000);