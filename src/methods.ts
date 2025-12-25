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
export const setupAlbums = async (dropWindowIcon: HTMLElement) => {
    const albums = await getUsersAlbums();
    if (albums.items.length > 0) {
        albums.items.forEach((item) => {
            const button = document.createElement("button");
            button.classList.add("album-button");
            dropWindowIcon.appendChild(button);
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
                await updateButtonIcons();
            });
        });
    }
};

export async function updatePlayerState() {
    const connected = document.getElementById("connected") as HTMLSpanElement;
    const trackIcon = document.getElementById("trackIcon") as HTMLImageElement;
    const trackName = document.getElementById("trackName") as HTMLSpanElement;
    const artistName = document.getElementById("artistName") as HTMLSpanElement;
    const response = await sdk.player.getAvailableDevices();
    let devices = response.devices;
    
    if (devices.length > 0) {
        connected.textContent = `🟢`;
        const curr_playing = await sdk.player.getCurrentlyPlayingTrack();
        
        // Check if item exists AND if it has an 'album' property (is it a song?)
        if (curr_playing && curr_playing.item && "album" in curr_playing.item) {
             // Access the image safely
            trackIcon.src = curr_playing.item.album.images[2].url;
            trackName.textContent = curr_playing.item.name;
            const artists = curr_playing.item.artists?.map(a => a.name).join(", ") ?? "";
            artistName.textContent = artists;
        }
    } else {
        connected.textContent = `🔴`;
    }
}

export const playPause = async () =>{
    const playPauseBtn = document.getElementById("playPauseBtn") as HTMLButtonElement;
    const playbackState = await sdk.player.getPlaybackState();
    if (playbackState.is_playing) {
        playPauseBtn.textContent = "▶️";
        await sdk.player.pausePlayback();
    } else {
        playPauseBtn.textContent = "⏸️";
        await sdk.player.startResumePlayback();
    }
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
export const updateButtonIcons = async () => {
    const playbackState = await sdk.player.getPlaybackState();
    const playPauseBtn = document.getElementById("playPauseBtn") as HTMLButtonElement;
    const shuffleBtn = document.getElementById("shuffleBtn") as HTMLButtonElement;
    const prevBtn = document.getElementById("prevBtn") as HTMLButtonElement;
    const nextBtn = document.getElementById("nextBtn") as HTMLButtonElement;
    const volumeBtn = document.getElementById("volumeBtn") as HTMLButtonElement;
    
    prevBtn.textContent = "⏮️";
    nextBtn.textContent = "⏭️";
    volumeBtn.textContent = "🔊";

    // conditional chnahes of icons
    if (playbackState.is_playing) {
        playPauseBtn.textContent = "⏸️";
    } else {
        playPauseBtn.textContent = "▶️";
    }
    if (playbackState.shuffle_state) {
        shuffleBtn.textContent = "🔀";
    } else {
        shuffleBtn.textContent = "➡️";
    }
};