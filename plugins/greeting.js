'use strict';
exports.register = function(server, options, next) 
{
    const greeting = function(name) {
        options.locale = options.locale || 'en-us';
        name = name || 'world';
        let message = '';
        switch(options.locale.toLowerCase()) {
            case 'de-de':
                message = 'Hallo ' + name;
                break;
            case 'fr-fr':
                message = 'Bonjour ' + name;
                break;
            case 'en-us':
            default:
                message = 'Hello ' + name;
        }
        return message;
    };
    
    server.expose({ sayGreeting: greeting});
    next();
};

exports.register.attributes = { name: 'greeting'};