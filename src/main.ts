import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { setupAlbums, updatePlayerState } from "./methods";



// write to the body
const addLine = (text: string) => {
  const p = document.createElement("p");
  p.textContent = text;
  document.body.appendChild(p);
}

// get elemnts
const trackBtn = document.getElementById("trackBtn") as HTMLButtonElement;
const trackIcon = document.getElementById("trackIcon") as HTMLImageElement;
const act1 = document.getElementById("btnAction1") as HTMLSpanElement;
const act2 = document.getElementById("btnAction2") as HTMLSpanElement;
const prevBtn = document.getElementById("prevBtn") as HTMLButtonElement;
const playPauseBtn = document.getElementById("playPauseBtn") as HTMLButtonElement;
const nextBtn = document.getElementById("nextBtn") as HTMLButtonElement;
const volumeBtn = document.getElementById("volumeBtn") as HTMLInputElement;
const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;
const dropWindowIcon = document.getElementById("dropWindowIcon") as HTMLDivElement
const dropWindowVolume = document.getElementById("dropWindowVolume") as HTMLDivElement;
const connected = document.getElementById("connected") as HTMLSpanElement;

// display albums
await setupAlbums(dropWindowIcon);

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

await updatePlayerState(connected);

setInterval(() => {updatePlayerState(connected, trackIcon);}, 5000);