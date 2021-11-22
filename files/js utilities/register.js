function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function register() {

    let username_input = document.getElementById("username");
    let username = username_input.value;

    let password_input = document.getElementById("password");
    let password = password_input.value;

    let email_input = document.getElementById("email");
    let email = email_input.value;

    if (username == "" || password == "" || email === "") {

        alert("All fields must be completed!")

    } else {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", "http://localhost/CarCompare/api/api.php");
        let payload = {
            "request_type": "register",
            "email": email,
            "password": password,
            "username": username
        }

        xhr.send(JSON.stringify(payload));
        xhr.onload = () => {
            if (xhr.status == 200) {
                let response = JSON.parse(xhr.response);
                if (response['exists'] === true) {

                    alert("Account already exists with that email!")

                } else {
                    let login_form = document.getElementById("message");
                    removeAllChildNodes(login_form);
                    let exists = document.createElement("div");
                    exists.innerHTML = "Account created successfully!";
                    login_form.appendChild(exists)
                    setTimeout(3000);
                    setCookies(response);
                    window.location.href = "index.html";
                }
            }
        };
    }
}

function setCookies(response) {
    document.cookie = "user_id = " + response['user_id'];
    document.cookie = "username = " + response['username'];
}