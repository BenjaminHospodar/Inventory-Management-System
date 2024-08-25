
function sendReview(id,artwork){
	let review = document.getElementById("review").value;
	console.log(review);

	let obj = {
		type: "review",
		review: review,
		artwork: artwork
	}

	console.log(obj);

	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==201){
			window.location.href = "http://localhost:3000/artworks/"+ id;
		}
	}
	req.open("put", "http://localhost:3000/artworks/"+id);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));
}

function sendLike(id,artwork){
	let obj = {
		type: "like",
		artwork: artwork
	}
	console.log(obj);
	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==201){
			window.location.href = "http://localhost:3000/artworks/"+ id;
		}
	}
	req.open("put", "http://localhost:3000/artworks/"+id);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));
}

function delReview(id,reviewID){
	let obj = {
		type: "removeReview",
		reviewID: reviewID
	}
	console.log(obj);
	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==201){
			window.location.href = "http://localhost:3000/artworks/"+ id;
		}
	}
	req.open("delete", "http://localhost:3000/artworks/"+id);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));
}

function removeLike(id){
	let obj = {
		type: "removeLike"
	}

	console.log(obj);
	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==201){
			window.location.href = "http://localhost:3000/artworks/"+ id;
		}
	}
	req.open("delete", "http://localhost:3000/artworks/"+id);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));
}