import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { ICONS } from "./main"; // Import icons

// 1. Setup SDK with ALL required permissions
const sdk = SpotifyApi.withUserAuthorization(
  '84a2fed80ef444578096092a097a3aae',
  'http://127.0.0.1:1420/',
  [
    "user-top-read",
    "user-read-playback-state",   // Required to check if playing
    "user-modify-playback-state",// Required to pause/play
    "user-library-read",  // livrary
  ]
);
let currentPlaybackState:any = null;
let lastInteractionTime = 0;

const registerInteraction = () => {
    lastInteractionTime = Date.now();
};

// update player state
export async function syncPlayerState() {
    if (Date.now() - lastInteractionTime < 2000) return;

    const connected = document.getElementById("connected") as HTMLSpanElement;
    const state = await sdk.player.getPlaybackState();
    if (!state) {
        connected.classList.remove("active"); //turn gray
        return;
    }
    connected.classList.add("active");//turn green
    currentPlaybackState = state;

    const trackIcon = document.getElementById("trackIcon") as HTMLImageElement;
    const trackName = document.getElementById("trackName") as HTMLSpanElement;
    const artistName = document.getElementById("artistName") as HTMLSpanElement;
    const playPauseBtn = document.getElementById("playPauseBtn") as HTMLButtonElement;
    const shuffleBtn = document.getElementById("shuffleBtn") as HTMLButtonElement;
    
    // Check if item exists AND if it has an 'album' property (is it a song?)
    if (state.item && "album" in state.item) {
             // Access the image safely
        trackIcon.src = state.item.album.images[2]?.url ?? "";
        trackName.textContent = state.item.name;
        const artists = state.item.artists?.map(a => a.name).join(", ") ?? "";
        artistName.textContent = artists;
    }

    // conditional chnahes of icons
    playPauseBtn.innerHTML = state.is_playing ? ICONS.pause : ICONS.play;
    if (state.shuffle_state) {
        shuffleBtn.classList.add("active");
    } else {
        shuffleBtn.classList.remove("active");
    } 
}

export const playPause = async () =>{
    registerInteraction();
    const playPauseBtn = document.getElementById("playPauseBtn") as HTMLButtonElement;
    const isPlaying = currentPlaybackState?.is_playing ?? false;

    if (currentPlaybackState) {
        currentPlaybackState.is_playing = !isPlaying;
    }

    playPauseBtn.innerHTML = isPlaying ? ICONS.play : ICONS.pause;

    if (isPlaying) {
        await sdk.player.pausePlayback();
    } else {
        await sdk.player.startResumePlayback();
    }
};

export const setShuffle = async () =>{
    registerInteraction();
    const shuffleBtn = document.getElementById("shuffleBtn") as HTMLButtonElement;
    let isShuffling = currentPlaybackState?.shuffle_state ?? false;

    if (currentPlaybackState) {
        currentPlaybackState.shuffle_state = !isShuffling;
    }

    if (isShuffling) {
        shuffleBtn.classList.remove("active");
    } else {
        shuffleBtn.classList.add("active");
    }
    await sdk.player.togglePlaybackShuffle(!isShuffling);
};

export const playNext = async () =>{
    registerInteraction();
    await sdk.player.skipToNext();
};
export const playPrevious = async () =>{
    registerInteraction();
    await sdk.player.skipToPrevious();
};

export const setVolume = async () =>{
    const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;
    await sdk.player.setPlaybackVolume(volumeSlider.valueAsNumber);
};

export const getUsersAlbums = async () => {
    const albums = await sdk.currentUser.albums.savedAlbums()
    return albums;
};

export const setupAlbums = async () => {
    const dropWindowIcon = document.getElementById("dropWindowIcon") as HTMLDivElement;

    const albums = await getUsersAlbums();
    if (albums.items.length > 0) {
        const fragments = document.createDocumentFragment();
        albums.items.forEach((item) => {
            const button = document.createElement("button");
            button.classList.add("album-button");
            
            const img = document.createElement("img");
            img.src = item.album.images[2]?.url ?? item.album.images[0]?.url ?? "";
            img.alt = item.album.name;
            img.title = item.album.name;
            img.style.width = "40px"; // Inline style for album picker imgs
            img.style.height = "40px";

            img.classList.add("album-artwork");
            button.appendChild(img);
            button.addEventListener("click", async () => {
                await sdk.player.startResumePlayback(undefined,item.album.uri);
                await syncPlayerState();
            });
            fragments.appendChild(button);
        });
        dropWindowIcon.appendChild(fragments);
    }
};