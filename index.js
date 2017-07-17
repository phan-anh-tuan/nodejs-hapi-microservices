'use strict';       

const Notification = require('./lib/email-notification')
const Async = require('async')
const Server = require('./lib')
const schedule = require('node-schedule')


Server((err,server) => {
                           if (err) { throw err };
                           const notification = new Notification(server);
                           var j = schedule.scheduleJob('*/30 * * * * *', function(){
                               console.log('Scheduled task is executing!');
                                Async.series([  
                                                notification.putOverdueRequestsInQueue,
                                                notification.sendTaskCreationEmail
                                            ],
                                           (error, result) => { console.log('Scheduled task finished execution!'); });
                            });
                           console.log('server is running at ' + server.info.uri);
                       }); 
