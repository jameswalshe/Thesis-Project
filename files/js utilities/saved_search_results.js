if (getCookie("saved_search") != "-") {

    let saved_search_payload = {
        request_type: "get_saved_search",
        saved_search_id: getCookie("saved_search")
    }

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "http://localhost/CarCompare/api/api.php", true);

    xhr.setRequestHeader("Content-type", "application/json");

    xhr.send(JSON.stringify(saved_search_payload));

    xhr.onload = function() {
        saved_response = JSON.parse(xhr.response);
        saved = saved_response[0]['search_string'].split("+")

        if (saved[1] = " ") {
            min_year = "-";
        } else {
            min_year = saved[1];
        }

        if (saved[2] = " ") {
            max_year = "-";
        } else {
            max_year = saved[2];
        }

        county_list = saved[6].split("=");
        county_list.splice(0, 1)

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
        coutnies = [];
        // BUILD PAYLOAD BASED ON FILTERS
        let query_payload = {
            request_type: "car_query",
            model_id: saved[0],
            min_year: min_year,
            max_year: max_year,
            min_mileage: saved[3],
            max_mileage: saved[4],
            engine_size: "-",
            fuel_id: "-",
            transmission_id: "-",
            body_type_id: "-",
            colour_id: "-",
            county_id: "-",
            dealer_id: "-",
            county: county_list
        };
        xhr.open("POST", "http://localhost/CarCompare/api/api.php", true);

        xhr.setRequestHeader("Content-type", "application/json");

        xhr.send(JSON.stringify(query_payload));

        xhr.onload = function() {


            // CHECK IF THE RESULTS ARE NOT EMPTY
            if (xhr.response[0] == "<") {
                document.getElementById("no_results").style.display = "block";;

                document.getElementById("loader").style.display = "none";

            } else {
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

                document.getElementById("chosen_car").innerHTML = "<h4>Selected Car: " + saved_response[0]['make'] + " " + saved_response[0]['model'] + "</h4>";

                // ADD YEAR TO IMAGE SEARCH IF IT IS SPECIFIED
                if (max_year != "-") {
                    httpGetImage(saved_response[0]['make'] + "+" + saved_response[0]['model'] + "+" + max_year, addSelectedImage)
                } else if (min_year != "-") {
                    httpGetImage(saved_response[0]['make'] + "+" + saved_response[0]['model'] + "+" + min_year, addSelectedImage)
                } else {
                    httpGetImage(saved_response[0]['make'] + "+" + saved_response[0]['model'], addSelectedImage)
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
                        saved.innerHTML = "Added to Saved Searches."
                        save_button.removeChild(save_button.lastChild);
                        save_button.appendChild(saved);
                        saveSearch(make, model, min_year, max_year, min_mileage, max_mileage, model_id);
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