'use strict'
const MongoModels = require('mongo-models')
const Joi = require('joi')
const Async = require('async')

class Contact extends MongoModels {
    static create(name, email, message, callback) {
        const document = {  name: name, 
                            email: email, 
                            message: message,
                            timeCreated: Date.now() 
                        }
        Contact.insertOne(document, callback);
    }
}

Contact.collection = 'contacts';

Contact.schema = Joi.object().keys({
    _id: Joi.object(),
    name: Joi.string(),
    email: Joi.string().email().required(),
    message: Joi.string().required(),
    timeCreated: Joi.date()
});

module.exports = Contact;