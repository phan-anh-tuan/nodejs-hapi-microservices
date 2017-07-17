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
const nconf = require('nconf'); //manage configuration in json file, see details at https://github.com/indexzero/nconf
const moment = require('moment')
const internals = {
    db: {},
    ObjectID: {}
};

exports.register = function(server, options, next) {
    server.dependency('hapi-mongodb', (_server, next) => {
                                            _server.log(['resource-request-store', 'info'], 'resource-request-store obtained db connection ');
                                            internals.db = _server.mongo.db;
                                            internals.ObjectID = _server.mongo.ObjectID;        
                                            next();
                                        });
    
    internals.getRequests = function(filter,callback) {
        
        const requests = internals.db.collection('resource_requests');
        const ObjectID = internals.ObjectID;
        let _filter = filter;
        if (typeof filter === 'function') {
            callback = filter; 
            _filter = {};
        }
        //console.log(`plugins/resource-request-store.js getRequest filter ${JSON.stringify(_filter)}`)
        requests.find(_filter).toArray( 
                    (err,result) => {
                        if (err) {
                            callback(Boom.internal('Internal MongoDB error', err));
                        }   
                        callback(null, result);
                    });
    };

    internals.getRequestByID = function(requestId,callback) {
        
        const requests = internals.db.collection('resource_requests');
        const ObjectID = internals.ObjectID;
        requests.findOne({ _id: new ObjectID(requestId)}, 
                            (err,result) => {
                                    if (err) {
                                        callback(Boom.internal('Internal MongoDB error', err));
                                    }   
                                    callback(null, result);
                            });
    };

    internals.deleteRequest = function(requestId,callback) {
        
        const requests = internals.db.collection('resource_requests');
        const ObjectID = internals.ObjectID;
        requests.findOneAndDelete({ _id: new ObjectID(requestId)}, 
                                    (err,result) => {
                                        if (err) {
                                            callback(Boom.internal('Internal MongoDB error', err));
                                        }   
                                        callback(null, result);
                                    });
    };

    internals.createRequest = function(requestDetail,callback) {
       
        const requests = internals.db.collection('resource_requests');
        let _requestDetail = Object.assign({},requestDetail, { submissionDate: (requestDetail.submissionDate) ? moment(requestDetail.submissionDate,'DD/MM/YYYY').valueOf() : Date.now() },
                                                               (requestDetail.tentativeStartDate) ? { tentativeStartDate : moment(requestDetail.tentativeStartDate,'DD/MM/YYYY').valueOf() } : {},
                                                               (requestDetail.fulfilmentDate) ? { fulfilmentDate : moment(requestDetail.fulfilmentDate,'DD/MM/YYYY').valueOf() } : {}
                                                            );
        requests.insertOne(_requestDetail, 
                            (err, result) => {
                                    if (err) {
                                        callback(Boom.internal('Internal MongoDB error', err));
                                    }   
                                    callback(null, result.insertedId);
                            });
    };

    internals.addRequestComment = function(payload,callback) {
       
        const requests = internals.db.collection('resource_requests');
        const ObjectID = internals.ObjectID;
        let _requestDetail = Object.assign({},payload, { createdDate: payload.createdDate || Date.now()});
        /*
            db.resource_requests.findAndModify(
            {
                query: { _id: ObjectId("5961af85701e0855986e7529")},
                update: { $push: { comments: { text: "comment #5", createdDate: Date()}}}
            })
        */
        requests.findOneAndUpdate({ _id: new ObjectID(_requestDetail._id)},
                                  { $push: { comments: { text: _requestDetail.text, createdDate: _requestDetail.createdDate }}},
                                  { returnOriginal: false}, 
                            (err, result) => { 
                                    if (err) {
                                        callback(Boom.internal('Internal MongoDB error', err));
                                    }   
                                    callback(null, result);
                            });
    };


    internals.updateRequest = function(requestDetail,callback) {
        
        const requests = internals.db.collection('resource_requests');
        const ObjectID = internals.ObjectID;
        let requestBody = Object.assign({},requestDetail, { submissionDate: (requestDetail.submissionDate) ? moment(requestDetail.submissionDate,'DD/MM/YYYY').valueOf() : Date.now() },
                                                               (requestDetail.tentativeStartDate) ? { tentativeStartDate : moment(requestDetail.tentativeStartDate,'DD/MM/YYYY').valueOf() } : {},
                                                               (requestDetail.fulfilmentDate) ? { fulfilmentDate : moment(requestDetail.fulfilmentDate,'DD/MM/YYYY').valueOf() } : {}
                                                            );
        delete requestBody._id
        requests.findOneAndUpdate(
                                { _id: new ObjectID(requestDetail._id)},
                                { 
                                   $set: requestBody
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
            path: '/resource/request',
            config: {
                validate: {
                            headers: true,
                            query: false
                },
                handler: function(request, reply) {
                        let filter = {}; //temporarily bypass input
                        internals.getRequests((err,r_request) => {
                                                if (err) { reply(Boom.notFound(err)); }
                                                reply(null, r_request);
                                              })
                },
                description: 'Retrieve a list of resource requests',
                tags: ['api']
            }
        },
        {
            method: 'GET',
            path: '/resource/request/{requestId}',
            config: {
                validate: {
                            headers: true,
                            params: {
                                requestId: Joi.string().required(),
                            },
                            query: false
                },
                handler: function(request, reply) {
                        internals.getRequestByID(request.params.requestId, 
                                                (err,r_request) => {
                                                    if (err) { reply(Boom.notFound(err)); }
                                                    reply(null, r_request);
                                                })
                },
                description: 'Retrieve a resource request',
                tags: ['api']
            }
        },
        {
            method: 'DELETE',
            path: '/resource/request/{requestId}',
            config: {
                validate: {
                        headers: true,
                        params: {
                            requestId: Joi.string().required(),
                        },
                        query: false
                },
                handler: function(request, reply) {
                        internals.deleteRequest(request.params.requestId, 
                                            (err,r_request) => {
                                                if (err) { reply(Boom.notFound(err)); }
                                                reply(null, r_request);
                                            })
                },
                description: 'Delete a resource request',
                tags: ['api']
            }
        },        
        {
            method: 'POST',
            path: '/resource/request',
            config: {
                validate: {
                    headers: true,
                    payload: {
                        accountName: Joi.string().required(),
                        resourceType: Joi.string().required(),
                        resourceRate: Joi.number().required(),
                        quantity: Joi.number().required(),
                        submissionDate: Joi.date().optional(),
                        tentativeStartDate: Joi.date().optional(),
                        fulfilmentDate: Joi.date().optional(),
                        status: Joi.string().required()
                    },
                    query: false
                },
                handler: function(request, reply) 
                            {
                            const requestDetails = request.payload;
                            internals.createRequest(requestDetails, 
                                                    (err,r_request) => {
                                                        if(err) {
                                                            return reply(Boom.badRequest(err));
                                                        }
                                                        
                                                        const emailOptions = {
                                                            subject: ' A new resource request',
                                                            to: nconf.get('system:toAddress'),
                                                            replyTo: {
                                                                name: nconf.get('system:toAddress:name'),
                                                                address: nconf.get('system:toAddress:address')
                                                            }
                                                        };
                                                        const template = 'new-resource-request';
                                                        const context = { request_url: `http://${nconf.get('web-server:host')}:${nconf.get('web-server:port')}/resource/request/${r_request}`}
                                                        const taskDetail = {
                                                            type: 'email',
                                                            data: {
                                                                    emailOptions: emailOptions,
                                                                    template: template,
                                                                    context: context
                                                                },
                                                            status: 'open'
                                                        };
                                                        server.plugins['TasksStore'].createTask(taskDetail,(_err) => {
                                                            if (_err) {
                                                                reply(Boom.internal('Error creating notification email task', _err));
                                                            }
                                                            return reply(r_request);
                                                        })
                                                        /*
                                                        const mailer = server.plugins.mailer;
                                                        mailer.sendEmail(emailOptions, template, context, (_err, info) => {
                                                            if (_err) {
                                                                callback(Boom.internal('Error sending notification email error', _err));
                                                            }
                                                            return reply(r_request);
                                                        });
                                                        */
                                                    })
                            },
                description: 'Create a resource request' ,
                tags: ['api']
            }
        },
        {
            method: 'POST',
            path: '/resource/request/comment',
            config: {
                validate: {
                    headers: true,
                    payload: {
                        _id: Joi.string().required(),
                        text: Joi.string().required(),
                    },
                    query: false
                },
                handler: function(request, reply) 
                            {
                            const requestDetails = request.payload;
                            internals.addRequestComment(requestDetails, 
                                                    (err,r_request) => {
                                                        if(err) {
                                                            return reply(Boom.badRequest(err));
                                                        }
                                                        return reply(r_request);
                                                    })
                            },
                description: 'Add a request comment' ,
                tags: ['api']
            }
        },
        {
            method: 'PUT',
            path: '/resource/request',
            config: {
                validate: {
                    headers: true,
                    payload: {
                        _id: Joi.string().required(),
                        accountName: Joi.string().required(),
                        resourceType: Joi.string().required(),
                        resourceRate: Joi.number().required(),
                        quantity: Joi.number().required(),
                        submissionDate: Joi.date(),
                        tentativeStartDate: Joi.date(),
                        fulfilmentDate: Joi.date(),
                        status: Joi.string().required()
                    },
                    query: false
                },
                handler: function(request, reply) 
                        {
                            const requestDetails = request.payload;

                            internals.updateRequest(requestDetails, 
                                                    (err,r_request) => {
                                                        if(err) {
                                                            return reply(Boom.badRequest(err));
                                                        }
                                                        return reply(r_request);
                                                    })
                        },
                description: 'Update a resource request',
                tags: ['api']
            }
        }
    ]);

    server.expose({
                    getRequests: internals.getRequests,
                    getRequestByID: internals.getRequestByID,
                    deleteRequest: internals.deleteRequest,
                    updateRequest: internals.updateRequest,
                    createRequest: internals.createRequest,
                    addRequestComment: internals.addRequestComment
                 });
    return next();
}


exports._internals = internals;

exports.register.attributes = {
    name: 'ResourceRequestStore'
};