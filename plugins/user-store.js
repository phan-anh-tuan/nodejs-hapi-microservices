'use strict';
/**
 * boom provides a set of utilities for returning HTTP errors. 
 * https://www.npmjs.com/package/boom
 */
const Boom = require('boom');
/**
 * This is joi, joi allows you to create blueprints or 
 * schemas for JavaScript objects (an object that stores information) 
 * to ensure validation of key information.
 * https://www.npmjs.com/package/joi
 */
const Joi = require('joi');


const internals = {
    db: {},
    ObjectID: {}
};

exports.register = function(server, options, next) {
    
    
    server.dependency('hapi-mongodb', (_server, next) => {
                                             server.log(['user-store', 'info'], 'user-store obtained db connection ');
                                             internals.db = _server.mongo.db;
                                             internals.ObjectID = _server.mongo.ObjectID;        
                                             //console.log(server.mongo);
                                             next();
                                         });
    internals.getUser = function(userId,callback) {
        
        /*const users = server.plugins['UserStore'].db.collection('users');
        const ObjectID = server.plugins['UserStore'].ObjectID;*/
        const users = internals.db.collection('users');
        const ObjectID = internals.ObjectID;
        users.findOne({ _id: new ObjectID(userId)}, 
                                           (err,result) => {
                                                            if (err) {
                                                                callback(Boom.internal('Internal MongoDB error', err));
                                                            }   
                                                            callback(null, result);
                                                        });
    };
    
    internals.deleteUser = function(userId,callback) {
        
        const users = internals.db.collection('users');
        const ObjectID = internals.ObjectID;
        users.findOneAndDelete({ _id: new ObjectID(userId)}, 
                                           (err,result) => {
                                                            if (err) {
                                                                callback(Boom.internal('Internal MongoDB error', err));
                                                            }   
                                                            callback(null, result);
                                                        });
    };
    
    internals.createUser = function(userDetail,callback) {
        /*console.log(server.plugins['greeting']);*/
        
        const users = internals.db.collection('users');
                
        users.insertOne(userDetail, function(err, result) {
                        if (err) {
                            callback(Boom.internal('Internal MongoDB error', err));
                        }   
                        //console.log(result.insertedId);
                        callback(null, result.insertedId);
                    });
    }
    
    internals.updateUser = function(userDetail,callback) {
        
        const users = internals.db.collection('users');
        const ObjectID = internals.ObjectID;
        //console.log(userDetail);
        users.findOneAndUpdate({ _id: new ObjectID(userDetail.id)},
                               { 
                                   firstname: userDetail.firstname,
                                   lastname: userDetail.lastname,
                                   occupation: userDetail.occupation,
                               }, 
                               {
                                   returnOriginal: false,
                                   upsert: true
                               },
                               (err,result) => {
                                                if (err) {
                                                    callback(Boom.internal('Internal MongoDB error', err));
                                                }   
                                                callback(null, result);
                                            });
    };
    server.route([
        {
            method: 'GET',
            path: '/user/{userId}',
            config: {
                 validate: {
                            headers: true,
                            params: {
                                userId: Joi.string().min(4).max(40).required(),
                            },
                            query: false
                        },
                handler: function(request, reply) {
                        internals.getUser(request.params.userId, (err,user) => {
                                                            if (err) { reply(Boom.notFound(err)); }
                                                            reply(null, user);
                                                        })
                     },
                description: 'Retrieve a user',
                tags: ['api']
            }
        },
        {
            method: 'DELETE',
            path: '/user/{userId}',
            config: {
                 validate: {
                            headers: true,
                            params: {
                                userId: Joi.string().min(4).max(40).required(),
                            },
                            query: false
                        },
                handler: function(request, reply) {
                           //  return reply('deleted '  + request.params.userId);
                    
                             internals.deleteUser(request.params.userId, (err,user) => {
                                                            if (err) { reply(Boom.notFound(err)); }
                                                            reply(null, user);
                                                        })
                         },
                description: 'Delete a user',
                tags: ['api']
            }
        },        
        {
            method: 'POST',
            path: '/user',
            config: {
                        validate: {
                            headers: true,
                            payload: {
                                firstname: Joi.string().min(4).max(40).required(),
                                lastname: Joi.string().min(4).max(40).required(),
                                occupation: Joi.string().min(4).max(40).required()
                            },
                            query: false
                        },
                         handler: function(request, reply) 
                                  {
                                      const userDetails = request.payload;
                                      /*const userDetails = {
                                                            firstname:'Tuan', 
                                                            lastname: 'Phan', 
                                                            occupation: 'Software engineer'
                                                          };*/
                                      //server.plugins['UserStore'].db = request.mongo.db;
                                      internals.createUser(userDetails, (err,user) => 
                                                              {
                                                                  if(err) {
                                                                       return reply(Boom.badRequest(err));
                                                                  }
                                                                  return reply(user);
                                                              })
                                  },
                         description: 'Create a user' ,
                         tags: ['api']
                    }
        },
        {
            method: 'PUT',
            path: '/user',
            config: {
                         handler: function(request, reply) 
                                  {
                                      const userDetails = request.payload;

                                      /*const userDetails = {
                                                            firstname:'Tuan', 
                                                            lastname: 'Phan', 
                                                            occupation: 'Software engineer'
                                                          };*/
                                      //server.plugins['UserStore'].db = request.mongo.db;
                                      internals.updateUser(userDetails, (err,user) => 
                                                              {
                                                                  if(err) {
                                                                       return reply(Boom.badRequest(err));
                                                                  }
                                                                  return reply(user);
                                                              })
                                  },
                         description: 'Update a user'                    
                    }
        }
    ]);
    server.expose({
                    getUser: internals.getUser,
                    createUser: internals.createUser,
                    deleteUser: internals.deleteUser,
                    updateUser: internals.updateUser
                 });
    return next();
}

exports._internals = internals;

exports.register.attributes = {
    name: 'UserStore'
};