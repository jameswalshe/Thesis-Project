model_id = "-";
min_year = "-";
max_year = "-";
min_mileage = "-";
max_mileage = "-";

function reset() {
    document.getElementById("make_button").innerHTML = "Make";
    document.getElementById("model_button").innerHTML = "Model";
    document.getElementById("min_year_button").innerHTML = "Min Year";
    document.getElementById("max_year_button").innerHTML = "Max Year";

    const county_list = document.querySelector('#counties_added');
    removeAllChildNodes(county_list);
    county_list.id = "start_counties"
    const model_list = document.querySelector('#model_list');
    removeAllChildNodes(model_list);
    const min_year_list = document.querySelector('#min_year_list');
    removeAllChildNodes(min_year_list);
    const max_year_list = document.querySelector('#max_year_list');
    removeAllChildNodes(max_year_list);

    const min_mileage_input = document.getElementById("min_mileage");
    min_mileage_input.value = "";
    const max_mileage_input = document.getElementById("max_mileage");
    max_mileage_input.value = "";

    counties = [];
    make = "-";
    model = "-";
    min_year = "-";
    max_year = "-";
    engine_size = "-";
    fuel_id = "-";
    transmission_id = "-";
    body_type_id = "-";
    colour_id = "-";
    county_id = "-";
    dealer_id = "-";
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function saveSearch(make, model, min_year, max_year, min_mileage, max_mileage, model_id, counties) {


    let user_id = getCookie("user_id");

    let save_payload = {
        request_type: "save_search",
        user_id: user_id,
        make: make,
        model: model,
        min_year: min_year,
        max_year: max_year,
        min_mileage: min_mileage,
        max_mileage: max_mileage,
        model_id: model_id,
        counties: counties
    };
    let saved = [];
    console.log(save_payload);
    httpPost(saved, save_payload, console.log);

}

function addSuggestedImage1(image) {
    let suggested_div = document.getElementById("suggested_car_1");
    let img = document.createElement("img");
    img.src = image;
    img.id = "suggested_image";
    suggested_div.appendChild(img);
}

function addSuggestedImage2(image) {
    let suggested_div = document.getElementById("suggested_car_2");
    let img = document.createElement("img");
    img.src = image;
    img.id = "suggested_image";
    suggested_div.appendChild(img);
}

function addSuggestedImage3(image) {
    let suggested_div = document.getElementById("suggested_car_3");
    let img = document.createElement("img");
    img.src = image;
    img.id = "suggested_image";
    suggested_div.appendChild(img);
}

function search() {

    // IF MAKE OR MODEL IS NOT SELECTED, DISPLAY ERROR
    if (make == "-" || model == "-") {
        let select_error = document.getElementById("select_error");
        select_error.innerHTML = "<p>Make and model must be selected.</p>";
    } else {

        // REMOVE ALL RESULTS CONTAINERS
        document.getElementById("results").style.display = "none";
        results_array = document.getElementsByClassName("container-fluid outer results");
        for (let a = 0; a < results_array.length; a++) {
            results_array[a].style.display = "none";
        }

        // SHOW LOADING GIF
        document.getElementById("loader").style.display = "block";
        document.getElementById("no_results").style.display = "none";;

        // GET MILEAGE VALUES FROM INPUT
        const min_mileage_input = document.getElementById("min_mileage");
        var min_mileage = min_mileage_input.value;
        const max_mileage_input = document.getElementById("max_mileage");
        var max_mileage = max_mileage_input.value;

        // BUILD PAYLOAD BASED ON FILTERS
        let query_payload = {
            request_type: "car_query",
            model_id: model_id,
            min_year: min_year,
            max_year: max_year,
            min_mileage: min_mileage,
            max_mileage: max_mileage,
            engine_size: "-",
            fuel_id: "-",
            transmission_id: "-",
            body_type_id: "-",
            colour_id: "-",
            county_id: "-",
            dealer_id: "-",
            county: counties
        };

        // SEND REQUEST
        let xhr = new XMLHttpRequest();

        xhr.open("POST", "http://localhost/CarCompare/api/api.php", true);

        xhr.setRequestHeader("Content-type", "application/json");

        xhr.send(JSON.stringify(query_payload));

        xhr.onload = function() {

            console.log(xhr.response)

            // CHECK IF THE RESULTS ARE NOT EMPTY
            if (xhr.response[0] == "<") {
                document.getElementById("no_results").style.display = "block";;

                document.getElementById("loader").style.display = "none";

            } else {
                console.log(xhr.response)
                    // AFTER RESPONSE IS RECEIVED
                    // PARSE RESPONSE
                averagedData = JSON.parse(xhr.response);
                // REMOVE LOADING GIF
                document.getElementById("loader").style.display = "none";

                // RENDER FIRST CHART
                renderChart("Year", "year", 0);

                // DISPLAY ALL RESULTS CONTAINERS
                document.getElementById("results").style.display = "block";
                results_array = document.getElementsByClassName("container-fluid outer results");
                for (let a = 0; a < results_array.length; a++) {
                    results_array[a].style.display = "block";
                }

                // GET IMAGES AND TEXT FOR RESULTS SECTIONS
                document.getElementById("average_price").innerHTML = "<h6>€" + averagedData[7]['info']['price'] + "</h6>";
                document.getElementById("num_available").innerHTML = "<h6>" + averagedData[7]['info']['available'] + "</h6>";

                document.getElementById("suggested_car_3").innerHTML = "<h6>" + averagedData[10]['suggested']['expensive']['Make'] + " " + averagedData[10]['suggested']['expensive']['Model'] + " " + averagedData[10]['suggested']['expensive']['Year'] + " - €" + averagedData[10]['suggested']['expensive']['Price'] + "</h6>";
                httpGetImage(averagedData[10]['suggested']['expensive']['Make'] + "+" + averagedData[10]['suggested']['expensive']['Model'] + "+" + averagedData[10]['suggested']['expensive']['Year'], addSuggestedImage3);

                document.getElementById("suggested_car_2").innerHTML = "<h6>" + averagedData[10]['suggested']['middle']['Make'] + " " + averagedData[10]['suggested']['middle']['Model'] + " " + averagedData[10]['suggested']['middle']['Year'] + " - €" + averagedData[10]['suggested']['middle']['Price'] + "</h6>";
                httpGetImage(averagedData[10]['suggested']['middle']['Make'] + "+" + averagedData[10]['suggested']['middle']['Model'] + "+" + averagedData[10]['suggested']['middle']['Year'], addSuggestedImage2);

                document.getElementById("suggested_car_1").innerHTML = "<h6>" + averagedData[10]['suggested']['cheap']['Make'] + " " + averagedData[10]['suggested']['cheap']['Model'] + " " + averagedData[10]['suggested']['cheap']['Year'] + " - €" + averagedData[10]['suggested']['cheap']['Price'] + "</h6>";
                httpGetImage(averagedData[10]['suggested']['cheap']['Make'] + "+" + averagedData[10]['suggested']['cheap']['Model'] + "+" + averagedData[10]['suggested']['cheap']['Year'], addSuggestedImage1);

                document.getElementById("chosen_car").innerHTML = "<h4>Selected Car: " + make + " " + model + "</h4>";

                // ADD YEAR TO IMAGE SEARCH IF IT IS SPECIFIED
                if (max_year != "-") {
                    httpGetImage(make + "+" + model + "+" + max_year, addSelectedImage)
                } else if (min_year != "-") {
                    httpGetImage(make + "+" + model + "+" + min_year, addSelectedImage)
                } else {
                    httpGetImage(make + "+" + model, addSelectedImage)
                }

                // DISPLAY SAVE SEARCH BUTTON IF USER IS LOGGED IN
                if (getCookie("username")) {
                    let save_button = document.getElementById("save_button");
                    save_button.removeChild(save_button.lastChild);
                    let save = document.createElement("button");
                    removeAllChildNodes(save);
                    save.className = "btn btn-light filter_button";
                    save.innerHTML = "Save Search";
                    save.onclick = function() {
                        let saved = document.createElement("div");
                        saved.innerHTML = "Added to Saved Searches"
                        save_button.removeChild(save_button.lastChild);
                        save_button.appendChild(saved);
                        saveSearch(make, model, min_year, max_year, min_mileage, max_mileage, model_id, counties);
                        setTimeout(() => {
                            save_button.removeChild(save_button.lastChild);
                        }, 3000);
                    };
                    document.getElementById("save_button").appendChild(save);
                }
            }


        }

    }

}

function addSelectedImage(image) {

    // GET SELECTED VEHCILE DIV, REMOVE ALL CURRENT NODES, CREATE IMAGE AND ADD TO DIV
    let selected_div = document.getElementById("select_image");
    removeAllChildNodes(selected_div);
    let img = document.createElement("img");
    img.src = image;
    img.id = "selected_image";
    selected_div.appendChild(img);
}