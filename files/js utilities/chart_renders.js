    function renderChart(Title, branch_name, branch_index) {

        clearChartSection();

        google.charts.load('current', {
            'packages': ['corechart']
        });

        google.charts.setOnLoadCallback(drawPriceChart);

        function drawPriceChart() {

            var data = new google.visualization.DataTable(averagedData[branch_index][branch_name]['price']);

            var options = {
                chartArea: {
                    left: 50,
                    width: '100%'
                },
                'title': 'Average Price by ' + Title,
                'width': '100%',
                'height': '100%'
            };

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.ColumnChart(document.getElementById('chart_div_left'));
            chart.draw(data, options);

        }



        google.charts.load('current', {
            'packages': ['corechart']
        });

        google.charts.setOnLoadCallback(drawAvailableChart);

        function drawAvailableChart() {

            var data = new google.visualization.DataTable(averagedData[branch_index][branch_name]['available']);

            var options = {
                chartArea: {
                    left: 50,
                    width: '100%'
                },
                'title': 'Cars Available by ' + Title,
            };

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.ColumnChart(document.getElementById('chart_div_right'));
            chart.draw(data, options);

        }

    }

    function renderLocation() {
        removeAllChildNodes(document.getElementById("chart_section"));
        let map_section = document.createElement("DIV");
        map_section.id = "map_section";
        let div_left = document.createElement("DIV");
        div_left.id = "chart_div_map";
        let div_right = document.createElement("DIV");
        div_right.id = "chart_div_map_colours";
        div_right.className = "row";
        let info = document.createElement("DIV");
        info.id = "map_info";
        let tooltip = document.createElement("div");
        tooltip.className = "col-sm";
        tooltip.innerHTML = "<i data-tooltip='Each county has been colour coded to show how the price in that county compares to others. Red are most expensive while green are the cheapest. Click on a county to see more details.' class='far fa-question-circle fa-2x' style='color: white' ></i>";
        let min = document.createElement("div");
        min.innerHTML = "€" + averagedData[7]['info']['min_price'];
        min.className = "col-sm";
        min.id = "price_range_left";
        let max = document.createElement("div");
        max.innerHTML = "€" + averagedData[7]['info']['max_price'];
        max.className = "col-sm";
        max.id = "price_range_right";

        div_right.appendChild(min)
        div_right.appendChild(tooltip)
        div_right.appendChild(max)

        div_right.style.color = "white"
        div_right.style.backgroundSize = "100% 100%";
        div_right.style.backgroundImage = "url(files/images/colour_grades.png)";
        document.getElementById("chart_section").appendChild(map_section);
        document.getElementById("map_section").appendChild(div_right);
        document.getElementById("map_section").appendChild(div_left);
        document.getElementById("map_section").appendChild(info);
        let script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDXQDiBgNuBp2MkhGpNYITNuMTQHX8kqj8&callback=initMap&libraries=&v=weekly"
        document.head.appendChild(script);

    }

    function initMap() {

        const map = new google.maps.Map(document.getElementById("chart_div_map"), {
            zoom: 6,
            center: {
                lat: 53.411080,
                lng: -7.710753
            },
            mapTypeId: "roadmap",
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true
        });

        map.data.loadGeoJson('files/countiesGEOJSON.geojson', null, processFeatures);

        let i = 0;

        function processFeatures(feature) {

            map.data.forEach(function(feature) {

                let max_price = averagedData[6]['county']['max_price'];

                map.data.overrideStyle(feature, {
                    fillColor: "white",
                    strokeOpacity: 1,
                    strokeWeight: 1,
                    strokeColour: '#fff'
                });

                for (let i = 0; i < averagedData[6]['county']['price']['rows'].length; i++) {

                    if (feature['i']['COUNTY'] == String(averagedData[6]['county']['price']['rows'][i]['c'][0]['v'])) {

                        let num = Math.round((averagedData[6]['county']['price']['rows'][i]['c'][1]['v'] / max_price) * 100);
                        let colour;
                        switch (num) {
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                            case 5:
                            case 6:
                            case 7:
                            case 8:
                            case 9:
                            case 10:
                                colour = "#fcab44";
                                break;
                            case 11:
                            case 12:
                            case 13:
                            case 14:
                            case 15:
                            case 16:
                            case 17:
                            case 18:
                            case 19:
                            case 20:
                                colour = "#80e143";
                                break;
                            case 21:
                            case 22:
                            case 23:
                            case 24:
                            case 25:
                            case 26:
                            case 27:
                            case 28:
                            case 29:
                            case 30:
                                colour = "#8fe243";
                                break;
                            case 31:
                            case 32:
                            case 33:
                            case 34:
                            case 35:
                            case 36:
                            case 37:
                            case 38:
                            case 39:
                            case 40:
                                colour = "#c5e444";
                                break;
                            case 41:
                            case 42:
                            case 43:
                            case 44:
                            case 45:
                            case 46:
                            case 47:
                            case 48:
                            case 49:
                            case 50:
                                colour = "#e5e645";
                                break;
                            case 51:
                            case 52:
                            case 53:
                            case 54:
                            case 55:
                            case 56:
                            case 57:
                            case 58:
                            case 59:
                            case 60:
                                colour = "#fbc841";
                                break;
                            case 61:
                            case 62:
                            case 63:
                            case 64:
                            case 65:
                            case 66:
                            case 67:
                            case 68:
                            case 69:
                            case 70:
                                colour = "#f07434";
                                break;
                            case 71:
                            case 72:
                            case 73:
                            case 74:
                            case 75:
                            case 76:
                            case 77:
                            case 78:
                            case 79:
                            case 80:
                                colour = "#ec5630";
                                break;
                            case 81:
                            case 82:
                            case 83:
                            case 84:
                            case 85:
                            case 86:
                            case 87:
                            case 88:
                            case 89:
                            case 90:
                                colour = "#ea452e";
                                break;
                            case 91:
                            case 92:
                            case 93:
                            case 94:
                            case 95:
                            case 96:
                            case 97:
                            case 98:
                            case 99:
                            case 100:
                                colour = "#e62b2a";
                                break;
                            default:
                        }

                        map.data.overrideStyle(feature, {
                            fillColor: colour,
                            strokeOpacity: 0.5,
                            strokeWeight: 1,
                            strokeColour: '#fff'
                        });

                    }
                }

            });

        }

        map.data.addListener('click', function(event) {
            let price, county, available;

            for (let i = 0; i < averagedData[6]['county']['price']['rows'].length; i++) {

                if (event.feature.getProperty("COUNTY") == String(averagedData[6]['county']['price']['rows'][i]['c'][0]['v'])) {
                    price = averagedData[6]['county']['price']['rows'][i]['c'][1]['v'];
                    county = averagedData[6]['county']['price']['rows'][i]['c'][0]['v'];
                    available = averagedData[6]['county']['available']['rows'][i]['c'][1]['v'];

                    let content = "<div class='row'><p>" + county + "</p></div><div class='row'><div class='col-sm'><p>Price: </p></div><div class='col-sm'><p>€" + price + "</p></div></div><div class='row'><div class='col-sm'><p>Available: </p></div><div class='col-sm'>" + available + "</div></div>";

                    let infowindow = new google.maps.InfoWindow({});

                    infowindow.setContent(content);
                    infowindow.setPosition(event.latLng);
                    infowindow.open(map);
                }
            }
        });
    };

    function clearChartSection() {
        removeAllChildNodes(document.getElementById("chart_section"));
        let div_left = document.createElement("DIV");
        div_left.id = "chart_div_left";
        document.getElementById("chart_section").appendChild(div_left);
        let div_right = document.createElement("DIV");
        div_right.id = "chart_div_right";
        document.getElementById("chart_section").appendChild(div_right);
    }