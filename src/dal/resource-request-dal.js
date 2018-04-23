const nconf = require('nconf'); //manage configuration in json file, see details at https://github.com/indexzero/nconf
const Boom = require('boom');
const cached = new Map();

module.exports = function(db,ObjectID) {
    if (cached.has('dal')) {
        return cached.get('dal')
    }
    const internals = {
        db: db,
        ObjectID: ObjectID    
    };

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
        //console.log('*****internals.createRequest*****', _requestDetail)
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
    
    cached.set('dal',internals);
    
    return cached.get('dal');
}

                                    
