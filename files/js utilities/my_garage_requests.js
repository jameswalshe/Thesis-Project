let searches = document.getElementById("saved_searches");
let user_id = getCookie("user_id");

let saved_payload = {
    request_type: "get_saved_searches",
    user_id: user_id
};

var saved = [];

function createSavedList(saved) {
    if (saved.length === 0) {
        let no_searches = document.createElement("div");
        no_searches.innerHTML = "<h5>You have no saved searches</h5>";
        no_searches.id = "saved_search_title";
        searches.appendChild(no_searches);

    } else {

        for (let i = 0; i < saved.length; i++) {

            let min_year, max_year, min_mileage, max_mileage, model_id;

            console.log(saved)

            model_id = saved[i]['model_id'];
            if (min_year == null) {
                min_year = "-"
            } else {
                min_year = saved[i]['min_year']
            };
            if (max_year == null) {
                max_year = "-"
            } else {
                max_year = saved[i]['max_year']
            };
            if (min_mileage == null) {
                min_mileage = "-"
            } else {
                min_mileage = saved[i]['min_mileage']
            };
            if (max_mileage == null) {
                max_mileage = "-"
            } else {
                max_mileage = saved[i]['max_mileage']
            };

            let car_data = [];

            let outside_row = document.createElement("div");
            outside_row.id = "outside_row";
            outside_row.className = "row";
            searches.appendChild(outside_row);

            let saved_tile = document.createElement("div");
            saved_tile.id = "saved_tile";
            outside_row.appendChild(saved_tile);

            let inside_row = document.createElement("div");
            inside_row.id = "inside_row";
            inside_row.className = "row";
            saved_tile.appendChild(inside_row);

            let left_div = document.createElement("div");
            left_div.className = "col";
            left_div.id = "left_div";
            saved_tile.appendChild(left_div);

            let saved_image = document.createElement("div");
            saved_image.id = "saved_image";
            saved_image.className = "row";
            left_div.appendChild(saved_image);

            function addImage(image) {
                let img = document.createElement("img");
                img.src = image;
                img.style.height = "100%";
                saved_image.appendChild(img);
            }
            httpGetImage(saved[i]['make'] + " " + saved[i]["model"], addImage);

            let right_div = document.createElement("div");
            right_div.className = "col";
            right_div.id = "right_div";
            saved_tile.appendChild(right_div);

            let saved_info = document.createElement("div");
            saved_info.id = "saved_info";
            saved_info.className = "col";
            right_div.appendChild(saved_info);

            let title = document.createElement("div");
            title.className = "row";
            title.id = "saved_car_info";
            title.innerHTML = "<h4>" + saved[i]['make'] + " " + saved[i]['model'] + "</h4>";
            saved_image.appendChild(title);


            let price_available = document.createElement("div");
            price_available.className = "row";
            saved_info.appendChild(price_available);

            let avg_price = document.createElement("div");
            avg_price.className = "col";
            avg_price.id = "saved_car_info";
            avg_price.innerHTML = "<p>Price Estimate: €" + saved[i]['price'] + "</p>";
            price_available.appendChild(avg_price);

            let available = document.createElement("div");
            available.className = "col";
            available.id = "saved_car_info";
            available.innerHTML = "<p>Available: " + saved[i]['available'] + "</p>";
            price_available.appendChild(available);

            let min_max = document.createElement("div");
            min_max.className = "row";
            saved_info.appendChild(min_max);

            let min = document.createElement("div");
            min.className = "col";
            min.id = "saved_car_info";
            min.innerHTML = "<p>Min Price: €" + saved[i]['min_price'] + "</p>";
            min_max.appendChild(min);

            let max = document.createElement("div");
            max.className = "col";
            max.id = "saved_car_info";
            max.innerHTML = "<p>Max Price: €" + saved[i]['max_price'] + "</p>";
            min_max.appendChild(max);


            let min_max_year = document.createElement("div");
            min_max_year.className = "row";
            saved_info.appendChild(min_max_year);

            let min_year_info = document.createElement("div");
            min_year_info.className = "col";
            min_year_info.id = "saved_car_info";
            min_year_info.innerHTML = "<p>Min Year: " + saved[i]['min_year'] + "</p>";
            min_max_year.appendChild(min_year_info);

            let max_year_info = document.createElement("div");
            max_year_info.className = "col";
            max_year_info.id = "saved_car_info";
            max_year_info.innerHTML = "<p>Max Year: " + saved[i]['max_year'] + "</p>";
            min_max_year.appendChild(max_year_info);

            let min_max_mileage = document.createElement("div");
            min_max_mileage.className = "row";
            saved_info.appendChild(min_max_mileage);

            let min_mileage_info = document.createElement("div");
            min_mileage_info.className = "col";
            min_mileage_info.id = "saved_car_info";
            min_mileage_info.innerHTML = "<p>Min Mileage: " + saved[i]['min_mileage'] + "</p>";
            min_max_mileage.appendChild(min_mileage_info);

            let max_mileage_info = document.createElement("div");
            max_mileage_info.className = "col";
            max_mileage_info.id = "saved_car_info";
            max_mileage_info.innerHTML = "<p>Max Mileage: " + saved[i]['max_mileage'] + "</p>";
            min_max_mileage.appendChild(max_mileage_info);

            let search_delete = document.createElement("div");
            search_delete.className = "row";
            saved_info.appendChild(search_delete);

            let delete_search = document.createElement("div");
            delete_search.className = "row";
            delete_search.id = "search_delete";
            let delete_search_button = document.createElement("button");
            delete_search_button.innerHTML = "Delete Search";
            delete_search_button.className = "btn btn-primary";
            delete_search_button.id = "filter_button";

            delete_search_button.onclick = function() {
                let delete_payload = {
                    request_type: "delete_search",
                    search_id: saved[i]['search_id']
                }
                let xhr = new XMLHttpRequest();

                xhr.open("POST", "http://localhost/CarCompare/api/api.php", true);

                xhr.setRequestHeader("Content-type", "application/json");

                xhr.send(JSON.stringify(delete_payload));

                xhr.onload = function() {
                    window.location.href = "my_garage.html";
                }
            }
            delete_search.appendChild(delete_search_button);
            search_delete.appendChild(delete_search);

            let search_again = document.createElement("div");
            search_again.className = "row";
            search_again.id = "search_delete";
            let search_again_button = document.createElement("button");
            search_again_button.innerHTML = "Search Again";
            search_again_button.className = "btn btn-primary";
            search_again_button.id = "filter_button";
            search_again_button.onclick = function() {
                document.cookie = "saved_search = " + saved[i]['search_id'];
                window.location = "index.html";
            }
            search_again.appendChild(search_again_button);
            search_delete.appendChild(search_again);



        }
    }


}

httpPost(saved, saved_payload, createSavedList)