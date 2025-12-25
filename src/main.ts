import { SpotifyApi } from "@spotify/web-api-ts-sdk";

// 1. Setup SDK with ALL required permissions
const sdk = SpotifyApi.withUserAuthorization(
  '84a2fed80ef444578096092a097a3aae',
  'http://127.0.0.1:1420/',
  [
    "user-top-read",
    "user-read-playback-state",   // Required to check if playing
    "user-modify-playback-state"  // Required to pause/play
  ]
);

async function setupPlayer() {
  // 2. Create and Draw the Button IMMEDIATELY
  const toggleBtn = document.createElement("button");
  toggleBtn.innerText = "Loading..."; // Placeholder text
  toggleBtn.style.padding = "10px 20px";
  toggleBtn.style.fontSize = "16px";
  document.body.append(toggleBtn);

  // 3. Logic: What happens when you click?
  toggleBtn.onclick = async () => {
    try {
      // Get fresh state right when clicked
      const state = await sdk.player.getPlaybackState();
      
      if (!state || !state.device) {
        alert("No active Spotify device found! Open Spotify on your phone/PC first.");
        return;
      }

      // Toggle logic
      if (state.is_playing) {
        toggleBtn.innerText = "Play";
        await sdk.player.pausePlayback(state.device.id);
        
      } else {
        toggleBtn.innerText = "Pause";
        await sdk.player.startResumePlayback(state.device.id);
        
      }
    } catch (e) {
      console.error("Playback error:", e);
    }
  };

  // 4. Initial Check: Update button text on load
  try {
    const state = await sdk.player.getPlaybackState();
    if (state && state.is_playing) {
      toggleBtn.innerText = "Pause";
    } else {
      toggleBtn.innerText = "Play";
    }
  } catch (e) {
    toggleBtn.innerText = "Play (Error)";
    console.error("Could not fetch state:", e);
  }
}

// Run it
setupPlayer();