/* 
    Title: Token Handler
    Descrition: Handle token (POST, GET, PUT & DELETE) request for a user
    Author: Sakib Al Emran
    Date: 07/10/2021    

*/

//dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const { createRandomString } = require('../../helpers/utilities')

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        //call the corresponding method request
        handler._token[requestProperties.method](requestProperties, callback);
        
    }else{
        callback(405);
    }
};

//token properties module
handler._token = {};

handler._token.post = (requestProperties, callback) => {
    const phone = typeof (requestProperties.body.phone) === 'string' 
        && (requestProperties.body.phone.trim().length) === 11 
        ? requestProperties.body.phone 
        : false;

    const password = typeof (requestProperties.body.password) === 'string' 
        && (requestProperties.body.password.trim().length) > 0 
        ? requestProperties.body.password 
        : false;
    if(phone && password){
        //look up the user
        data.read('users', phone, (err1, userData) => {
            const hashedPassword = hash(password);
            if(hashedPassword === parseJSON(userData).password){
                const tokenId = createRandomString(20);
                const expires = Date.now() + 60 *60 *1000;
                const tokenObject = {
                    phone,
                    id: tokenId,
                    expires,
                }
                //store the token in the token database
                data.create('tokens', tokenId, tokenObject, (err2) => {
                    if(!err2){
                        callback(200, tokenObject);
                    }else{
                        callback(500, {
                            error: 'There was a problem in the server side!',
                        });
                    }
                });
            }else{
                callback(400, {
                    error: 'password is not valid.',
                });
            }
        });
    }else{
        callback(400, {
            error: 'You have a problem in your request.',
        });
    }
};

handler._token.get = (requestProperties, callback) => {
    const id = typeof (requestProperties.queryStringObject.id) === 'string' 
        && (requestProperties.queryStringObject.id.trim().length) === 20 
        ? requestProperties.queryStringObject.id
        : false;
    //token id validation    
    if(id){
        //lookup the token
        data.read('tokens', id, (err, tokenData) => {
            const token = {...parseJSON(tokenData)};
            if(!err && token){
                callback(200, token);
            }else{
                callback(404, {
                    error: 'Requested token was not found!',
                })
            }
        });
    }else{
        callback(404, {
            error: 'Requested token was not found!',
        });
    }    
};

handler._token.put = (requestProperties, callback) => {
    const id = typeof (requestProperties.body.id) === 'string' 
        && (requestProperties.body.id.trim().length) === 20 
        ? requestProperties.body.id 
        : false;
    
    const extend = typeof (requestProperties.body.extend) === 'boolean'
        && (requestProperties.body.extend) === true ? true : false;

    if(id && extend){
        //look the tokens
        data.read('tokens', id, (err1, tokenData) => {
            const tokenObject = parseJSON(tokenData);
            if(tokenObject.expires > Date.now()){
                tokenObject.expires = Date.now() + 60 * 60 * 1000;
                //store the update token
                data.update('tokens', id, tokenObject, (err2) => {
                    if(!err2){
                        callback(200);
                    }else{
                        callback(500, {
                            error: 'there was a server side error!',
                        })
                    }
                });
            }else{
                callback(400, {
                    error: 'Token already expired',
                });
            }
        });
    }else{
        callback(400, {
            error: 'There is a problem in your request!',
        });
    }
};

handler._token.delete = (requestProperties, callback) => {
    const id = typeof (requestProperties.queryStringObject.id) === 'string' 
        && (requestProperties.queryStringObject.id.trim().length) === 20 
        ? requestProperties.queryStringObject.id
        : false;  

    if(id){
        //look up the token
        data.read('tokens', id, (err1, tokenData) => {
            if(!err1 && tokenData){
                //delete the token from database
                data.delete('tokens', id, (err2) => {
                    if(!err2){
                        callback(200, {
                            message: 'Token was successfully deleted!',
                        });
                    }else{
                        callback(500, {
                            error: 'There was a server side error!',
                        });
                    }
                })
            }else{
                callback(500, {
                    error: 'There was a server side error!, token may not exist',
                });
            }
        });

    }else{
        callback(400, {
            error: "there is a problem in your request!",
        })
    }    
};

handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData){
            if(parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }
    });
}

//export module
module.exports = handler;