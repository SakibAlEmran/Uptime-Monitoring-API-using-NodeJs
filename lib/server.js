/* 
    Title: Server Library
    Descrition: server related files
    Author: Sakib Al Emran
    Date: 09/10/2021    

*/

//dependencies
const http = require('http');
const {handleReqRes} = require('../helpers/handleReqRes');
const environments = require('../helpers/environments');

//app object - module scafFolding
const server = {};

//create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(environments.port, () => {
        console.log(`listening to port ${environments.port} and environment is ${environments.envName}`)
    });
};

//handle Request and Response
server.handleReqRes = handleReqRes;

//start the server
server.init = () => {
    server.createServer();
};

//export module
module.exports = server;






