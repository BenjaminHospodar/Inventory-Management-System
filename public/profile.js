
function upgradeAccount(account){
	let title = document.getElementById("title").value
	let artist = document.getElementById("artist").value;
	let year = document.getElementById("year").value;
	let category = document.getElementById("category").value;
	let medium = document.getElementById("medium").value;
	let description = document.getElementById("description").value;
	let poster = document.getElementById("poster").value;

	sendObj = {
		username: account,
		type: "Patron",
		addArtwork: title
	}

	artObj = {
		"title": title,
		"artist": artist, 
		"year": year,
		"category": category,
		"medium": medium,
		"description": description,
		"poster": poster
	}

	console.log(sendObj);
	console.log(artObj);

	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==201){
			req2 = new XMLHttpRequest();
			req2.onreadystatechange = function() {
				if(this.readyState==4 && this.status==201){
					alert("account Changed successfully.");
					window.location.href = "http://localhost:3000/profile";
				}
			}
			req2.open("POST", "http://localhost:3000/artworks/");
			req2.setRequestHeader('Content-Type', 'application/json');
			req2.send(JSON.stringify(artObj)); 
		}
		if(this.readyState==4 && this.status==400){
			alert("Artwork already exists");
			window.location.href = "http://localhost:3000/profile";
		}
	}
	req.open("put", "http://localhost:3000/profile/");
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(sendObj)); 
}

function downgradeAccount(account){

	console.log(account);

	sendObj = {
		username: account,
		type: "Artist"
	}
	console.log(sendObj);

	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==201){
			alert("account Changed successfully.");
			window.location.href = "http://localhost:3000/profile";
		}
	}
	req.open("put", "http://localhost:3000/profile/");
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(sendObj)); 
}

function openForm() {
	document.getElementById("form").style.display = "block";
  }
  
function closeForm() {
	document.getElementById("form").style.display = "none";
}