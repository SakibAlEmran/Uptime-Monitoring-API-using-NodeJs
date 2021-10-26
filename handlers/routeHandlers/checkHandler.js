/* 
    Title: Check Handler
    Descrition: Handle checks (POST, GET, PUT & DELETE) request for a user
    Author: Sakib Al Emran
    Date: 08/10/2021    

*/

//dependencies
const data = require('../../lib/data');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

//module scaffolding
const handler = {};


handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        //call the corresponding method request
        handler._checks[requestProperties.method](requestProperties, callback);
        
    }else{
        callback(405);
    }
};

//user specific information
handler._checks = {};

handler._checks.post = (requestProperties, callback) => {
    //validate input
    const protocol = typeof(requestProperties.body.protocol) === 'string' 
        && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
        ? requestProperties.body.protocol : false;
    
    const url = typeof(requestProperties.body.url) === 'string' 
        &&  requestProperties.body.url.trim().length > 0
        ? requestProperties.body.url : false;

    const method = typeof requestProperties.body.method === 'string' 
        && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
        ? requestProperties.body.method : false;

    const successCodes = typeof(requestProperties.body.successCodes) === 'object' 
        &&  requestProperties.body.successCodes instanceof Array
        ? requestProperties.body.successCodes : false;

    const timeoutSeconds = typeof requestProperties.body.timeoutSeconds === 'number' 
        && requestProperties.body.timeoutSeconds % 1 === 0 
        && requestProperties.body.timeoutSeconds >= 1 
        && requestProperties.body.timeoutSeconds <= 5
        ? requestProperties.body.timeoutSeconds : false;

    if( protocol && url && method && successCodes && timeoutSeconds){
        const token = typeof requestProperties.headersObject.token === 'string'
            ? requestProperties.headersObject.token : false;
        
        //lookup the user phone by reading the token
        data.read('tokens', token, (err1, tokenData) => {
            if(!err1 && tokenData){
                const userPhone = parseJSON(tokenData).phone;
                //lookup the user data
                data.read('users', userPhone, (err2, userData) => {
                    if(!err2 && userData){
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) =>{
                            if(tokenIsValid){
                                const userObject = parseJSON(userData);
                                const userChecks = typeof (userObject.checks) === 'object'
                                    && userObject.checks instanceof Array
                                    ? userObject.checks : [];
                                
                                if(userChecks.length < maxChecks){
                                    const checkId = createRandomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };
                                    //save the object
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if(!err3){
                                            //add check id to the user's object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            //save the new user data
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if(!err4){
                                                    //return the data about the new check
                                                    callback(200, checkObject);
                                                }else{
                                                    callback(500, {
                                                        error: 'There was a problem in the server side!',
                                                    });
                                                }
                                            });

                                        }else{
                                            callback(500, {
                                                error: 'There was a problem in the server side!',
                                            });
                                        }
                                    });
                                }else{
                                    callback(401, {
                                        error: 'User has already reached max check limit!',
                                    });
                                }
                            }else{
                                callback(403, {
                                    error: 'Authentication problem!, token may not exist or expired',
                                });
                            }
                        });
                    }else{
                        callback(403, {
                            error: 'User not found!',
                        });
                    }
                });

            }else{
                callback(403, {
                    error: 'Authentication problem!',
                });
            }
        });
    }else{
        callback(400, {
            error: 'You have a problem in your request! all valid required',
        });
    }
};


handler._checks.get = (requestProperties, callback) => {
    const id = typeof requestProperties.queryStringObject.id === 'string' 
        && requestProperties.queryStringObject.id.trim().length === 20
        ? requestProperties.queryStringObject.id : false;

    if(id){
        //look up the checks
        data.read('checks', id, (err, checkData) => {
            if(!err && checkData){
                const token = typeof requestProperties.headersObject.token === 'string'
                    ? requestProperties.headersObject.token : false;
                
                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if(tokenIsValid){
                        callback(200, parseJSON(checkData));
                    }else{
                        callback(403, {
                            error: 'Authentication failure!',
                        });
                    }
                });
            }else{
                callback(500, {
                    error: ' corresponding checks may not exist',
                });
            }
        });
    }else{
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};


handler._checks.put = (requestProperties, callback) => {

    const id = typeof requestProperties.queryStringObject.id === 'string' 
        && requestProperties.queryStringObject.id.trim().length === 20
        ? requestProperties.queryStringObject.id : false;

    //validate input
    const protocol = typeof(requestProperties.body.protocol) === 'string' 
        && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
        ? requestProperties.body.protocol : false;
    
    const url = typeof(requestProperties.body.url) === 'string' 
        &&  requestProperties.body.url.trim().length > 0
        ? requestProperties.body.url : false;

    const method = typeof requestProperties.body.method === 'string' 
        && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
        ? requestProperties.body.method : false;

    const successCodes = typeof(requestProperties.body.successCodes) === 'object' 
        &&  requestProperties.body.successCodes instanceof Array
        ? requestProperties.body.successCodes : false;

    const timeoutSeconds = typeof requestProperties.body.timeoutSeconds === 'number' 
        && requestProperties.body.timeoutSeconds % 1 === 0 
        && requestProperties.body.timeoutSeconds >= 1 
        && requestProperties.body.timeoutSeconds <= 5
        ? requestProperties.body.timeoutSeconds : false;

    if(id){
        if(protocol || url || method || successCodes || timeoutSeconds){
            //lookup the check
            data.read('checks', id, (err1, checkData) =>{
                if(!err1 && checkData){
                    const checkObject = parseJSON(checkData);
                    const token = typeof requestProperties.headersObject.token === 'string'
                        ? requestProperties.headersObject.token : false;

                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if(tokenIsValid){
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }

                            //store the checkObject
                            data.update('checks', id, checkObject, (err2) => {
                                if(!err2){
                                    callback(200);
                                }else{
                                    callback(500, {
                                        error: 'There was a server side error!',
                                    });
                                }
                            });
                        }else{
                            callback(403, {
                                error: 'Authentication error!',
                            });
                        }
                    });
                }else{
                    callback(500, {
                        error: 'There was a problem in server side',
                    });
                }
            });
        }else{
            callback(400, {
                error: 'You must provide at least one field to update!',
            });
        }
    }else{
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handler._checks.delete = (requestProperties, callback) => {
    const id = typeof requestProperties.queryStringObject.id === 'string' 
        && requestProperties.queryStringObject.id.trim().length === 20
        ? requestProperties.queryStringObject.id : false;

    if(id){
        //look up the checks
        data.read('checks', id, (err1, checkData) => {
            if(!err1 && checkData){
                const token = typeof requestProperties.headersObject.token === 'string'
                    ? requestProperties.headersObject.token : false;

                const phone = parseJSON(checkData).userPhone;
                
                tokenHandler._token.verify(token, phone, (tokenIsValid) => {
                    if(tokenIsValid){
                        //delete the check data
                        data.delete('checks', id, (err2) =>{
                            if(!err2){
                                //read the user data and delete checks property
                                data.read('users', phone, (err3, userData) => {
                                    const userObject = parseJSON(userData);
                                    if(!err3){
                                        const userChecks = typeof userObject.checks === 'object'
                                            && userObject.checks instanceof Array
                                            ? userObject.checks : [];
                                        
                                        //remove the deleted check id from user's list of checks
                                        const checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition, 1);
                                            //resave the userdata
                                            userObject.checks = userChecks;
                                            data.update('users', userObject.phone, userObject, (err4) => {
                                                if(!err4){
                                                    callback(200);
                                                }else{
                                                    callback(500, {
                                                        error: 'There was a server side problem!',
                                                    });
                                                }
                                            });
                                        }else{
                                            callback(500, {
                                                error: 'The check id that you are trying to remove is not found in user!',
                                            });
                                        }
                                    }else{
                                        callback(500, {
                                            error: 'There was a server side problem!',
                                        });
                                    }
                                });
                            }else{
                                callback(500, {
                                    error: 'There was a server side problem!',
                                });
                            }
                        });
                    }else{
                        callback(403, {
                            error: 'Authentication failure!',
                        });
                    }
                });
            }else{
                callback(500, {
                    error: ' corresponding checks may not exist',
                });
            }
        });
    }else{
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

//export module
module.exports = handler;