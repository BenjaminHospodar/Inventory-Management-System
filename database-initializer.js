import { MongoClient } from "mongodb";

import acounts from './Accounts/initAccounts.json' assert { type: "json" };
import items from './Inventory/items.json' assert { type: "json" };

console.log(acounts);
console.log("^ accounts ^");

console.log(items);
console.log("^ items ^");

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
