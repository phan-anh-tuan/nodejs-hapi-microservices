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
const Async = require('async');
const internals = {
    db: {},
    ObjectID: {}
};

exports.register = function(_server, options, next) {
    _server.dependency(['auth','hapi-mongodb'], (server, next) => {
        server.log(['resource-request-store', 'info'], 'resource-request-store obtained db connection ');
        internals.db = server.mongo.db;
        internals.ObjectID = server.mongo.ObjectID;  
                                            
        internals.getRequests = function(filter,pagination, callback) {
            
            const requests = internals.db.collection('resource_requests');
            const ObjectID = internals.ObjectID;
            let _filter = filter;
            let _pagination = pagination;
            if (typeof filter === 'function') {
                callback = filter; 
                _filter = {};
                _pagination = {
                        page: 1,
                        limit: nconf.get('pages:resource-requests:page-limit')
                }
            } else if (typeof pagination === 'function') {
                callback = pagination
                _pagination = {
                        page: 1,
                        limit: nconf.get('pages:resource-requests:page-limit')
                }
            }
            
            //console.log(`plugins\resource-request-store ${JSON.stringify(_pagination)} ${JSON.stringify(_filter)}`);
            if (_pagination.limit > -1) {
                requests.find(_filter).skip((_pagination.page - 1)*_pagination.limit).limit(_pagination.limit).project({ updatedDate: 0, owner: 0 }).sort({ submissionDate: -1}).toArray( 
                            (err,result) => {
                                if (err) {
                                    callback(Boom.internal('Internal MongoDB error', err));
                                }   
                                callback(null, result);
                            });
            } else {
                requests.find(_filter).project({ updatedDate: 0, owner: 0 }).sort({ submissionDate: -1}).toArray( 
                            (err,result) => {
                                if (err) {
                                    callback(Boom.internal('Internal MongoDB error', err));
                                }   
                                callback(null, result);
                            });                
            }
        };

        internals.searchByTerm = function(document, callback) {
            const {term, user} = document
            const requests = internals.db.collection('resource_requests');
            const ObjectID = internals.ObjectID;
            const regex = term.split(' ').join('.*')
            let filter;
            if (user._id) {
                filter = { $and: [{'owner.id': new ObjectID(user._id)},{ $or : [{ accountName: {$regex: regex, $options: 'i'}}, {resourceType: {$regex: regex, $options: 'i'}}]}]}
            } else {
                filter = { $or : [{ accountName: {$regex: regex, $options: 'i'}}, {resourceType: {$regex: regex, $options: 'i'}}]}
            }
            //const filter = { $and: [{'owner.id': new ObjectID(request.auth.credentials.user._id)},{ $or : [{ accountName: {$regex: regex, $options: 'i'}}, {resourceType: {$regex: regex, $options: 'i'}}]}]}
            internals.getRequests(filter, {page:1, limit: -1}, (error,result) => {
                if (error) {
                    return callback(error)
                }
                const retVal = result.map((request) => {
                    return { label: `${request.accountName} - ${request.quantity} ${request.resourceType}`,
                             value: request._id}
                })
                callback(null,retVal);
            })
        };

        internals.getRequestByID = function(requestId,callback) {
            
            const requests = internals.db.collection('resource_requests');
            const ObjectID = internals.ObjectID;
            requests.findOne({ _id: new ObjectID(requestId)}, {fields: { updatedDate: 0, owner: 0 }} ,
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
            let _requestDetail = Object.assign({},requestDetail,{ submissionDate: (requestDetail.submissionDate) ? moment(requestDetail.submissionDate,'DD/MM/YYYY').valueOf() : Date.now() },
                                                                { updatedDate: Date.now() },
                                                                { owner:  requestDetail.owner }, // owner: {id,name,email}
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
            
            requests.findOneAndUpdate({ _id: new ObjectID(_requestDetail._id)},
                                    { 
                                        $push: { comments: { text: _requestDetail.text, createdDate: _requestDetail.createdDate }},
                                        $set: { updatedDate: Date.now() }
                                    },
                                    { returnOriginal: false}, 
                                (err, result) => { 
                                        if (err) {
                                            callback(Boom.internal('Internal MongoDB error', err));
                                        }   
                                        callback(null, result);
                                });
        };

        internals.closeRequestWithComment = function(payload,callback) {
        
            const requests = internals.db.collection('resource_requests');
            const ObjectID = internals.ObjectID;
            let _requestDetail = Object.assign({},payload, { createdDate: payload.createdDate || Date.now()});
            Async.auto({
                updateStatus: function(done){
                    requests.findOneAndUpdate({ _id: new ObjectID(_requestDetail._id)},
                                    { 
                                        $push: { comments: { text: _requestDetail.text, createdDate: _requestDetail.createdDate }},
                                        $set: { 
                                                updatedDate: Date.now(),
                                                status: _requestDetail.status 
                                        }
                                    },
                                    { returnOriginal: false},done);
                },
                updateFulfilmentDate: ['updateStatus', function(results,done){
                    requests.findOneAndUpdate({ _id: new ObjectID(_requestDetail._id), fulfilmentDate: null},
                                    { 
                                        $set: { 
                                            fulfilmentDate: Date.now(),
                                        }
                                    },
                                    { returnOriginal: false},done);
                }]
            }, (err, results) => {
                    if (err) { return callback(Boom.internal('Internal MongoDB error', err))}   
                    callback(null, results.updateStatus);
            });
        };

        internals.updateRequest = function(requestDetail,callback) {
            
            const requests = internals.db.collection('resource_requests');
            const ObjectID = internals.ObjectID;
            let requestBody = Object.assign({},requestDetail,   { submissionDate: (requestDetail.submissionDate) ? moment(requestDetail.submissionDate,'DD/MM/YYYY').valueOf() : Date.now() },
                                                                { updatedDate: Date.now() },
                                                                (requestDetail.tentativeStartDate) ? { tentativeStartDate : moment(requestDetail.tentativeStartDate,'DD/MM/YYYY').valueOf() } : {},
                                                                (requestDetail.fulfilmentDate) ? { fulfilmentDate : moment(requestDetail.fulfilmentDate,'DD/MM/YYYY').valueOf() } : {},
                                                                (!requestDetail.fulfilmentDate && (['close','cancel'].indexOf(requestDetail.status.toLowerCase()) !== -1)) ? { fulfilmentDate : moment().valueOf() } : {});
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

        internals.checkOwnership = function(condition, callback){
            const {documentId, userId} = condition;
            const ObjectID = internals.ObjectID;
            
            const filter = { $and: [ { 'owner.id': new ObjectID(userId)}, { _id: new ObjectID(documentId)}]}
            
            internals.getRequests(filter,{ page: 1, limit: -1}, (error,results) => {
                    if (error) {
                        return callback(error);
                    }

                    if (results.length === 0) {
                        return callback(Boom.unauthorized('Unauthorized access'));
                    }

                    callback(results);
            }) 
        }

        internals.dataCheck = function(condition, callback){
            const {submissionDate, tentativeStartDate, fulfilmentDate} = condition;
            const s_date = (submissionDate) ? moment(submissionDate,'DD/MM/YYYY').valueOf() : Date.now() 
            const ts_Date = (tentativeStartDate) ? moment(tentativeStartDate,'DD/MM/YYYY').valueOf() : Date.now() 
            const f_date = (fulfilmentDate) ? moment(fulfilmentDate,'DD/MM/YYYY').valueOf() : Date.now() 
            
            if (s_date <= ts_Date && ts_Date <= f_date) {
                return callback(null,true)
            } else {
                return callback(Boom.badData('submissionDate <= tentativeStartDate <= fulfilmentDate'));
            }
        }

        server.route([
            {
                method: 'GET',
                path: '/resource/request',
                config: {
                    auth: {
                        strategy: 'session',
                        scope: 'account'
                    },
                    validate: {
                                headers: true,
                                query: {
                                    year: Joi.number().optional(),
                                    page: Joi.number().optional(),
                                    limit: Joi.number().optional()
                                },
                    },
                    handler: function(request, reply) {
                            let filter = {};
                            const page = request.query.page ? request.query.page : 1;
                            const limit = request.query.limit? request.query.limit : nconf.get('pages:resource-requests:page-limit');
                            const ObjectID = internals.ObjectID;
                            if (request.query.year) {
                                filter = { $and: [ { 'owner.id': new ObjectID(request.auth.credentials.user._id)}, {submissionDate: { $gte : moment(`${request.query.year}-01-01`).valueOf()}}, {submissionDate: { $lte : moment(`${request.query.year}-12-31`).valueOf()}}]}
                            }
                             
                            internals.getRequests(filter,{page,limit},(err,r_request) => {
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
                path: '/resource/request/search',
                config: {
                    auth: {
                        strategy: 'session',
                        scope: 'account'
                    },
                    validate: {
                                headers: true,
                                query: {
                                    term: Joi.string().required()
                                },
                    },
                    handler: function(request, reply) {

                            internals.searchByTerm({ term: request.query.term,
                                                     user: request.auth.credentials.user},
                                                    (err,r_request) => {
                                                    if (err) { reply(Boom.notFound(err)); }
                                                    reply(null, r_request);
                                                })
                    },
                    description: 'Search for resource requests by term',
                    tags: ['api']
                }
            },
            {
                method: 'GET',
                path: '/resource/request/{requestId}',
                config: {
                    auth: {
                        strategy: 'session',
                        scope: 'account'
                    },
                    validate: {
                                headers: true,
                                params: {
                                    requestId: Joi.string().required(),
                                },
                                query: false
                    },
                    pre: [
                        {
                            assign: 'ownerCheck',
                            method: function (request, reply) {
                                internals.checkOwnership({ documentId: request.params.requestId, userId: request.auth.credentials.user._id},reply)                       
                            }
                        }
                    ],
                    description: 'Retrieve a resource request',
                    tags: ['api']
                },
                handler: function(request, reply) {
                        reply(request.pre.ownerCheck[0]);
                        /*
                        internals.getRequestByID(request.params.requestId, 
                                                (err,r_request) => {
                                                    if (err) { reply(Boom.notFound(err)); }
                                                    reply(null, r_request);
                                                })*/
                }
            },
            {
                method: 'DELETE',
                path: '/resource/request/{requestId}',
                config: {
                    auth: {
                        strategy: 'session',
                        scope: 'account'
                    },
                    validate: {
                            headers: true,
                            params: {
                                requestId: Joi.string().required(),
                            },
                            query: false
                    },
                    pre: [{
                        assign: 'ownerCheck',
                        method: function (request, reply) {
                            internals.checkOwnership({ documentId: request.params.requestId, userId: request.auth.credentials.user._id},reply)                       
                        }
                    }],
                    description: 'Delete a resource request',
                    tags: ['api']
                },
                handler: function(request, reply) {
                        internals.deleteRequest(request.params.requestId, 
                                            (err,r_request) => {
                                                if (err) { reply(Boom.notFound(err)); }
                                                reply(null, r_request);
                                            })
                }
            },        
            {
                method: 'POST',
                path: '/resource/request',
                config: {
                    auth: {
                        strategy: 'session',
                        scope: 'account'
                    },
                    validate: {
                        headers: true,
                        payload: {
                            accountName: Joi.string().required(),
                            resourceType: Joi.string().required(),
                            resourceRate: Joi.number().positive().required(),
                            quantity: Joi.number().positive().required(),
                            submissionDate: Joi.date().optional(),
                            tentativeStartDate: Joi.date().optional(),
                            fulfilmentDate: Joi.date().optional(),
                            status: Joi.string().required()
                        },
                        query: false
                    },
                    pre: [
                        {
                            assign: 'dataCheck',
                            method: function (request, reply) {
                                internals.dataCheck ( { submissionDate: request.payload.submissionDate,tentativeStartDate: request.payload.tentativeStartDate,fulfilmentDate: request.payload.fulfilmentDate} , reply)
                            }
                        }
                    ],
                    description: 'Create a resource request' ,
                    tags: ['api']
                },
                handler: function(request, reply) 
                                {
                                const user = request.auth.credentials.user;
                                const requestDetails = Object.assign({},request.payload,{ owner: { id: user._id, email: user.email, name: user.roles.account.name}});

                                internals.createRequest(requestDetails, 
                                                        (err,r_request) => {
                                                            if(err) {
                                                                return reply(Boom.badRequest(err));
                                                            }
                                                            
                                                            const emailOptions = {
                                                                subject: ' A new resource request',
                                                                to: {
                                                                    "name": requestDetails.owner.name,
                                                                    "address": requestDetails.owner.email
                                                                },
                                                                replyTo: {
                                                                    name: nconf.get('system:toAddress:name'),
                                                                    address: nconf.get('system:toAddress:address')
                                                                }
                                                            };
                                                            const template = 'new-resource-request';
                                                            const context = { request_url: `${nconf.get('web-client:base-url')}/resource/request/${r_request}`}
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
                                                        })
                                },
                 
            },



            {
                method: 'POST',
                path: '/resource/request/comment',
                config: {
                    auth: {
                        strategy: 'session',
                        scope: 'account'
                    },
                    validate: {
                        headers: true,
                        payload: {
                            _id: Joi.string().required(),
                            text: Joi.string().required(),
                        },
                        query: false
                    },
                    pre: [{
                        assign: 'ownerCheck',
                        method: function (request, reply) {
                            internals.checkOwnership({ documentId: request.payload._id, userId: request.auth.credentials.user._id},reply)                       
                        }
                    }],
                    description: 'Add a request comment' ,
                    tags: ['api']
                },
                handler: function(request, reply) {
                    const requestDetails = request.payload;
                    internals.addRequestComment(requestDetails, 
                                            (err,r_request) => {
                                                if(err) {
                                                    return reply(Boom.badRequest(err));
                                                }
                                                return reply(r_request);
                                            })
                }
            },
            {
                method: 'POST',
                path: '/resource/request/close',
                config: {
                    auth: {
                        strategy: 'session',
                        scope: 'account'
                    },
                    validate: {
                        headers: true,
                        payload: {
                            _id: Joi.string().required(),
                            text: Joi.string().allow(''),
                            status: Joi.string().required(),
                        },
                        query: false
                    },
                    pre: [
                        {
                            assign: 'ownerCheck',
                            method: function (request, reply) {
                                internals.checkOwnership({ documentId: request.payload._id, userId: request.auth.credentials.user._id},reply)                       
                            }
                        }
                    ],
                    description: 'Close a request with comment' ,
                    tags: ['api']
                },
                handler: function(request, reply){
                    const requestDetails = request.payload;
                    internals.closeRequestWithComment(requestDetails, 
                                            (err,r_request) => {
                                                if(err) {
                                                    return reply(Boom.badRequest(err));
                                                }
                                                return reply(r_request);
                                            })
                }
            },
            {
                method: 'PUT',
                path: '/resource/request',
                config: {
                    auth: {
                        strategy: 'session',
                        scope: 'account'
                    },
                    validate: {
                        headers: true,
                        payload: {
                            _id: Joi.string().required(),
                            accountName: Joi.string().required(),
                            resourceType: Joi.string().required(),
                            resourceRate: Joi.number().positive().required(),
                            quantity: Joi.number().positive().required(),
                            submissionDate: Joi.date(),
                            tentativeStartDate: Joi.date(),
                            fulfilmentDate: Joi.date(),
                            status: Joi.string().required()
                        },
                        query: false
                    },
                    pre: [{
                            assign: 'ownerCheck',
                            method: function (request, reply) {
                                internals.checkOwnership({ documentId: request.payload._id, userId: request.auth.credentials.user._id},reply)                       
                            }
                        },
                        {
                            assign: 'dataCheck',
                            method: function (request, reply) {
                                internals.dataCheck ( { submissionDate: request.payload.submissionDate,tentativeStartDate: request.payload.tentativeStartDate,fulfilmentDate: request.payload.fulfilmentDate} , reply)
                            }
                        }
                    ],
                    description: 'Update a resource request',
                    tags: ['api']
                },
                handler: function(request, reply) {
                    const requestDetails = request.payload;

                    internals.updateRequest(requestDetails, 
                                            (err,r_request) => {
                                                if(err) {
                                                    return reply(Boom.badRequest(err));
                                                }
                                                return reply(r_request);
                                            })
                }
            }
        ]);

        server.expose({
                        getRequests: internals.getRequests,
                        getRequestByID: internals.getRequestByID,
                        deleteRequest: internals.deleteRequest,
                        updateRequest: internals.updateRequest,
                        createRequest: internals.createRequest,
                        addRequestComment: internals.addRequestComment,
                        closeRequestWithComment: internals.closeRequestWithComment,
                        checkOwnership: internals.checkOwnership,
                        searchByTerm: internals.searchByTerm
                    });
        next();
    });
        
    return next();
}


exports._internals = internals;

exports.register.attributes = {
    name: 'ResourceRequestStore'
};