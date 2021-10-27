# Uptime-Monitoring-API-using-NodeJs

## Overview 
This API will lookup a user checklist of some websites. If any link changes a state up to down or down to up, the reference user will get a sms.

This API handles the request and give a reference endpoint as a response. This API has 5 endpoints:
1.  sample Handler: sample handler response
2.  user Handler: you can create, read, update or delete a user with proper request properties and validation.
3.  token Handler: you can create, read, update or delete a token of a user with proper request properties and validation.
4.  check Handler: you can create, read, update or delete a check list of a user with proper request properties and validation.
5.  not Founnd Handler

## How to run
Please follow the below instructions to run this project in your machine: you should have node and npm installed in your machine.
1. Clone this repository 
```
git clone https://github.com/SakibAlEmran/Uptime-Monitoring-API-using-NodeJs.git
```
2. Go into cloned directory: 
```
cd Uptime-Monitoring-API-using-NodeJs
```
3. Create a directory for database and create all the necessary directory as shown in below. I have managed this project database in local machine file-system. 
```
mkdir .data
cd .data
mkdir users tokens checks dataBase
```
4. install nodemon
```
npm i nodemon
```
5. Run the app: There are two environments for this API: staging and production. Look the package.json file.
```
npm run staging
```
6. You can use postman as a client and test all the end-points with proper request.
7. To send a sms from twilio you have to collect AccountSid, Authtoken and a phone number from https://www.twilio.com

## contact
Name: Sakib Al Emran

email: sakib.imran0909@gmail.com

## Credit
I am inspired from Sumit Saha (https://www.youtube.com/channel/UCFM3gG5IHfogarxlKcIHCAg) for this beautiful project.
