/* 
    Title: Initial file
    Descrition: Initial file to start the node server and workers
    Author: Sakib Al Emran
    Date: 09/10/2021    

*/

//dependencies
const server = require('./lib/server');
const worker = require('./lib/worker');

//app object -- module scafFolding
const app = {};

app.init = () => {
    //start the server
    server.init();

    //start the workers
    worker.init();
};

//initiation of app.init() function
app.init();   