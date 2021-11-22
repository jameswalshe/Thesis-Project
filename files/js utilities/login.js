if (getCookie("username") != "") {
    document.getElementById("login_box").style.display = "none";
    document.getElementById("logout_box").style.display = "block";
    document.getElementById("logout").onclick = function() {
        document.cookie = "saved_search = ";
        document.cookie = "username = ";
        window.location.href = "index.html"
    }
    document.getElementById("saved_searches").onclick = function() {
        window.location.href = "my_garage.html"
    }

} else {
    document.getElementById("login_box").style.display = "block";
    document.getElementById("login").onclick = function() {
        window.location.href = "login.html"
    }
    document.getElementById("logout_box").style.display = "none";
    document.getElementById("register").onclick = function() {
        window.location.href = "register.html"
    }
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function login() {

    let password_input = document.getElementById("password");
    let password = password_input.value;

    let email_input = document.getElementById("email");
    let email = email_input.value;

    const xhr = new XMLHttpRequest();

    xhr.open("POST", "http://localhost/CarCompare/api/api.php");
    let payload = {
        "request_type": "login",
        "email": email,
        "password": password
    }
    xhr.send(JSON.stringify(payload));
    xhr.onload = () => {
        if (xhr.status == 200) {
            let response = JSON.parse(xhr.response);
            if (response['exists'] === 'true') {
                setCookies(response);
                window.location.href = "index.html";
            } else {
                alert("No account exists with those details!");
            }
        }
    };
}

function setCookies(response) {
    document.cookie = "user_id = " + response['user_id'];
    document.cookie = "username = " + response['username'];
}