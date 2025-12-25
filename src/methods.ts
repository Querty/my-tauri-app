import { SpotifyApi } from "@spotify/web-api-ts-sdk";
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

export const getUsersAlbums = async () => {
    const albums = await sdk.currentUser.albums.savedAlbums()
    return albums;
};

export const getActiveDeviceID = async () => {
    const state = await sdk.player.getPlaybackState();
    return state?.device?.id;
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
            img.src = item.album.images[2].url;
            img.alt = item.album.name;
            img.title = item.album.name;
            img.classList.add("album-artwork");
            button.appendChild(img);
            button.addEventListener("click", async () => {
                const id = await getActiveDeviceID();
                await sdk.player.startResumePlayback(id,item.album.uri);
                await updatePlayerState();
            });
            fragments.appendChild(button);
        });
        dropWindowIcon.appendChild(fragments);
    }
};
// update player state
let currentPlaybackState:any = null;

export async function syncPlayerState() {

    const state = await sdk.player.getPlaybackState();
    if (!state) return;

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
    playPauseBtn.textContent = state.is_playing ? "⏸️" : "▶️";
    shuffleBtn.textContent = state.shuffle_state ? "🔀" : "➡️";
}

export const playPause = async () =>{
    const playPauseBtn = document.getElementById("playPauseBtn") as HTMLButtonElement;
    const isPlaying = currentPlaybackState?.is_playing ?? false;
    playPauseBtn.textContent = isPlaying ? "▶️" : "⏸️";

    if (isPlaying) {
        await sdk.player.pausePlayback();
    } else {
        await sdk.player.startResumePlayback();
    }
    setTimeout(syncPlayerState, 500);
};

export const playNext = async () =>{
    const nextBtn = document.getElementById("nextBtn") as HTMLButtonElement;
    await sdk.player.skipToNext();
};
export const playPrevious = async () =>{
    const prevBtn = document.getElementById("prevBtn") as HTMLButtonElement;
    await sdk.player.skipToPrevious();
};

export const setVolume = async () =>{
    const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;
    await sdk.player.setPlaybackVolume(volumeSlider.valueAsNumber);
};

export const setShuffle = async () =>{
    const shuffleBtn = document.getElementById("shuffleBtn") as HTMLButtonElement;
    const playbackState = await sdk.player.getPlaybackState();
    let isShuffling = playbackState.shuffle_state;
    if (isShuffling) {
        shuffleBtn.textContent = "➡️";
        await sdk.player.togglePlaybackShuffle(false);
    } else {
        shuffleBtn.textContent = "🔀";
        await sdk.player.togglePlaybackShuffle(true);
    }
};