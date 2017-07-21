'use strict'

const MongoModels = require('mongo-models');
const Joi = require('joi');

class StatusEntry extends MongoModels {}

StatusEntry.schema = Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    timeCreated: Joi.date().required(),
    userCreated: Joi.object().keys({
                id: Joi.string().required(),
                name: Joi.string().lowercase().required()
    }).required()   
})

module.exports = StatusEntry

