'use strict';
const Boom = require('boom');

exports.register = function(server, options, next) {
    
    
    server.dependency('hapi-mongodb', (server, next) => {
                                             server.log(['user-store', 'info'], 'user-store obtained db connection ');
                                         //    db = server.mongo.db;
    
            //console.log(server.plugins['hapi-mongodb']);
                                             //ObjectID = server.mongo.ObjectID;        
                                             next();
                                         });
    const getUser = function(userId,callback) {
        
        const users = server.plugins['UserStore'].db.collection('users');
        const ObjectID = server.plugins['UserStore'].ObjectID;
        users.findOne({ _id: new ObjectID(userId)}, 
                                           (err,result) => {
                                                            if (err) {
                                                                callback(Boom.internal('Internal MongoDB error', err));
                                                            }   
                                                            callback(null, result);
                                                        });
    };
    
    const deleteUser = function(userId,callback) {
        
        const users = server.plugins['UserStore'].db.collection('users');
        const ObjectID = server.plugins['UserStore'].ObjectID;
        users.findOneAndDelete({ _id: new ObjectID(userId)}, 
                                           (err,result) => {
                                                            if (err) {
                                                                callback(Boom.internal('Internal MongoDB error', err));
                                                            }   
                                                            callback(null, result);
                                                        });
    };
    
    const createUser = function(userDetail,callback) {
        /*console.log(server.plugins['greeting']);*/
        
        const users = server.plugins['UserStore'].db.collection('users');
        
        users.insertOne(userDetail, function(err, result) {
                        if (err) {
                            callback(Boom.internal('Internal MongoDB error', err));
                        }   
                        callback(null, result);
                    });
    }
    
    const updateUser = function(userDetail,callback) {
        
        const users = server.plugins['UserStore'].db.collection('users');
        const ObjectID = server.plugins['UserStore'].ObjectID;
        console.log(userDetail);
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
                handler: function(request, reply) {
                        getUser(request.params.userId, (err,user) => {
                                                            if (err) { reply(Boom.notFound(err)); }
                                                            reply(null, user);
                                                        })
                     },
                description: 'Retrieve a user'
            }
        },
        {
            method: 'DELETE',
            path: '/user/{userId}',
            config: {
                handler: function(request, reply) {
                           //  return reply('deleted '  + request.params.userId);
                    
                             deleteUser(request.params.userId, (err,user) => {
                                                            if (err) { reply(Boom.notFound(err)); }
                                                            reply(null, user);
                                                        })
                         },
                description: 'Delete a user'
            }
        },        
        {
            method: 'POST',
            path: '/user',
            config: {
                         handler: function(request, reply) 
                                  {
                                      //const userDetails = request.payload;
                                      const userDetails = {
                                                            firstname:'Tuan', 
                                                            lastname: 'Phan', 
                                                            occupation: 'Software engineer'
                                                          };
                                      //server.plugins['UserStore'].db = request.mongo.db;
                                      createUser(userDetails, (err,user) => 
                                                              {
                                                                  if(err) {
                                                                       return reply(Boom.badRequest(err));
                                                                  }
                                                                  return reply(user);
                                                              })
                                  },
                         description: 'Create a user'                    
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
                                      updateUser(userDetails, (err,user) => 
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
                    getUser: getUser,
                    createUser: createUser,
                    db: {},
                    ObjectID: {}
                 });
    return next();
}
exports.register.attributes = {
    name: 'UserStore'
};