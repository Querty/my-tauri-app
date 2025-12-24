import { SpotifyApi,  Scopes} from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withUserAuthorization(
  '84a2fed80ef444578096092a097a3aae',
  'http://127.0.0.1:1420/',
  ["user-top-read"]
);

async function displayTopArtist() {
  const user = await sdk.currentUser.profile();
  document.body.append('Welcome' + user.display_name.toString());
  const topArtist = await sdk.currentUser.topItems('artists', 'long_term', 1);
 

  if (topArtist.items.length > 0) {
    const artist = topArtist.items[0];
    document.body.append('Your top artist is: ' + artist.name.toString());
  } else {
    document.body.append('No top artists found.');
  }
}


displayTopArtist();