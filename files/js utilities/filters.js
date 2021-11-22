var model_id = "-";
var min_year = "-";
var max_year = "-";
var engine_size = "-";
var min_mileage = "-";
var max_mileage = "-";

var make = "-";
var model = "-";
var fuel = "-";
var transmission = "-";
var body_type = "-";
var colour = "-";
var county = "-";
var dealer = "-";
var averagedData;
var counties = [];

let makes_payload = {
    request_type: "filter_values",
    requested: "makes"
};

httpPost(makes, makes_payload, updateMakes);

function updateMakes(makes) {

    for (i = 0; i < makes.length; i++) {
        let li = document.createElement("LI");
        let a = document.createElement("A");
        a.className = "dropdown-item";
        a.innerHTML = makes[i]['make'];
        a.value = makes[i]['make_id'];
        a.onclick = function() {
            make = this.innerHTML;
            document.getElementById("make_button").innerHTML = make;

            const min_year_list = document.querySelector('#min_year_list');
            removeAllChildNodes(min_year_list);
            const max_year_list = document.querySelector('#max_year_list');
            removeAllChildNodes(max_year_list);
            const model_list = document.querySelector('#model_list');
            removeAllChildNodes(model_list);

            select_error.innerHTML = "";
            updateModels(this.value);
        };
        li.appendChild(a);
        document.getElementById("make_list").appendChild(li);
    }
}

function updateModels(id) {

    let models_payload = {
        request_type: "filter_values",
        requested: "models",
        make_id: id
    };

    httpPost(models, models_payload, createModelList);

}

function createModelList(models) {

    for (y = 0; y < models.length; y++) {
        var li = document.createElement("LI");
        var a = document.createElement("A");
        a.className = "dropdown-item";
        a.innerHTML = models[y]['model'];
        a.value = models[y]['model_id'];
        a.onclick = function() {

            const start_counties = document.querySelector('#start_counties');
            removeAllChildNodes(start_counties);
            const min_year_list = document.querySelector('#min_year_list');
            removeAllChildNodes(min_year_list);
            const max_year_list = document.querySelector('#max_year_list');
            removeAllChildNodes(max_year_list);

            updateYears(this.value);
            updateCounties(this.value);
            select_error.innerHTML = "";

            model = this.innerHTML;
            model_id = this.value;
            document.getElementById("model_button").innerHTML = this.innerHTML;
        };

        li.appendChild(a);
        document.getElementById("model_list").appendChild(li);

    }
}

function createCountyList(county) {

    let start_counties = document.getElementById("start_counties");
    start_counties.id = "counties_added"
    let counties_added = document.createElement("ul");
    let title = document.createElement("div");
    title.innerHTML = "<h5>Select counties</h5>";
    start_counties.appendChild(title);

    for (y = 0; y < county.length; y++) {

        let a = document.createElement("li");
        a.innerHTML = county[y]['county'];
        a.style.borderRadius = "5px";
        a.style.padding = "5px";
        a.style.margin = "2.5px";
        a.value = county[y]['county_id'];
        a.className = "btn btn-light";
        a.onclick = function() {
            if (counties.indexOf(this.value) == -1) {
                counties.push(this.value);
                a.style.backgroundColor = "lightgrey";
            } else {
                delete counties.splice(counties.indexOf(this.value), 1);
                a.style.backgroundColor = "";
            }
            console.log(counties)
        }
        counties_added.appendChild(a);

    }

    start_counties.appendChild(counties_added);
}

function updateCounties(id) {

    let payload = {
        request_type: "filter_values",
        requested: "counties",
        model_id: id
    };

    httpPost(averagedData, payload, createCountyList);
}

function updateYears(id) {

    let payload = {
        request_type: "filter_values",
        requested: "year",
        model_id: id
    };

    httpPost(averagedData, payload, createYearList);

}

function updateMaxYear(min_year, year) {

    const max_year_list = document.querySelector('#max_year_list');
    removeAllChildNodes(max_year_list);

    for (y = 0; y < year.length; y++) {
        if (year[y]['year'] > min_year) {
            var li = document.createElement("LI");
            var a = document.createElement("A");
            a.className = "dropdown-item";
            a.innerHTML = year[y]['year'];
            a.value = year[y]['year'];
            a.onclick = function() {
                max_year = this.innerHTML;
                document.getElementById("max_year_button").innerHTML = max_year;
            };
            li.appendChild(a);
            document.getElementById("max_year_list").appendChild(li);
        }

    }
}

function updateMinYear(max_year, year) {

    const min_year_list = document.querySelector('#min_year_list');
    removeAllChildNodes(min_year_list);

    for (y = 0; y < year.length; y++) {
        if (year[y]['year'] < max_year) {
            var li = document.createElement("LI");
            var a = document.createElement("A");
            a.className = "dropdown-item";
            a.innerHTML = year[y]['year'];
            a.value = year[y]['year'];
            a.onclick = function() {
                min_year = this.innerHTML;
                document.getElementById("min_year_button").innerHTML = min_year;
            };
            li.appendChild(a);
            document.getElementById("min_year_list").appendChild(li);
        }
    }


}

function createYearList(year) {

    for (y = 0; y < year.length; y++) {
        var li = document.createElement("LI");
        var a = document.createElement("A");
        a.className = "dropdown-item";
        a.innerHTML = year[y]['year'];
        a.value = year[y]['year'];
        a.onclick = function() {
            min_year = this.innerHTML;
            updateMaxYear(min_year, year);
            document.getElementById("min_year_button").innerHTML = min_year;
        };
        li.appendChild(a);
        document.getElementById("min_year_list").appendChild(li);
    }

    for (y = 0; y < year.length; y++) {
        var li = document.createElement("LI");
        var a = document.createElement("A");
        a.className = "dropdown-item";
        a.innerHTML = year[y]['year'];
        a.value = year[y]['year'];
        a.onclick = function() {
            max_year = this.innerHTML;
            updateMinYear(max_year, year);
            document.getElementById("max_year_button").innerHTML = max_year;
        };
        li.appendChild(a);
        document.getElementById("max_year_list").appendChild(li);
    }

}