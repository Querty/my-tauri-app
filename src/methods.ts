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


export const setupAlbums = async (dropWindowIcon: HTMLElement) => {
    const albums = await getUsersAlbums();
    if (albums.items.length > 0) {
        albums.items.forEach((item) => {
            const img = document.createElement("img");
            img.src = item.album.images[2].url;
            img.alt = item.album.name;
            img.title = item.album.name;
            img.classList.add("album-artwork");
            dropWindowIcon.appendChild(img);
        });
    }
};

export async function updatePlayerState(connected: HTMLElement, trackIcon: HTMLImageElement) {
    const response = await sdk.player.getAvailableDevices();
    let devices = response.devices;
    if(devices.length > 0){
        connected.textContent = `🟢`;
        const curr_playing = await sdk.player.getCurrentlyPlayingTrack();
        if(curr_playing && curr_playing.item){
            trackIcon.src = curr_playing.item.album.images[2].url;
        }

    }
    else {
        connected.textContent = `🔴`;
    }
}