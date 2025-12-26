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

const getActiveDeviceId = async (): Promise<string> => {
    // 1. Try to use the cached state first to save an API call
    if (currentPlaybackState && currentPlaybackState.device && currentPlaybackState.device.id) {
        return currentPlaybackState.device.id;
    }

    // 2. If no cache, fetch fresh state
    const state = await sdk.player.getPlaybackState();
    if (state && state.device && state.device.id) {
        return state.device.id;
    }

    // 3. Fallback: This usually means no device is open. 
    // We return empty string to satisfy TypeScript, though the API call might still fail/ignore it.
    return ""; 
};
// Add this at the top of methods.ts
export const activateLocalPlayer = () => {
    // 1. Inject the Spotify Player Script dynamically
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    // 2. Define the global callback that Spotify calls when the script loads
    window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new Spotify.Player({
            name: 'My Tauri App', // <--- This is your "DNS" / Device Name!
            getOAuthToken: async (cb) => {
                // Bridge your existing SDK auth to the Player SDK
                const token = await sdk.getAccessToken();
                if (token) {
                    cb(token.access_token);
                }
            },
            volume: 0.5
        });

        // 3. Log errors
        player.addListener('initialization_error', ({ message }) => { console.error(message); });
        player.addListener('authentication_error', ({ message }) => { console.error(message); });
        player.addListener('account_error', ({ message }) => { console.error(message); });
        player.addListener('playback_error', ({ message }) => { console.error(message); });

        // 4. Handle "Ready" - This is when your device comes online
        player.addListener('ready', async ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            
            // OPTIONAL: Automatically transfer playback to this app immediately
            // await sdk.player.transferPlayback([device_id]); 
            
            // Force a UI refresh so the new device icon appears
            // registerInteraction(); // (From your previous fix)
            // await syncPlayerState(); 
        });

        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });

        player.connect();
    };
};
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
    const deviceId = await getActiveDeviceId();
    const playPauseBtn = document.getElementById("playPauseBtn") as HTMLButtonElement;
    const isPlaying = currentPlaybackState?.is_playing ?? false;

    if (currentPlaybackState) {
        currentPlaybackState.is_playing = !isPlaying;
    }

    playPauseBtn.innerHTML = isPlaying ? ICONS.play : ICONS.pause;

    if (isPlaying) {
        await sdk.player.pausePlayback(deviceId);
    } else {
        await sdk.player.startResumePlayback(deviceId);
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
    const deviceId = await getActiveDeviceId();
    await sdk.player.skipToNext(deviceId);
};
export const playPrevious = async () =>{
    registerInteraction();
    const deviceId = await getActiveDeviceId();
    await sdk.player.skipToPrevious(deviceId);
};

export const setVolume = async () =>{
    const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;
   
    await sdk.player.setPlaybackVolume(volumeSlider.valueAsNumber);
};

export const getUsersAlbums = async () => {
    const albums = await sdk.currentUser.albums.savedAlbums(9)
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
                const deviceId = await getActiveDeviceId();
                await sdk.player.startResumePlayback(deviceId,item.album.uri);
                dropWindowIcon.classList.add("hidden");
                await syncPlayerState();
            });
            fragments.appendChild(button);
        });
        dropWindowIcon.appendChild(fragments);
    }
};

