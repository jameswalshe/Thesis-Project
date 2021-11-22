<?php
header('Content-Type: application/json');

include("conn.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $final = array();

    // RETURNS DATA TO POPULATE FILTERS FOR SEARCHING
    // MODULARISED TO RETURN ONLY A SUBSET OF THE FULL DATA WHEN REQUESTED
    if ($data['request_type'] === "filter_values") {

        // RETURNS ALL MAKES 
        if ($data['requested'] === "makes") {

            $makes = [];

            $make_result = $conn->query("SELECT * FROM `make` ORDER BY `make` ASC");

            while ($ma = $make_result->fetch_assoc()) {
                array_push($makes, array(
                    'make_id' => $ma['make_id'],
                    'make' => $ma['make']
                ));
            }

            echo json_encode($makes);
        }

        // RETURN ALL MODELS IN A CERTAIN MAKE
        if ($data['requested'] === "models") {

            $models = array();

            $model_result = $conn->query("SELECT * FROM `model` WHERE `make_id` = " . $data['make_id'] . " ORDER BY `model`");

            while ($m = $model_result->fetch_assoc()) {
                array_push($models, array(
                    'model_id' => $m['model_id'],
                    'model' => $m['model']
                ));
            }

            echo json_encode($models);
        }

        // RETURN ALL YEARS IN A CERTAIN MODEL
        if ($data['requested'] === "year") {

            $year = array();

            $year_result = $conn->query("SELECT DISTINCT(year) FROM `car` WHERE `model_id` = " . $data['model_id'] . " ORDER BY `car`.`year` DESC");

            while ($y = $year_result->fetch_assoc()) {
                array_push($year, array(
                    'year' => $y['year']
                ));
            }

            echo json_encode($year);
        }

        // RETURN ALL YEARS IN A CERTAIN MODEL
        if ($data['requested'] === "counties") {

            $county = array();

            $county_result = $conn->query("SELECT DISTINCT(county) AS 'county', car.county_id
            FROM `car` 
            INNER JOIN county
            ON car.county_id = county.county_id
            WHERE `model_id` =" . $data['model_id'] . " ORDER BY `county` ASC");

            while ($c = $county_result->fetch_assoc()) {
                array_push($county, array(
                    'county' => $c['county'],
                    'county_id' => $c['county_id']
                ));
            }

            echo json_encode($county);
        }
    }

    // RETURNS DATA TO POPULATE CHARTS AND MAP
    // CURRENTLY RETURNS ALL DATA IN ONE REQUEST
    // MODULARISATION COULD SPEED UP DELIVERY
    if ($data['request_type'] === "car_query") {
        // WHERE QUERY FOR SQL STATEMENTS IS DYNAMICALLY CREATED BASED ON BODY OF POST REQUEST
        // CAPABLE OF QUERYING WITH MORE FILTERS THAN ARE USED BY CURRENT SITE EG. ENGINE SIZE, COLOUR, 
        $where = "WHERE ";

        $suggested_where = "";

        if ($data['model_id'] != "-") {
            $where = $where . "model_id = " . $data['model_id'];
        }

        if ($data['min_year'] != "-") {
            $where = $where . " AND year >= " . $data['min_year'];
            $suggested_where = " AND `year` > " . $data['min_year'];
        }

        if ($data['max_year'] != "-") {
            $where = $where . " AND year <= " . $data['max_year'];
            $suggested_where = $suggested_where . " AND `year` < " . $data['max_year'];
        }

        if ($data['min_mileage'] != null) {
            $where = $where . " AND mileage >= " . $data['min_mileage'];
        }

        if ($data['max_mileage'] != null) {
            $where = $where . " AND mileage <= " . $data['max_mileage'];
        }

        if ($data['fuel_id'] != "-") {
            $where = $where . " AND car.fuel_id = " . $data['fuel_id'];
        }

        if ($data['transmission_id'] != "-") {
            $where = $where . " AND car.transmission_id = " . $data['transmission_id'];
        }

        if ($data['body_type_id'] != "-") {
            $where = $where . " AND car.body_type_id = " . $data['body_type_id'];
        }

        if ($data['engine_size'] != "-") {
            $where = $where . " AND car.engine_size = " . $data['engine_size'];
        }

        if ($data['colour_id'] != "-") {
            $where = $where . " AND car.colour_id = " . $data['colour_id'];
        }

        if (sizeof($data['county']) > 0) {
            for ($i = 0; $i < sizeof($data['county']); $i++) {
                if ($i == 0) {
                    $where = $where . " AND (car.county_id = " . $data['county'][$i];
                } else {
                    $where = $where . " OR car.county_id = " . $data['county'][$i];
                }
            }

            $where = $where . ")";
        }

        if ($data['dealer_id'] != "-") {
            $where = $where . " AND car.dealer_id = " . $data['dealer_id'];
        }

        // ONCE WHERE QUERY IS BUILT, SQL QUERIES FOR EACH VEHICLE SPEC ARE BUILT AND QUERIED
        // AN ARRAY FORMATTED TO BE COMPATIBLE WITH GOOGLE CHARTS IS CONSTRUCTED FROM THE QUERY RESULT 
        // EACH ARRAY IS THEN ADDED TO A FINAL ARRAY TO BE ECHO'D

        $year_select = "SELECT year AS 'Year', ROUND(AVG(price)) AS 'Price', 
                        COUNT(DISTINCT(car_id)) AS 'Available' FROM car ";
        $year_group = " GROUP BY year  ORDER BY `Year` DESC;";
        $year_result = $conn->query($year_select . $where . $year_group);
        $year_price_rows = [];
        $year_available_rows = [];

        while ($y = $year_result->fetch_assoc()) {

            if ($y['Year'] > 1500) {
                array_push($year_price_rows, array('c' => [
                    array('v' => $y['Year']), array('v' => $y['Price'])
                ]));

                array_push($year_available_rows, array('c' => [
                    array('v' => $y['Year']), array('v' => $y['Available'])
                ]));
            }
        }

        $year_price_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $year_available_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $final_year_price = array(
            'cols' => $year_price_cols,
            'rows' => $year_price_rows
        );

        $final_year_available = array(
            'cols' => $year_available_cols,
            'rows' => $year_available_rows
        );

        $year_data = array(
            'price' => $final_year_price,
            'available' => $final_year_available
        );

        array_push($final, array(
            'year' => $year_data
        ));

        $fuel_select = "SELECT fuel.fuel AS 'Fuel', ROUND(AVG(price)) AS 'Price', COUNT(DISTINCT(car_id)) AS 'Available' 
        FROM car 
        INNER JOIN fuel
        ON car.fuel_id = fuel.fuel_id ";
        $fuel_group = " GROUP BY car.fuel_id;";

        $fuel_result = $conn->query($fuel_select . $where . $fuel_group);

        $fuel_price_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $fuel_available_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $fuel_price_rows = [];
        $fuel_available_rows = [];

        while ($y = $fuel_result->fetch_assoc()) {

            array_push($fuel_price_rows, array('c' => [
                array('v' => $y['Fuel']), array('v' => $y['Price'])
            ]));

            array_push($fuel_available_rows, array('c' => [
                array('v' => $y['Fuel']), array('v' => $y['Available'])
            ]));
        }

        $final_fuel_price = array(
            'cols' => $fuel_price_cols,
            'rows' => $fuel_price_rows
        );

        $final_fuel_available = array(
            'cols' => $fuel_available_cols,
            'rows' => $fuel_available_rows
        );

        $fuel_data = array(
            'price' => $final_fuel_price,
            'available' => $final_fuel_available
        );

        array_push($final, array(
            'fuel' => $fuel_data
        ));

        $transmission_select = "SELECT transmission.transmission AS 'Transmission', ROUND(AVG(price)) AS 'Price', COUNT(DISTINCT(car_id)) AS 'Available' 
        FROM car 
        INNER JOIN transmission
        ON car.transmission_id = transmission.transmission_id ";
        $transmission_group = " GROUP BY car.transmission_id;";

        $transmission_result = $conn->query($transmission_select . $where . $transmission_group);

        $transmission_price_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $transmission_available_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $transmission_price_rows = [];
        $transmission_available_rows = [];

        while ($y = $transmission_result->fetch_assoc()) {

            array_push($transmission_price_rows, array('c' => [
                array('v' => $y['Transmission']), array('v' => $y['Price'])
            ]));

            array_push($transmission_available_rows, array('c' => [
                array('v' => $y['Transmission']), array('v' => $y['Available'])
            ]));
        }

        $final_transmission_price = array(
            'cols' => $transmission_price_cols,
            'rows' => $transmission_price_rows
        );

        $final_transmission_available = array(
            'cols' => $transmission_available_cols,
            'rows' => $transmission_available_rows
        );

        $transmission_data = array(
            'price' => $final_transmission_price,
            'available' => $final_transmission_available
        );

        array_push($final, array(
            'transmission' => $transmission_data
        ));


        $body_type_select = "SELECT body_type.body_type AS 'Body Type', ROUND(AVG(price)) AS 'Price', COUNT(DISTINCT(car_id)) AS 'Available' 
        FROM car 
        INNER JOIN body_type
        ON car.body_type_id = body_type.body_type_id ";
        $body_type_group = " GROUP BY car.body_type_id;";

        $body_type_result = $conn->query($body_type_select . $where . $body_type_group);

        $body_type_price_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $body_type_available_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $body_type_price_rows = [];
        $body_type_available_rows = [];

        while ($y = $body_type_result->fetch_assoc()) {

            if (!$y['Body Type'] == "") {
                array_push($body_type_price_rows, array('c' => [
                    array('v' => $y['Body Type']), array('v' => $y['Price'])
                ]));

                array_push($body_type_available_rows, array('c' => [
                    array('v' => $y['Body Type']), array('v' => $y['Available'])
                ]));
            }
        }

        $final_body_type_price = array(
            'cols' => $body_type_price_cols,
            'rows' => $body_type_price_rows
        );

        $final_body_type_available = array(
            'cols' => $body_type_available_cols,
            'rows' => $body_type_available_rows
        );

        $body_type_data = array(
            'price' => $final_body_type_price,
            'available' => $final_body_type_available
        );

        array_push($final, array(
            'body_type' => $body_type_data
        ));

        $engine_size_select = "SELECT engine_size AS 'Engine Size', ROUND(AVG(price)) AS 'Price', COUNT(DISTINCT(car_id)) AS 'Available' 
        FROM car ";
        $engine_size_group = " GROUP BY car.engine_size;";

        $engine_size_result = $conn->query($engine_size_select . $where . $engine_size_group);

        $engine_size_price_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $engine_size_available_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $engine_size_price_rows = [];
        $engine_size_available_rows = [];

        while ($y = $engine_size_result->fetch_assoc()) {

            if ($y['Engine Size'] > 0.5) {
                array_push($engine_size_price_rows, array('c' => [
                    array('v' => $y['Engine Size']), array('v' => $y['Price'])
                ]));

                array_push($engine_size_available_rows, array('c' => [
                    array('v' => $y['Engine Size']), array('v' => $y['Available'])
                ]));
            }
        }

        $final_engine_size_price = array(
            'cols' => $engine_size_price_cols,
            'rows' => $engine_size_price_rows
        );

        $final_engine_size_available = array(
            'cols' => $engine_size_available_cols,
            'rows' => $engine_size_available_rows
        );

        $engine_size_data = array(
            'price' => $final_engine_size_price,
            'available' => $final_engine_size_available
        );

        array_push($final, array(
            'engine_size' => $engine_size_data
        ));

        $colour_select = "SELECT colour.colour AS 'Colour', ROUND(AVG(price)) AS 'Price', COUNT(DISTINCT(car_id)) AS 'Available' 
        FROM car 
        INNER JOIN colour
        ON car.colour_id = colour.colour_id ";
        $colour_group = " GROUP BY car.colour_id;";

        $colour_result = $conn->query($colour_select . $where . $colour_group);

        $colour_price_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $colour_available_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $colour_price_rows = [];
        $colour_available_rows = [];

        while ($y = $colour_result->fetch_assoc()) {

            array_push($colour_price_rows, array('c' => [
                array('v' => $y['Colour']), array('v' => $y['Price'])
            ]));

            array_push($colour_available_rows, array('c' => [
                array('v' => $y['Colour']), array('v' => $y['Available'])
            ]));
        }

        $final_colour_price = array(
            'cols' => $colour_price_cols,
            'rows' => $colour_price_rows
        );

        $final_colour_available = array(
            'cols' => $colour_available_cols,
            'rows' => $colour_available_rows
        );

        $colour_data = array(
            'price' => $final_colour_price,
            'available' => $final_colour_available
        );

        array_push($final, array(
            'colour' => $colour_data
        ));


        $county_select = "SELECT county.county AS 'County', ROUND(AVG(price)) AS 'Price', COUNT(DISTINCT(car_id)) AS 'Available' 
        FROM car 
        INNER JOIN county
        ON car.county_id = county.county_id ";
        $county_group = " GROUP BY car.county_id ORDER BY `Price` ASC;";
        $county_result = $conn->query($county_select . $where . $county_group);

        $county_price_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $county_available_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $county_price_rows = [];
        $county_available_rows = [];
        $max_price;

        while ($y = $county_result->fetch_assoc()) {

            array_push($county_price_rows, array('c' => [
                array('v' => $y['County']), array('v' => $y['Price'])
            ]));

            array_push($county_available_rows, array('c' => [
                array('v' => $y['County']), array('v' => $y['Available'])
            ]));
            $max_price = $y['Price'];
        }

        $final_county_price = array(
            'cols' => $county_price_cols,
            'rows' => $county_price_rows,
        );

        $final_county_available = array(
            'cols' => $county_available_cols,
            'rows' => $county_available_rows
        );

        $county_data = array(
            'price' => $final_county_price,
            'available' => $final_county_available,
            'max_price' =>  $max_price
        );

        array_push($final, array(
            'county' => $county_data
        ));

        $dealer_select = "SELECT dealer.name AS 'Dealer', dealer.latitude AS 'Latitude', dealer.longitude AS 'longitude', ROUND(AVG(price)) AS 'Price', COUNT(DISTINCT(car_id)) AS 'Available' 
        FROM car 
        INNER JOIN dealer
        ON car.dealer_id = dealer.dealer_id ";
        $dealer_group = " GROUP BY car.dealer_id;";
        $dealer_result = $conn->query($dealer_select . $where . $dealer_group);

        $info_select = "SELECT MIN(price) AS 'Min Price', MAX(price) AS 'Max Price', COUNT(car_id) AS 'Available', 
                        ROUND(AVG(price)) AS 'Price' FROM `car` ";

        $info_result = $conn->query($info_select . $where);
        while ($ii = $info_result->fetch_assoc()) {
            $info_data = array(
                'price' => $ii['Price'],
                'available' => $ii['Available'],
                'min_price' => $ii['Min Price'],
                'max_price' => $ii['Max Price']
            );
        }

        array_push($final, array(
            'info' => $info_data
        ));

        // MILEAGE RANGE DATA MUST FIRST BE DIVIDED INTO RANGES AND THE AVERAGE PRICE OF EACH RANGE THEN CALCULATED

        $union = " UNION ";
        $range1 = "\nSELECT '0-50k' as Mileage, round(avg(price)) as 'Price', COUNT(car.car_id) AS 'Available' from car
        WHERE mileage > 0 and mileage <= 50000 ";
        $range2 = "\nSELECT '50k-100k' as Mileage, round(avg(price)) as 'Price', COUNT(car.car_id) AS 'Available' from car
        WHERE mileage > 50000 and mileage <= 100000 ";
        $range3 = "\nSELECT '100k-150k' as Mileage, round(avg(price)) as 'Price', COUNT(car.car_id) AS 'Available' from car
        WHERE mileage > 100000 and mileage <= 150000 ";
        $range4 = "\nSELECT '150k-200k' as Mileage, round(avg(price)) as 'Price', COUNT(car.car_id) AS 'Available' from car
        WHERE mileage > 150000 and mileage <= 200000 ";
        $range5 = "\nSELECT '200k-250k' as Mileage, round(avg(price)) as 'Price', COUNT(car.car_id) AS 'Available' from car
        WHERE mileage > 200000 and mileage <= 250000 ";
        $range6 = "\nSELECT '250k +' as Mileage, round(avg(price)) as 'Price', COUNT(car.car_id) AS 'Available' from car
        WHERE mileage > 250000 ";

        $mileage_select = $range1 . "AND" . str_replace("WHERE", "", $where) . $union . $range2 . "AND"  . str_replace("WHERE", "", $where) . $union . $range3 . "AND"  . str_replace("WHERE", "", $where) . $union . $range4 . "AND"   . str_replace("WHERE", "", $where) . $union . $range5 . "AND"  . str_replace("WHERE", "", $where) . $union . $range6 . "AND"  . str_replace("WHERE", "", $where);

        $mileage_result = $conn->query($mileage_select);

        $mileage_price_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $mileage_available_cols = [
            array('type' => 'string'),
            array('type' => 'number')
        ];

        $mileage_price_rows = [];
        $mileage_available_rows = [];

        while ($y = $mileage_result->fetch_assoc()) {

            array_push($mileage_price_rows, array('c' => [
                array('v' => $y['Mileage']), array('v' => $y['Price'])
            ]));

            array_push($mileage_available_rows, array('c' => [
                array('v' => $y['Mileage']), array('v' => $y['Available'])
            ]));
        }

        $final_mileage_price = array(
            'cols' => $mileage_price_cols,
            'rows' => $mileage_price_rows
        );

        $final_mileage_available = array(
            'cols' => $mileage_available_cols,
            'rows' => $mileage_available_rows
        );

        $mileage_data = array(
            'price' => $final_mileage_price,
            'available' => $final_mileage_available
        );

        array_push($final, array(
            'mileage' => $mileage_data
        ));
        $depreciation_data = [];
        array_push($final, array(
            'depreciation' => $depreciation_data
        ));

        // THE SUGGESTED SECTION CARS ARE CHOSEN BY CREATING 3 PRICE RANGES AROUND THE AVERAGE PRICE OF THE CAR SELECTED BY THE USER
        // USING THESE RANGES 3 QUERIES ARE RUN AND A MODEL IS CHOSEN AT RANDOM FROM EACH RANGE TO BE DISPLAYED
        // THIS DATA IS NOT FORMATTED THE SAME AS DATA ABOVE AS IT IS NOT USED IN A GOOGLE CHART

        $array = [];
        $suggested_group = " GROUP BY `model`";

        $suggested_result_range_1 = $conn->query("SELECT * FROM `vsuggested` WHERE `Price` > " . $info_data['price'] * 1.05
            . " AND `Price` < " . $info_data['price'] * 1.15 . $suggested_where . $suggested_group);

        $num = random_int(0, mysqli_num_rows($suggested_result_range_1));

        while ($s = $suggested_result_range_1->fetch_assoc()) {
            array_push($array, $s);
        }

        $suggested_range_1 = $array[$num];
        $array = [];
        $suggested_result_range_2 = $conn->query("SELECT * FROM `vsuggested` WHERE `Price` > " . $info_data['price'] * .95
            . " AND `Price` < " . $info_data['price'] * 1.05 . $suggested_where . $suggested_group);

        $num = random_int(0, mysqli_num_rows($suggested_result_range_2));

        while ($s = $suggested_result_range_2->fetch_assoc()) {

            array_push($array, $s);
        }

        $suggested_range_2 = $array[$num];
        $array = [];
        $suggested_result_range_3 = $conn->query("SELECT * FROM `vsuggested` WHERE `Price` > " . $info_data['price'] * .85
            . " AND `Price` < " . $info_data['price'] * .95 . $suggested_where . $suggested_group);

        $num = random_int(0, mysqli_num_rows($suggested_result_range_3));

        while ($s = $suggested_result_range_3->fetch_assoc()) {

            array_push($array, $s);
        }

        $suggested_range_3 = $array[$num];

        $suggested_array = array(
            'expensive' => $suggested_range_1,
            'middle' => $suggested_range_2,
            'cheap' => $suggested_range_3
        );

        array_push($final, array(
            'suggested' => $suggested_array
        ));

        echo json_encode($final);
    }

    // RETURNS SHORTENED VERSION OF DATA FROM CAR QUERY 
    // FOR MY GARAGE PAGE
    if ($data['request_type'] === "my_garage_query") {

        $where = "WHERE model_id = " . $data['model_id'];

        if ($data['min_year'] != "-") {
            $where = $where . " AND `year` > " . $data['min_year'];
        }

        if ($data['max_year'] != "-") {
            $where = $where . " AND `year` < " . $data['max_year'];
        }

        if ($data['min_mileage'] != "-") {
            $where = $where . " AND `mileage` > " . $data['min_mileage'];
        }

        if ($data['max_mileage'] != "-") {
            $where = $where . " AND `mileage` < " . $data['max_mileage'];
        }

        $query = "SELECT ROUND(AVG(price)) AS 'Price', MIN(price) AS 'Min Price', MAX(price) AS 'Max Price', COUNT(car_id) AS 'Available' FROM car " . $where . ";";

        $query_result = $conn->query($query);

        while ($results = $query_result->fetch_assoc()) {
            $final = array(
                "price" => $results['Price'],
                "available" => $results['Available'],
                "min_price" => $results['Min Price'],
                "max_price" => $results['Max Price']
            );
        }
        echo json_encode($final);
    }

    // REGISTERS USER IF EMAIL HAS NOT BEEN USED ALREADY
    if ($data['request_type'] === "register") {
        $password = $data['password'];
        $email = $data['email'];
        $username = $data['username'];
        $query = "SELECT * FROM `user` WHERE `email` = '" . $email . "';";

        $login_result = $conn->query($query);

        if (mysqli_num_rows($login_result) > 0) {
            echo json_encode(array(
                "exists" => true
            ));
        } else {
            $query = "INSERT INTO `user` (`user_id`, `first_name`, `email`, `password`) VALUES (NULL, '" . $username . "', '" . $email  . "', '" . $password . "');";
            $conn->query($query);

            $id_query = "SELECT user_id from `user` WHERE email = '" . $email . "';";
            $id_result = $conn->query($id_query);
            while ($id = $id_result->fetch_assoc()) {
                $user_id = $id['user_id'];
            }

            echo json_encode(array(
                "exists" => "created",
                "username" => $username,
                "user_id" => $user_id
            ));
        }
    }

    // RETURNS USER DATA IF THEY EXIST IN THE DATABASE
    if ($data['request_type'] === "login") {
        $password = $data['password'];
        $email = $data['email'];
        $exists = false;
        $query = "SELECT * FROM `user` WHERE `email` = '" . $email . "' AND `password` = '" . $password . "'";

        $login_result = $conn->query($query);

        if (mysqli_num_rows($login_result) > 0) {

            while ($l = $login_result->fetch_assoc()) {
                $return = array(
                    "exists" => "true",
                    "user_id" => $l['user_id'],
                    "username" => $l['first_name']
                );
            }
            echo json_encode($return);
        } else {
            echo json_encode(array(
                "exists" => "false"
            ));
        }
    }

    // INSERTS SEARCH INTO SAVED SEARCH TABLE BESIDE USER ID
    if ($data['request_type'] === "save_search") {

        $search_string = $data['model_id'] . "+";

        if ($data['min_year'] != "-") {
            $search_string = $search_string . $data['min_year'] . "+";
            $min_year = $data['min_year'];
        } else {
            $search_string = $search_string . "+";
            $min_year = "'-'";
        }

        if ($data['max_year'] != "-") {
            $search_string = $search_string . $data['max_year'] . "+";
            $max_year = $data['max_year'];
        } else {
            $search_string = $search_string . "+";
            $max_year = "'-'";
        }

        if ($data['min_mileage'] != "") {
            $search_string = $search_string . $data['max_mileage'] . "+";
            $min_mileage = $data['min_mileage'];
        } else {
            $search_string = $search_string . "+";
            $min_mileage = "'-'";
        }

        if ($data['max_mileage'] != "") {
            $search_string = $search_string . $data['min_mileage'] . "+";
            $max_mileage = $data['max_mileage'];
        } else {
            $search_string = $search_string . "+";
            $max_mileage = "'-'";
        }

        $county_list = "";

        if (sizeof($data['counties']) > 0) {

            $i = 0;

            while ($i < sizeof($data['counties'])) {
                $county_list = $county_list . "=" . $data['counties'][$i];
                $i++;
            }
            $search_string = $search_string . "+" . $county_list;
        }

        $query = "INSERT INTO `saved_search` (`saved_search_id`,  `user_id`, `make`, `model`, `model_id`, `min_year`, `max_year`, `min_mileage`, `max_mileage`, `search_string`) 
        VALUES (NULL," . $data['user_id'] . ",'" . $data['make'] . "','" . $data['model'] . "'," . $data['model_id'] . "," . $min_year . "," . $max_year . "," . $min_mileage . "," . $max_mileage . ",'" . $search_string . "');";
        echo $query;

        $conn->query($query);
    }

    //RETURNS ALL SAVED SEARCHES FOR A USER
    if ($data['request_type'] === "get_saved_searches") {

        $saved = array();
        $query = "SELECT * FROM `saved_search` WHERE user_id = " . $data['user_id'] . " ORDER BY `saved_search`.`saved_search_id` DESC";
        $saved_searches_result = $conn->query($query);
        $final = array();


        while ($s = $saved_searches_result->fetch_assoc()) {
            $first = true;
            $where = " ";

            if ($s['min_year'] != "-") {
                $where = $where . " `year` >= " . $s['min_year'];
                $first = false;
            }

            if ($s['max_year'] != "-") {
                if ($first) {
                    $where = $where . " `year` <= " . $s['max_year'];
                } else {
                    $where = $where . " AND `year` <= " . $s['max_year'];
                }
            }

            if ($s['min_mileage'] != "-") {
                if ($first) {
                    $where = $where . " mileage >= " . $s['min_mileage'];
                } else {
                    $where = $where . " AND mileage >= " . $s['min_mileage'];
                }
            }

            if ($s['max_mileage'] != "-") {
                if ($first) {
                    $where = $where . "  mileage <= " . $s['max_mileage'];
                } else {
                    $where = $where . " AND mileage <= " . $s['max_mileage'];
                }
            }

            $model_id = $s['model_id'];

            $search_string_split = explode("+", $s['search_string']);
            $county_list = explode('=', $search_string_split[5]);

            if (sizeof($county_list) > 1) {
                for ($i = 1; $i < sizeof($county_list); $i++) {
                    if ($i == 1) {
                        if ($first) {
                            $where = $where . " car.county_id = " . $county_list[$i];
                        } else {
                            $where = $where . " AND car.county_id = " . $county_list[$i];
                        }
                    } else {
                        $where = $where . " OR car.county_id = " . $county_list[$i];
                    }
                }
            }

            $info_select = "SELECT MIN(price) AS 'Min Price', MAX(price) AS 'Max Price', COUNT(car_id) AS 'Available', 
                            ROUND(AVG(price)) AS 'Price' FROM `car` ";

            if ($where = " ") {
                $where = " `model_id` = " . $model_id;
            } else {
                $where = " AND `model_id` = " . $model_id;
            }
            $info_result = $conn->query($info_select . " WHERE " . $where);

            while ($ii = $info_result->fetch_assoc()) {
                $info_data = array(
                    'price' => $ii['Price'],
                    'available' => $ii['Available'],
                    'min_price' => $ii['Min Price'],
                    'max_price' => $ii['Max Price'],
                    'make' => $s['make'],
                    'model' => $s['model'],
                    'min_year' => $s['min_year'],
                    'max_year' => $s['max_year'],
                    'min_mileage' => $s['min_mileage'],
                    'max_mileage' => $s['max_mileage'],
                    'search_id' => $s['saved_search_id']
                );
                array_push($final, $info_data);
            }
        }
        echo json_encode($final);
    }

    // RETURNS DATA FOR ONE IDENTIFIED SAVED SEARCH
    if ($data['request_type'] === "get_saved_search") {
        $saved = array();
        $query = "SELECT * FROM `saved_search` WHERE `saved_search_id` = " . $data['saved_search_id'] . " ORDER BY `saved_search`.`saved_search_id` DESC";
        $saved_searches_result = $conn->query($query);
        while ($s = $saved_searches_result->fetch_assoc()) {
            array_push($saved, array(
                "search_string" => $s['search_string'],
                "make" => $s['make'],
                "model" => $s['model']
            ));
        }
        echo json_encode($saved);
    }

    // DELETES A SAVED SEARCH
    if ($data['request_type'] == "delete_search") {
        $query = "DELETE FROM `saved_search` WHERE saved_search_id = " . $data['search_id'] . ";";
        $conn->query($query);
    }
}
