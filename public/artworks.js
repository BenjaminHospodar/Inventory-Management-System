
function findArtworks(){
	let title = document.getElementById("title").value;
    let name = document.getElementById("name").value;
    let categ = document.getElementById("categ").value;

	let obj = { }

	if(title.length > 0){
		obj.Title = title;
	}
	if(name.length > 0){
		obj.Artist = name;
	}
	if(categ.length > 0){
		obj.Category = categ;
	}

	console.log(obj);

	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
			console.log(this.responseText);
			window.location.href = "http://localhost:3000/artworks/?"+ this.responseText;
		}
	}
	req.open("put", "http://localhost:3000/artworks/");
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));
}
