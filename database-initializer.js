import { MongoClient } from "mongodb";

import art from './artwork/gallery.json' assert { type: "json" };
//will lose marks, change
//eithout hardcoding, use mongoose?????

let artists = [];

art.forEach(artKey => {
  let artist = null;

  // Check if artist already exists
  for (let i = 0; i < artists.length; i++) {
    if (artists[i].name === artKey.Artist) {
      artist = artists[i];
      break;
    }
  }

  if (artist) {
    // Artist found, add artwork to existing artist
    artist.artworks.push(artKey.Title);
  } else {
    // Artist not found, create a new artist
    artist = {
      name: artKey.Artist,
      artworks: [artKey.Title]
    };

    artists.push(artist);
  }
});

console.log(artists);

const uri = "mongodb://127.0.0.1:27017/";
const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db("term");
    const result = await database.dropDatabase();
    
    if(result){
      console.log("collections has been dropped.")
    }
      const collectionArt = database.collection("artworks");
      const collectionArtist = database.collection("artists");
      await collectionArt.insertMany(art); 
      await collectionArtist.insertMany(artists); 
      console.log("items added");
    } finally {
      await client.close();
  }
}
run().catch(console.dir);
