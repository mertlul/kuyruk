import datetime
import sqlite3
import pyodbc
from flask import Flask, jsonify, request
from flask_restful import Resource, Api
from flask_cors import CORS, cross_origin
import secrets
import hashlib
from heyoo import WhatsApp
import os
from twilio.rest import Client
messenger = WhatsApp('EABJj1xxxxxx',phone_number_id='1130xxxxxxxx')

account_sid = 'AC3778b64cfc382543f1b0a204b1d09517'
auth_token = '4ed4720d4931dbf8c4754348e3ca01cc'
client = Client(account_sid, auth_token)



connstring = 'DRIVER={SQL Server};Server=localhost;Database=VQueue;Port=myport;User ID=myuserid;Password=mypassword'

# Create the flask app
app = Flask(__name__)
# Create an API object
api = Api(app)
CORS(app, support_credentials=True)

@app.route("/getWaitlist")
def getWaitlist():
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM dbo.waitlist')
    results = []
    for i in cursor:
        results.append(i[1])
    return jsonify({'message': 'The below specified data added to database'},{'data': results} )
	
@app.route("/getWaitlistPosition")
def getWaitlistPosition():
    name = request.args.getlist("name")
    surname = request.args.getlist("surname")
    phone = request.args.getlist("phone")
    sessionid = request.args.getlist("session")[0]
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    query = """SELECT count(*) FROM waitlist where ready_f = 0  and insert_date <= 
                   (select insert_date from waitlist where sessionid = \'""" + sessionid + '\')'
    cursor.execute(query)
    results = []
    for i in cursor:
        if i[0] != "":
            results.append(i[0])
        else:
            results.append(0)
    query = """SELECT distinct restaurantid FROM waitlist where insert_date <= 
                   (select insert_date from waitlist where sessionid = \'""" + sessionid + '\')'
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    restaurantid = results[1]
    query = 'SELECT restaurant_name FROM restaurants where restaurantid = ' + str(restaurantid)
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    query = 'SELECT average_wait_time FROM restaurants where restaurantid = ' + str(restaurantid)
    cursor.execute(query)
    for i in cursor:
        print(i[0])
        results.append(i[0])
    query = """SELECT ready_f FROM waitlist where sessionid = \'""" + sessionid + '\''
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    query = """SELECT check_f FROM waitlist where sessionid = \'""" + sessionid + '\''
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    query = 'SELECT hashed_id FROM restaurants where restaurantid = ' + str(restaurantid)
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    return jsonify({'queueData' : results[0], 'restaurantName' : results[2], 'averageWaitTime' : results[3], 'restaurantId' : results[6], 'readyF' : results[4], 'checkF' : results[5] })
	
@app.route("/joinWaitlist", methods=['POST'])
def joinWaitlist():
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    name = request.json['name']
    surname = request.json['surname']
    phone = request.json['phone']
    restaurantid = request.json['restaurantid']
    numOfPeople = request.json['numOfPeople']
    query = 'select count(*) from waitlist where phone_number = \'' + phone + '\' and ready_f = \'0\''
    cursor.execute(query)
    results = []
    for i in cursor:
        results.append(i[0])
    
    if results[0] != 0:
         return jsonify({'data': 'You have a pending queue!'}), 400
    sessionid = secrets.token_hex(64)
    query = 'insert into waitlist (name, surname, phone_number, insert_date, check_f, ready_f, restaurantid, sessionid, number_of_people) values(\'' + name + '\', \'' + surname + '\', \'' + phone + '\', CURRENT_TIMESTAMP, \'0\', \'0\', ' + '(select restaurantid from restaurants where hashed_id = \'' + restaurantid + '\')' + ', \'' + sessionid + '\',  ' + numOfPeople + ')'
    cursor.execute(query)
    
    query = 'select userid from waitlist where name = \'' + name + '\' and surname = \'' + surname + '\' and phone_number = \'' + phone + '\' and restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + restaurantid + '\')' + ' and ready_f = \'0\''
    cursor.execute(query)
    conn.commit()
    results = []
    for i in cursor:
        results.append(i[0])
    results.append(sessionid)
    
    return jsonify({'data': results})

@app.route("/checkQueueStatus", methods=['POST'])
def checkQueueStatus():
    restaurantid = request.json['restaurantid']
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    query = 'SELECT queue_status FROM restaurants where hashed_id = \'' + restaurantid + '\''
    cursor.execute(query)
    results = []
    for i in cursor:
        results.append(i[0])
    query = 'SELECT average_wait_time FROM restaurants where hashed_id = \'' + restaurantid + '\''
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    query = 'SELECT max_reservation_count FROM restaurants where hashed_id = \'' + restaurantid + '\''
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    query = 'SELECT count(*) FROM waitlist where ready_f = 0 and restaurantid = (select restaurantid from restaurants where hashed_id = \'' + restaurantid + '\')'
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    query = 'SELECT restaurant_name FROM restaurants where hashed_id = \'' + restaurantid + '\''
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    
    return jsonify({'queueOpen' : results[0], 'averageWaitTime' : results[1], 'availableNumbers' : results[2], 'queueSize' : results[3], 'restaurantName' : results[4] })

@app.route("/removeFromQueue", methods=['POST'])
def removeFromQueue():
    sessionid = request.json['sessionid']
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    query = 'update waitlist set ready_f = 1, check_f = 2 where sessionid = \'' + sessionid + '\''
    cursor.execute(query)
    conn.commit()
    
    return jsonify({'data' : 'Done.'})


@app.route("/signIn", methods=['POST'])
def signIn():
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    username = request.json['username']
    password = request.json['password']
    print(password)
    # query = 'insert into admins values (1, \'admin\', \'' + password + '\')'
    query = 'select password from admins where username = \'' + username + '\''
    cursor.execute(query)
    results = []
    for i in cursor:
        results.append(i[0])
    if (results[0] == password): 
        query = 'select hashed_id from restaurants where restaurantid = (select restaurantid from admins where username = \'' + username + '\')'
        print(query)
        cursor.execute(query)
        for i in cursor:
            results.append(i[0])
        return jsonify({'data' : 'Done.', 'restaurantId' : results[1] })
    else: 
        return jsonify({'data': 'Wrong username or password!'}), 400
    

@app.route("/fetchRestaurantDetails", methods=['POST'])
def fetchRestaurantDetails():
    restaurantid = request.json['restaurantid']
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    query = 'SELECT queue_status FROM restaurants where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')'
    cursor.execute(query)
    results = []
    for i in cursor:
        results.append(i[0])
    query = 'SELECT average_wait_time FROM restaurants where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')'
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    query = 'SELECT max_reservation_count FROM restaurants where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')'
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    query = 'SELECT count(*) FROM waitlist where ready_f = 0 and restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')'
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    query = 'SELECT restaurant_name FROM restaurants where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')'
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    query = 'SELECT strftime("%H:%M", closing_time) FROM restaurants where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')'
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    query = 'SELECT strftime("%H:%M", opening_time) FROM restaurants where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')'
    cursor.execute(query)
    for i in cursor:
        results.append(i[0])
    return jsonify({'queueStatus' : results[0], 'averageWaitTime' : results[1], 'availableNumbers' : results[2], 'queueSize' : results[3], 'restaurantName' : results[4], 'closingTime': results[5], 'openingTime' : results[6] })

@app.route("/fetchUserList", methods=['POST'])
def fetchUserList():
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    restaurantid = request.json['restaurantid']
    # query = 'insert into admins values (1, \'admin\', \'' + password + '\')'
    query = 'select [userid],[name],[surname],[phone_number],strftime("%H:%M:%S", insert_date),[check_f],[ready_f],[restaurantid],[sessionid],[number_of_people] from waitlist where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')' + ' and check_f = 0'
    cursor.execute(query)
    results = []
    for i in cursor:
        results.append({'userid' : i[0], 'name' : i[1], 'surname' : i[2], 'phone' : i[3], 'reservationTime' : i[4], 'readyF' : i[6], 'numOfPeople' : i[9]})
    return jsonify({'data' : results})

@app.route("/saveMaxReservationCount", methods=['POST'])
def saveMaxReservationCount():
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    restaurantid = request.json['restaurantid']
    maxReservationCount = request.json['maxReservationCount']
    query = 'update restaurants set max_reservation_count = ' + str(maxReservationCount) + ' where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')'
    cursor.execute(query)
    conn.commit()

    return jsonify({'data' : 'Done.'})

@app.route("/saveAverageWaitTime", methods=['POST'])
def saveAverageWaitTime():
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    restaurantid = request.json['restaurantid']
    averageWaitTime = request.json['averageWaitTime']
    query = 'update restaurants set average_wait_time = ' + str(averageWaitTime) + ' where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')'
    cursor.execute(query)
    conn.commit()
    
    return jsonify({'data' : 'Done.'})

@app.route("/saveOpeningTime", methods=['POST'])
def saveOpeningTime():
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    restaurantid = request.json['restaurantid']
    openingTime = request.json['openingTime']
    query = 'update restaurants set opening_time = \'' + openingTime + '\' where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')'
    cursor.execute(query)
    conn.commit()
    
    return jsonify({'data' : 'Done.'})

@app.route("/saveClosingTime", methods=['POST'])
def saveClosingTime():
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    restaurantid = request.json['restaurantid']
    closingTime = request.json['closingTime']
    query = 'update restaurants set closing_time = \'' + closingTime + '\' where restaurantid =' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')'
    cursor.execute(query)
    conn.commit()
    
    return jsonify({'data' : 'Done.'})

@app.route("/saveRestaurantDetails", methods=['POST'])
def saveRestaurantDetails():
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    restaurantid = request.json['restaurantid']
    maxReservationCount = request.json.get('maxReservationCount')
    averageWaitTime = request.json.get('averageWaitTime')
    openingTime = request.json.get('openingTime')
    closingTime = request.json.get('closingTime')

    query = f"UPDATE restaurants set max_reservation_count = '{maxReservationCount}', average_wait_time = '{averageWaitTime}', opening_time = '{openingTime}', closing_time = '{closingTime}' WHERE restaurantid = (SELECT restaurantid FROM restaurants WHERE hashed_id = '{restaurantid}')"
    
    # Execute the query
    cursor.execute(query)
    conn.commit()

    return jsonify({'data': 'Done.'})

@app.route("/saveQueueStatus", methods=['POST'])
def saveQueueStatus():
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    restaurantid = request.json['restaurantid']
    queueStatus = request.json['queueStatus']
    if queueStatus == False: queueStatus = 1 
    else: queueStatus = 0
    query = 'update restaurants set queue_status = \'' + str(queueStatus) + '\' where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')'
    cursor.execute(query)

    if queueStatus == 0:
        updateQuery = 'update waitlist set check_f = 2, ready_f = 1 where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')'
        cursor.execute(updateQuery)

    conn.commit()
    
    return jsonify({'data' : 'Done.'})

@app.route("/addNewUser", methods=['POST'])
def addNewUser():
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    restaurantid = request.json['restaurantid']
    userphone = request.json['phone']
    username = request.json['name']
    usersurname = request.json['surname']
    numOfPeople = request.json['numOfPeople']
    query = 'select count(*) from waitlist where phone_number = \'' + userphone + '\' and ready_f = \'0\''
    cursor.execute(query)
    results = []
    for i in cursor:
        results.append(i[0])
    
    if results[0] != 0:
         return jsonify({'data': 'This phone has a pending queue!'}), 400
    query = 'insert into waitlist (name, surname, phone_number, insert_date, check_f, ready_f, restaurantid, sessionid, number_of_people) values (\'' + username + '\', \'' + usersurname + '\', \'' + str(userphone) + '\', ' + 'CURRENT_TIMESTAMP' + ', \'' + '0' + '\', \'' + '0' + '\', ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')' + ', \'' + '' + '\', ' + str(numOfPeople) + ')'
    cursor.execute(query)
    conn.commit()
    
    return jsonify({'data' : 'Done.'})

@app.route("/checkInUser", methods=['POST'])
def checkInUser():
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    restaurantid = request.json['restaurantid']
    userphone = request.json['userphone']
    query = 'update waitlist set check_f = 1, ready_f = 1 where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')' + ' and phone_number = \'' + userphone + '\''
    cursor.execute(query)
    conn.commit()
    
    return jsonify({'data' : 'Done.'})

@app.route("/removeUser", methods=['POST'])
def removeUser():
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    restaurantid = request.json['restaurantid']
    userphone = request.json['userphone']
    query = 'update waitlist set check_f = 2, ready_f = 1 where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')' + ' and phone_number = \'' + userphone + '\''
    cursor.execute(query)
    conn.commit()
    
    return jsonify({'data' : 'Done.'})

@app.route("/sendSMS", methods=['POST'])
def sendSMS():
    #cnxn = pyodbc.connect(connstring)
    conn = sqlite3.connect('kuyruk.db')
    cursor = conn.cursor()
    restaurantid = request.json['restaurantid']
    userphone = request.json['userphone']
    query = 'update waitlist set ready_f = ' + '1' + ' where restaurantid = ' + '(select restaurantid from restaurants where hashed_id = \'' + str(restaurantid) + '\')' + ' and phone_number = \'' + userphone + '\''
    cursor.execute(query)
    conn.commit()
    
    # message = client.messages.create(
    #     from_='whatsapp:+14155238886',
    #     body='Your appointment is coming up on July 21 at 3PM',
    #     to='whatsapp:' + userphone
    # )
    return jsonify({'data' : 'Done.'})

# Driver function
if __name__ == '__main__':

	app.run(host='0.0.0.0', port=5000, debug=True)