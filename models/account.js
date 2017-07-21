'use strict'
const MongoModels = require('mongo-models')
const Joi = require('joi')
const Async = require('async')
const StatusEntry = require('./status-entry')
const NoteEntry = require('./note-entry')

class Account extends MongoModels {

}

Account.collection = 'accounts';

Account.schema = Joi.object.keys({
    _id: Joi.object(),
    user: Joi.object.keys({
            id: Joi.string().required(),
            name: Joi.string().lowercase().required()
        }),
    name: Joi.object().keys({
            first: Joi.string().required(),
            middle: Joi.string().allow(''),
            last: Joi.string().required()
        }),
    status: Joi.object().keys({
            current: StatusEntry.schema,
            log: Joi.array().items(StatusEntry.schema)
        }),
    notes: Joi.array().items(NoteEntry.schema),
    verification: Joi.object().keys({
            complete: Joi.boolean(),
            token: Joi.string()
        }),
    timeCreated: Joi.date()
});

Account.indexes = [
    { key: { 'user.id' : 1} },
    { key: { 'user.name' : 1} }
]
module.exports = Account;