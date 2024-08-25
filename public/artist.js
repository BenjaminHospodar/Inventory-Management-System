
function sendReview(id,artist){
	let review = document.getElementById("review").value;
	console.log(review);

	let obj = {
		type: "review",
		review: review,
		artist: artist
	}

	console.log(obj);

	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==201){
			window.location.href = "http://localhost:3000/artists/"+ id;
		}
	}
	req.open("put", "http://localhost:3000/artists/"+id);
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
			window.location.href = "http://localhost:3000/artists/"+ id;
		}
	}
	req.open("delete", "http://localhost:3000/artists/"+id);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));
}


//turn to follow

function unfollow(id){
	let obj = {
		type: "unfollow"
	}

	console.log(obj);
	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==201){
			window.location.href = "http://localhost:3000/artists/"+ id;
		}
	}
	req.open("delete", "http://localhost:3000/artists/"+id);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));
}

function follow(id,artist){
	let obj = {
		type: "follow",
		artist: artist
	}
	console.log(obj);
	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==201){
			window.location.href = "http://localhost:3000/artists/"+ id;
		}
	}
	req.open("put", "http://localhost:3000/artists/"+id);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));
}

function joinWorkshop(name){
	let obj ={
	  name: name
	}

	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==201){
			alert("Joined workshop!");
			window.location.href = "http://localhost:3000/workshops/";
		}
	}
	req.open("put", "http://localhost:3000/workshops/");
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));
}