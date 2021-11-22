### IMPORTS ###
import requests
import mysql.connector
from datetime import date, datetime, timedelta
import time

### MAKE DATABASE CONNECTION ###
db = mysql.connector.connect(
    host = 'localhost',
    user = 'root',
    passwd = '',
    database = 'donedeal'
)


mycursor = db.cursor(prepared=True)

url = 'https://www.donedeal.ie/search/api/v4/find/'

i = 0
scraped = 0

### LOOP THROUGH REQUESTS
while (i < 15000):

    ### REQUEST PAYLOAD ###
    searches = {
            "section":"cars",
            "adType":"forsale",
            "sort":"publiseddate desc",
            "priceType":"Euro",
            "mileageType":"Kilometres",
            "max":30,
            "start":i,
            "viewType":"list"
            }

    ### MAKE REQUEST ####
    donedealData = requests.post(url, json=searches).json()
    
    ### LOOP THROUGH RETURNED CARS ###
    ad = 0
    while (ad < len(donedealData['ads'])):
        
        insert = True

        if donedealData['ads'][ad]['spotlight'] == True:
            insert = False

        ### CHECK IF PRICE EXISTS AND CONVERT TO EURO
        price = ""

        if 'price' in donedealData['ads'][ad]:
            price = donedealData['ads'][ad]['price'].replace(",","")
            if 'currency' in donedealData['ads'][ad]:
                if donedealData['ads'][ad]['currency'].__contains__("GBP"):
                    price = int(price) * 1.16
        else:
            insert = False
        
        ### GET CAR DATA ###
        age = ""
        location = ""

        if 'county' in donedealData['ads'][ad]:
            location = donedealData['ads'][ad]['county']

        donedeal_id = donedealData['ads'][ad]['id']

        today = date.today()
        if 'age' in donedealData['ads'][ad]:
            age = donedealData['ads'][ad]['age']

            if age.__contains__("mins") or age.__contains__("min")  or age.__contains__("hour") or age.__contains__("hours"):
                age = age.replace("mins","")
                age = age.replace("min","") 
                age = age.replace("hours","")
                age = age.replace("hour","")
                upload_date = today
            else: 
                age = age.replace("days","")
                age = age.replace("day","")
                age = timedelta(days = int(age))
                upload_date = today - age
        
        variables = {'make':'', 'model':'', 'year':'', 'mileage':'', 'fuelType':'', 'transmission':'', 
            'bodyType':'', 'seats':'', 'engine':'', 'tax':'', 'nct':'', 'owners':'', 'country':'', 
            'colour':'', 'doors':'', 'price':price, 'age': age}

        for var in variables:
            for e in donedealData['ads'][ad]['displayAttributes']:
                if var == e['name']:
                    variables[var] = e['value'].strip()


        variables['mileage'] = variables['mileage'].replace(",","")
        variables['mileage'] = variables['mileage'].replace("km", "")
        variables['mileage'] = variables['mileage'].replace("mi", "")
        variables['engine'] = variables['engine'].replace("litre","")

        ## INSERT CAR DATA INTO NORMALISED TABLES AND GET ID ###

        # query whether the make already exists in db
        make_ = ()
        make_ = make_ + (str(variables['make']),)
        query = "SELECT * FROM make WHERE `make` = %s"
        mycursor.execute(query, make_)
        make_result = mycursor.fetchall()

        # if it doesnt exist then insert new entry
        if len(make_result) < 1:
            insert_make_query = "INSERT INTO make (`make_id`, `make`) VALUES (NULL, %s)"
            mycursor.execute(insert_make_query, make_)
            db.commit()

        # get make id for later insert
        make_id_query = "SELECT `make_id` FROM make WHERE `make` = %s"           
        mycursor.execute(make_id_query, make_)
        make_id_fetch = mycursor.fetchall()
        make_id = make_id_fetch[0][0] 

        # query whether the model already exists in db
        model_ = ()
        model_ = model_ + (str(variables['model']),)
        query = "SELECT * FROM model WHERE `model` = %s"
        mycursor.execute(query, model_)
        model_result = mycursor.fetchall()

        # if it doesnt exist then insert new entry
        if len(model_result) < 1:
            make_model = (make_id, (variables['model']))
            insert_model_query = "INSERT INTO model (`model_id`,`make_id`, `model`) VALUES (NULL, %s,%s)"
            mycursor.execute(insert_model_query,make_model)
            db.commit()

        # get model id for later insert
        model_id_query = "SELECT `model_id` FROM model WHERE `model` = %s"           
        mycursor.execute(model_id_query, model_)
        model_id_fetch = mycursor.fetchall()
        model_id = model_id_fetch[0][0]

        # query whether the fuel already exists in db
        fuel_ = ()
        fuel_ = fuel_ + (str(variables['fuelType']),)
        query = "SELECT * FROM fuel WHERE `fuel` = %s"
        mycursor.execute(query, fuel_)
        fuel_result = mycursor.fetchall()

        # if it doesnt exist then insert new entry
        if len(fuel_result) < 1:
            insert_fuel_query = "INSERT INTO fuel (`fuel_id`, `fuel`) VALUES (NULL, %s)"
            mycursor.execute(insert_fuel_query, fuel_)
            db.commit()

        # get fuel id for later insert
        fuel_id_query = "SELECT `fuel_id` FROM fuel WHERE `fuel` = %s"           
        mycursor.execute(fuel_id_query, fuel_)
        fuel_id_fetch = mycursor.fetchall()
        fuel_id = fuel_id_fetch[0][0]

        if variables['transmission'].__contains__("Manual"):
            transmission_id = 21
        elif variables['transmission'].__contains__("Automatic"):
            transmission_id = 22
        else:
            transmission_id = 23

        # query whether the body_type already exists in db
        body_type_ = ()
        body_type_ = body_type_ + (str(variables['bodyType']),)
        query = "SELECT * FROM body_type WHERE `body_type` = %s"
        mycursor.execute(query, body_type_)
        body_type_result = mycursor.fetchall()

        # if it doesnt exist then insert new entry
        if len(body_type_result) < 1:
            insert_body_type_query = "INSERT INTO body_type (`body_type_id`, `body_type`) VALUES (NULL, %s)"
            mycursor.execute(insert_body_type_query, body_type_)
            db.commit()

        # get body_type id for later insert
        body_type_id_query = "SELECT `body_type_id` FROM body_type WHERE `body_type` = %s"           
        mycursor.execute(body_type_id_query, body_type_)
        body_type_id_fetch = mycursor.fetchall()
        body_type_id = body_type_id_fetch[0][0]

        # query whether the colour already exists in db
        colour_ = ()
        colour_ = colour_ + (str(variables['colour']),)
        query = "SELECT * FROM colour WHERE `colour` = %s"
        mycursor.execute(query, colour_)
        colour_result = mycursor.fetchall()

        # if it doesnt exist then insert new entry
        if len(colour_result) < 1:
            insert_colour_query = "INSERT INTO colour (`colour_id`, `colour`) VALUES (NULL, %s)"
            mycursor.execute(insert_colour_query, colour_)
            db.commit()

        # get colour id for later insert
        colour_id_query = "SELECT `colour_id` FROM colour WHERE `colour` = %s"           
        mycursor.execute(colour_id_query, colour_)
        colour_id_fetch = mycursor.fetchall()
        colour_id = colour_id_fetch[0][0]

        # query whether the county already exists in db
        location_ = ()
        location_ = location_ + (str(location),)
        query = "SELECT * FROM county WHERE `county` = %s"
        mycursor.execute(query, location_)
        location_result = mycursor.fetchall()

        # if it doesnt exist then insert new entry
        if len(location_result) < 1:
            insert_location_query = "INSERT INTO county (`county_id`, `county`) VALUES (NULL, %s)"
            mycursor.execute(insert_location_query, location_)
            db.commit()

        # get county id for later insert
        location_id_query = "SELECT `county_id` FROM county WHERE `county` = %s"           
        mycursor.execute(location_id_query, location_)
        location_id_fetch = mycursor.fetchall()
        location_id = location_id_fetch[0][0]

        ### GET DEALER DATA ###

        dealer_name = ""
        dealer_latitude = ""
        dealer_longitude = ""
        dealer_county = ""
        dealer_address = ""
        dealer_id = ""
        
        if 'dealer' in donedealData['ads'][ad]:
            if 'name' in donedealData['ads'][ad]['dealer']:
                dealer_name = donedealData['ads'][ad]['dealer']['name']
            if 'latitude' in donedealData['ads'][ad]['dealer']:
                dealer_latitude = donedealData['ads'][ad]['dealer']['latitude']
            if 'longitude' in donedealData['ads'][ad]['dealer']:
                dealer_longitude = donedealData['ads'][ad]['dealer']['longitude']
            if 'address' in donedealData['ads'][ad]['dealer']:
                dealer_address = donedealData['ads'][ad]['dealer']['address']
            if 'addressRegion' in donedealData['ads'][ad]['dealer']['enhancedAddress']:
                dealer_county = donedealData['ads'][ad]['dealer']['enhancedAddress']['addressRegion']

            ### INSERT DEALER DATA INTO NORMALISED TABLES AND GET IDS ###

            # query whether the county already exists in db
            county_ = ()
            county_ = county_ + (str(dealer_county),)
            query = "SELECT * FROM county WHERE `county` = %s"
            mycursor.execute(query, county_)
            county_result = mycursor.fetchall()

            # if it doesnt exist then insert new entry
            if len(county_result) < 1:
                insert_county_query = "INSERT INTO county (`county_id`, `county`) VALUES (NULL, %s)"
                mycursor.execute(insert_county_query, county_)
                db.commit()

            # get county id for later insert
            county_id_query = "SELECT `county_id` FROM county WHERE `county` = %s"           
            mycursor.execute(county_id_query, county_)
            county_id_fetch = mycursor.fetchall()
            county_id = county_id_fetch[0][0]

            # query whether the dealer already exists in db
            dealer_ = ()
            dealer_ = dealer_ + (str(dealer_name),)
            query = "SELECT * FROM dealer WHERE `name` = %s"
            mycursor.execute(query, dealer_)
            dealer_result = mycursor.fetchall()

            # if it doesnt exist then insert new entry
            if len(dealer_result) < 1:
                insert_dealer_query = "INSERT INTO dealer (`dealer_id`, `name`, `latitude`, `longitude`, `address`, `county_id`) VALUES (NULL, %s, %s, %s, %s, %s)"
                dealer_insert = dealer_ + (str(dealer_latitude), str(dealer_longitude), str(dealer_address), str(county_id))
                mycursor.execute(insert_dealer_query, dealer_insert)
                db.commit()

            # get dealer id for later insert
            dealer_id_query = "SELECT `dealer_id` FROM dealer WHERE `name` = %s"           
            mycursor.execute(dealer_id_query, dealer_)
            dealer_id_fetch = mycursor.fetchall()
            dealer_id = dealer_id_fetch[0][0]

        ### MAKE QUERY AND INSERT INTO CAR TABLE ###
        
        car = [donedeal_id, dealer_id, model_id, variables['price'], variables['year'], 
                variables['mileage'], fuel_id, transmission_id, body_type_id, variables['engine'], 
                colour_id, location_id, upload_date,today]

        query = "INSERT INTO car (car_id,donedeal_id,dealer_id, model_id, price, year, \
                mileage, fuel_id, transmission_id, body_type_id, engine_size, colour_id,\
                 county_id, upload_date,date_scraped) VALUES (NULL,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"

        if upload_date > (today - timedelta(days = 2)) and upload_date < today and insert == True:

            mycursor.execute(query, car)

            db.commit()
            
            print("scraped")
            scraped = scraped + 1      

        ad = ad + 1
    print(i)    
    i = i + 28

    time.sleep(1)

#### INSERT INTO ADMIN DATA TABLE ####

admin_query = "INSERT INTO admin_data (data_id, date_scraped, cars_scraped) VALUES (NULL, %s, %s)"
admin_data = [today, scraped]
mycursor.execute(admin_query, admin_data)
db.commit()

print("--+ Complete +--")

