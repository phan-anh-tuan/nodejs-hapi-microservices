'use strict';

const nconf = require('nconf'); //manage configuration in json file, see details at https://github.com/indexzero/nconf

const internals = {
    db: {},
    ObjectID: {}
};

exports.register = function(server, options, next) {
    server.dependency('hapi-mongodb', (_server, next) => {
                                            _server.log(['tasks', 'info'], 'tasks obtained db connection ');
                                            internals.db = _server.mongo.db;
                                            internals.ObjectID = _server.mongo.ObjectID;        
                                            next();
                                        });
    internals.getTasks = function(filter,callback) {
        
        const requests = internals.db.collection('tasks');
        const ObjectID = internals.ObjectID;
        let _filter = filter;
        if (typeof filter === 'function') {
            callback = filter; 
            _filter = {};
        }
        //requests.find(_filter).project({ comments: { $slice: 1 } }).toArray( 
        requests.find(_filter).toArray( 
                    (err,result) => {
                        if (err) {
                            callback(err);
                        }   
                        callback(null, result);
                    });
    };

    internals.createTask = function(taskDetail,callback) {
       
        const requests = internals.db.collection('tasks');
        let _taskDetail = Object.assign({},taskDetail, { submissionDate: Date.now()});
        requests.insertOne(_taskDetail, 
                            (err, result) => {
                                    if (err) {
                                        callback(err);
                                    }   

                                    callback(null, result.insertedId);
                            });
    };

    internals.closeTask = function(taskDetail,callback) {
       
        const requests = internals.db.collection('tasks');
        const ObjectID = internals.ObjectID;
        
        requests.findOneAndUpdate({ _id: new ObjectID(taskDetail._id)},
                                    { $set: { status: 'closed',
                                            completionDate: Date.now()}},
                                    { returnOriginal: false}, 
                                    (err, result) => { 
                                            if (err) {
                                                callback(err);
                                            }   
                                            callback(null, result);
                            });
    };

    server.expose({
                    createTask: internals.createTask,
                    closeTask: internals.closeTask,
                    getTasks: internals.getTasks
                 });
    return next();
}

exports._internals = internals;

exports.register.attributes = {
    name: 'TasksStore'
};