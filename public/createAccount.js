
function createAccount(){
	let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;
   
	account = {
		username: user,
		password: pass,
		type: "Patron"
	}
	console.log(account);

	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==201){
			alert("account added successfully.");
			window.location.href = "http://localhost:3000/";
		}
		if(this.readyState==4 && this.status==400){
			alert("Username already exists");
		}
	}
	req.open("post", "http://localhost:3000/account/create/");
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(account));
}
