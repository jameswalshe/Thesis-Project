var averagedData, models, makes;

function httpPost(array, payload, callback) {

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost/CarCompare/api/api.php", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(payload));
    xhr.onload = function() {
        console.log(xhr.response)
        array = JSON.parse(xhr.response);
        if (typeof callback == "function") {
            callback(array);
        }
    }
}

function httpGetImage(payload, callback) {
    let url = "https://www.carimagery.com/api.asmx/GetImageUrl?searchTerm=" + payload;
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    xhr.send();
    console.log(payload)
    xhr.onload = () => {
        if (xhr.status == 200) {
            let image = xhr.response;
            var parser = new DOMParser();
            var xmldoc = parser.parseFromString(image, 'text/xml');
            callback(xmldoc.documentElement.textContent);
        } else {
            console.error('Error!');
        }
    };

}