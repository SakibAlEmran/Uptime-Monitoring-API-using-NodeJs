/*
    title: environments variable
    description: Handle all environment of the system
    date: 01/10/2021
*/

//creating an object for all environments
const environments = {};

//staging environment
environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'hsjdhsdhsjdhjshdjshd',
    maxChecks: 5,
    twilio: {
        fromPhone: '',
        accountSid: '',
        authToken: '',
    },
}

//production environment
environments.production = {
    port: 5001,
    envName: 'production',
    secretKey: 'djkdjskdjksdjksjdskjd',
    maxChecks: 5,
    twilio: {
        fromPhone: '',
        accountSid: '',
        authToken: '',
    },
}

//determine which environment was passed
const currentEnvironment = 
    typeof process.env.NODE_ENV === 'string'? process.env.NODE_ENV : 'staging';

//export corresponding environment object
const environmentToExport =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;

//export module
module.exports = environmentToExport;