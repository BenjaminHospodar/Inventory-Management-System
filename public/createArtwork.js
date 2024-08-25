
function createArtwork(){
	let title = document.getElementById("title").value
	let artist = document.getElementById("artist").value;
	let year = document.getElementById("year").value;
	let category = document.getElementById("category").value;
	let medium = document.getElementById("medium").value;
	let description = document.getElementById("description").value;
	let poster = document.getElementById("poster").value;

	artObj = {
		"title": title,
		"artist": artist, 
		"year": year,
		"category": category,
		"medium": medium,
		"description": description,
		"poster": poster
	}

	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==201){
			alert("Artwork added successfully.");
			window.location.href = "http://localhost:3000/profile";
		}
		if(this.readyState==4 && this.status==400){
			alert("Account already exists");
		}
	}
	req.open("post", "http://localhost:3000/artworks/");
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(artObj));
}
