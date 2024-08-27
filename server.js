import express from 'express';
let app = express();
import { MongoClient, ObjectId } from "mongodb";
let db;

//session stuff
import session from 'express-session';
import { default as connectMongoDBSession} from 'connect-mongodb-session';
const MongoDBInventory = connectMongoDBSession(session);
const Inventory = new MongoDBInventory({
uri: 'mongodb://127.0.0.1:27017/Inventory',
collection: 'sessiondata'
});
app.use(session({
secret: 'some secret key here',
resave: true,
saveUninitialized: true,
store: Inventory 
}));

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "pug");

app.use(express.static("public"));
app.use(express.json()); 


// (TODO) Figure out the Paths i need.  

//remove notifications for now, want a dashboard view, maybe change notifcations to 
app.get("/", loginPage );

//adjust to remove 
app.post("/login", login);      // send POST request to /login route to login
app.get("/logout", logout);     // send GET request to /logout route to logout

//main search engine for items
app.get("/artworks",auth, queryParser, loadArtworks, respondArtworks);
app.put("/artworks",queryParser, loadArtworks, respondQuery);
app.post("/artworks", addArtwork); //to create artwork

//change to items 
app.get("/artworks/:id",auth, getArtLikes, loadArtwork); 
app.put("/artworks/:id", addArtFunc ); 
app.delete("/artworks/:id", delArtFunc ); 
app.get("/artworks/create",auth, CreateArtwork); 

//profile 
app.get("/profile",auth, collectProfileInfo, loadProfile);
app.put("/profile", changeType);

//add this to profile, only for ICS+ view
app.post("/account/create", createAccount); 

function auth(req, res, next) {
	if (!req.session.loggedin) {
		res.status(401).send("Unauthorized");
		return;
	}
	next();
}

function CreateArtwork(req, res, next) {
	if (req.session.artist) { //render home of logged in
		res.render("pages/createArtwork");
		return;
	}
	res.status(401).send("Unauthorized");
}

async function addArtwork(req, res, next) {
	console.log(req.body);

	//check to see if artwork existst
	const artCollection = db.collection("artworks");
	const artExists = await artCollection.findOne({ Title: req.body.title });
	
	if(artExists){
		res.status(400).send("Artwork already exists");
		return;
	}else{
		db.collection("artworks")
		.insertOne({ 
			"Title": req.body.title,
			"Artist": req.body.artist, 
			"Year": req.body.year,
			"Category": req.body.category,
			"Medium": req.body.medium,
			"Description": req.body.description,
			"Poster": req.body.poster
		})
		.catch(err => {
			res.status(500).send("Error reading database.");
			console.log(err);
			return;
		});
	}	

	const collection = db.collection("artists");
	const exists = await collection.findOne({ name: req.body.artist });
  
	if (exists) {
	  await collection.updateOne(
		{ name: req.body.artist },
		{ $push: { artworks: req.body.title } }
	  );
	} else {
	  await collection.insertOne({
		name: req.body.artist,
		artworks: [req.body.title]
	  });
	}
	
	//notications
	db.collection("notifications")
	.insertOne({ 
		"Artist": req.body.artist,
		"Notication": `${req.body.artist} added a Artwork ${req.body.title}`
	})
	.then(result => {	
		res.status(201).send("sucess");
		return;
	})
	.catch(err => {
		res.status(500).send("Error reading database.");
		console.log(err);
		return;
	});
}

async function collectArtistInfo(req, res, next){
	try {
		let id = req.params.id;
		let oid;
	
		try {
			oid = new ObjectId(id);
		} catch {
			res.status(404).send("That ID does not exist.");
			return;
		}

		res.oid = oid;
	
		// Collect reviews
		res.reviews = await db.collection("reviews").find({"ArtistID": oid}).toArray();
	
		// Collect follows
		await db.collection("follows").find({"ArtistID": oid}).toArray()
			.then(result => {
				if (!result) {
					res.followCount=0;
					return;
				}
				res.followCount=result.length;

				result.forEach(element => {
					res.followed = false;
					if(element.Follower == req.session.username){
						res.followed = true;	
					}})});	
		// Collect likes
		
		res.result = await db.collection("artists").findOne({"_id": oid});
		res.artworks = await db.collection("artworks").find({"Artist": res.result.name}).toArray()

		const workshopCollection = db.collection("workshops");
		res.workshops = await workshopCollection.find({"Artist": res.result.name }).toArray()
		
		res.Joined = await workshopCollection.find({"Artist": res.result.name, "Users": {$all: [req.session.username]}}).toArray()
		if(res.Joined.length > 0){
			res.Joined = true;	
		}else{
			res.Joined = false;
		}

		console.log(res.Joined);

		next();
	  } catch (err) {
		res.status(500).send("Error reading database.");
		console.log(err);
	  }
}

function delArtFunc(req, res, next) {
	console.log(req.body);
	let id = req.params.id;
	let oid;

	try {
		oid = new ObjectId(id);
	} catch {
		res.status(404).send("That ID does not exist.");
		return;
	}

	if(req.body.type == "removeReview"){
		db.collection("reviews")
		.deleteOne({ "_id": new ObjectId(req.body.reviewID)})
		.then(result => {
			console.log(result);
			if (!result) {
				res.status(404).send("That ID does not exist in the database.");
				return;
			}	
			res.status(201).send("success")
			return;
		})
		.catch(err => {
			res.status(500).send("Error reading database.");
			console.log(err);
			return;
		});

	}if(req.body.type == "removeLike"){
		db.collection("likes")
		.deleteOne({"ArtworkID": oid, "Liker": req.session.username})
		.then(result => {
			if (!result) {
				res.status(404).send("That ID does not exist in the database.");
				return;
			}	
			console.log("result");
			console.log(result);
			res.status(201).send("success")
			return;
		})
		.catch(err => {
			res.status(500).send("Error reading database.");
			console.log(err);
			return;
		});
	}
}

function addArtFunc(req, res, next) {
	let id = req.params.id;
	let oid;

	try {
		oid = new ObjectId(id);
	} catch {
		res.status(404).send("That ID does not exist.");
		return;
	}
	console.log("oid");
	console.log(oid);

	console.log(req.body);
	if(req.body.type == "review"){
		console.log("req.session.username");
		console.log(req.session.username);

		db.collection("reviews")
		.insertOne({ "Artwork": req.body.artwork,"ArtworkID": oid, "Review": req.body.review, "Reviewer": req.session.username, "Type": "Artwork"})
		.then(result => {
			if (!result) {
				res.status(404).send("That ID does not exist in the database.");
				return;
			}	
			res.status(201).send("success")
			return;
		})
		.catch(err => {
			res.status(500).send("Error reading database.");
			console.log(err);
			return;
		});

	}if(req.body.type == "like"){
		console.log("req.session.username");
		console.log(req.session.username);

		db.collection("likes")
		.insertOne({ "Artwork": req.body.artwork,"ArtworkID": oid, "Liker": req.session.username})
		.then(result => {
			if (!result) {
				res.status(404).send("That ID does not exist in the database.");
				return;
			}	
			console.log("result");
			console.log(result);
			res.status(201).send("success")
			return;
		})
		.catch(err => {
			res.status(500).send("Error reading database.");
			console.log(err);
			return;
		});
	}
}

function getArtLikes(req, res, next) {
	let id = req.params.id;
	let oid;

	try {
		oid = new ObjectId(id);
	} catch {
		res.status(404).send("That ID does not exist.");
		return;
	}

	//to find likes
	db.collection("likes")
		.find({"ArtworkID": oid }).toArray()
		.then(result => {
			if (!result) {
				res.likeCount=0;
				return;
			}
			result.forEach(element => {
				res.liked = false;
				if(element.Liker == req.session.username){
					res.liked = true;	
				}
			});	
			console.log("res.liked");	
			console.log(res.liked);	
			res.likeCount = result.length;
			next();
		})
		.catch(err => {
			res.status(500).send("Error reading database.");
			console.log(err);
			return;
	});
}

function loadArtwork(req, res, next) {
	let id = req.params.id;
	let oid;

	try {
		oid = new ObjectId(id);
	} catch {
		res.status(404).send("That ID does not exist.");
		return;
	}

	let foundReviews;
	db.collection("reviews")
	.find({"ArtworkID": oid }).toArray()
	.then(result => {
		if (!result) {
			foundReviews = [];
			return;
		}
		foundReviews = result;
	})
	.catch(err => {
		res.status(500).send("Error reading database.");
		console.log(err);
	});

	db.collection("artworks")
		.findOne({ "_id": oid })
		.then(result => {
			if (!result) {
				res.status(404).send("That ID does not exist in the database.");
				return;
			}
			//finding artist
			console.log("result");
			console.log(result);
			db.collection("artists")
				.findOne({name: result.Artist })
				.then(result2 => {
					console.log("result2");
					console.log(result2);
					if (!result2) {
						res.status(404).send("That artist does not exist in the database.");
						return;
					}	
					res.status(200).render("pages/artwork", { 
						artwork: result,
						artist: result2["_id"],
						Likes: res.likeCount, 
						reviews: foundReviews, 
						user: req.session.username,
						hasLiked: res.liked });
					})
				.catch(err => {
					res.status(500).send("Error reading database.");
					console.log(err);});})
		.catch(err => {
			res.status(500).send("Error reading database.");
			console.log(err);
		});
}

async function collectProfileInfo(req, res, next){
	try {
		let user = req.session.username;
	
		// Collect reviews
		res.reviews = await db.collection("reviews").find({"Reviewer": user}).toArray();
	
		// Collect follows
		res.follows = await db.collection("follows").find({"Follower": user}).toArray();
	
		// Collect likes
		res.liked = await db.collection("likes").find({"Liker": user}).toArray();
	
		next();
	  } catch (err) {
		res.status(500).send("Error reading database.");
		console.log(err);
	  }
}

async function loadProfile(req, res, next) {
	let user = req.session.username;
	//load page
	try{
		db.collection("accounts").findOne({username: user})
		.then(result => {
				if(result.type == "Patron"){
					res.render("pages/patronProfile", {user: result, likes:  res.liked, reviewed: res.reviews, following: res.follows});
					return;
				}
				res.render("pages/artistProfile", {user: result, likes: res.liked, reviewed: res.reviews, following: res.follows});
			})
	}
	catch{
		res.status(500).send("Error reading user.");
		console.log(err);
	}	
}

async function changeType(req, res, next) {
	let changeObj = req.body;
	let changeType;

	try{
		if(changeObj.type == "Patron"){
			const artCollection = db.collection("artworks");
			const artExists = await artCollection.findOne({ Title: req.body.addArtwork });
		
			if(artExists){
				res.status(400).send("Artwork already exists");
				return;
			}
			changeType = "Artist";
			req.session.artist = true;
		}else{
			changeType = "Patron";
			req.session.artist = false;
		}
		console.log(changeType);

		//if exists dont create new account
		//check to see if artwork existst
		const artistCollection = db.collection("artists");
		const artist = await artistCollection.findOne({ name: changeObj.username });


		db.collection("accounts")
			.updateOne({username: changeObj.username },{$set:{type: changeType}})
			.then(result => {
				if (!result) {
					res.status(404).send("That user does not exist in the database.");
					return;
				}
				if(changeObj.type == "Patron" && !artist){
					db.collection("artists")
						.insertOne({name: changeObj.username, artworks:[]})
				}
				res.status(201).send("success")
			})
	}
	catch{
		res.status(500).send("Error reading database.");
		console.log(err);
	}
}

function queryParser(req, res, next) {
	const MAX_REVIEWS = 50;
	console.log("query:");
	console.log(req.query);

	for(let key in req.body){
		req.query[key] = req.body[key] ;
	}

	//build a query string to use for pagination later
	let params = [];
	for (let prop in req.query) {
		if (prop == "page") {
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	req.qstring = params.join("&");
	console.log(params);

	try {
		req.query.limit = req.query.limit || 10;
		req.query.limit = Number(req.query.limit);
		if (req.query.limit > MAX_REVIEWS) {
			req.query.limit = MAX_REVIEWS;
		}
	} catch {
		req.query.limit = 10;
	}

	try {
		req.query.page = req.query.page || 1;
		req.query.page = Number(req.query.page);
		if (req.query.page < 1) {
			req.query.page = 1;
		}
	} catch {
		req.query.page = 1;
	}
	next();
}

async function loadArtworks(req, res, next) {
	let startIndex = ((req.query.page - 1) * req.query.limit);
	let amount = req.query.limit;

	let searchObj = JSON.parse(JSON.stringify(req.query)) //clones object
	delete searchObj.limit;
	delete searchObj.page;

	db.collection("artworks").find(searchObj)//searchObj
		.skip(startIndex)
		.limit(amount)
		.toArray()
		.then(result => {
				res.artworks = result;
				console.log("result");
				console.log(result);
				next();
				return;
			})
			.catch(err => {
				res.status(500).send("Error reading artworks.");
				console.log(err);
				return;
			});	
}

function respondArtworks(req, res, next) {
	res.format({
		"text/html": () => { res.render("pages/artworks", { artworks: res.artworks, qstring: req.qstring, current: req.query.page }) },
		"application/json": () => { res.status(200).json(res.artworks) }
	});
	next();
}

function respondQuery(req, res, next) {
	console.log(req.qstring);
	res.status(200).send(req.qstring);
	next();
}

function createAccount(req, res, next) {
	console.log(req.body);
	let NewAccount = req.body;

	db.collection("accounts").find({username: NewAccount.username}).count()
		.then(value => {
			if(!(value > 0)){
				db.collection("accounts")
				.insertOne(NewAccount) 
				.then(result => {
					res.status(201).send("success"); 
				})
				.catch(err => {
					res.status(500).send("Error saving to database.");
					console.log(err);
				});
				console.log("added");
				return;
			}
			res.status(400).send("Username already exists");
			return;
		})
		.catch(err => {
			res.status(500).send("Error saving to database.");
			console.log(err);}
	);
}

function loginPage(req, res, next) {
	if (req.session.loggedin) {
		db.collection("follows")
		.find({ "Follower": req.session.username}).toArray()
		.then(result => {	
			let arr = [];
			for (let follow of result){
				arr.push(follow.Artist);
			}
			
			db.collection("notifications")
				.find({ "Artist": {$in: arr}}).toArray()
				.then(result => {			
					if(result.length == 0){
						result.Notication = ["No notifications"];
					}
					res.render("pages/index", {user: req.session.username, notifications: result});
					return;
				})
				.catch(err => {
					res.status(500).send("Error reading database.");
					console.log(err);
					return;
				});		
		})
		.catch(err => {
			res.status(500).send("Error reading database.");
			console.log(err);
			return;
		});			
	}else{
		res.render("pages/login", );
	}
}

function logout(req, res, next) {
	if (req.session.loggedin) {
		req.session.loggedin = false;
		req.session.username = undefined;
		res.redirect("/");
	} else {
		res.status(200).send("You cannot log out because you aren't logged in.");
	}
}

function login(req, res, next) {
	if (req.session.loggedin) { //render home of logged in
		res.render("pages/index");
		return;
	}
	let username = req.body.username;
	let password = req.body.password;
	//does the user exist?
	db.collection("accounts").find({username: username, password: password}).count()
		.then(value => {
			if(!(value > 0)){
				res.status(401).send("Incorrect Acount Details"); 
				return;
			}
			req.session.loggedin = true; 
			req.session.username = username; 
			res.redirect("/");
		})	
		.catch(err => {
			res.status(500).send("Error finding in database.");
			console.log(err);
	});
}


MongoClient.connect("mongodb://127.0.0.1:27017")
	.then(client => {
		db = client.db("Inventory");
		app.listen(3000);
		console.log("Server listening on port 3000");
	})
	.catch(err => {
		console.log("Error in connecting to database");
		console.log(err);
	});