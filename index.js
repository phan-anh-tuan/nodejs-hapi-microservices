'use strict';       

const Notification = require('./lib/email-notification')
const Async = require('async')
const Server = require('./lib')
const schedule = require('node-schedule')


Server((err,server) => {
                           if (err) { throw err };
                           
                            const notification = new Notification(server);
                            schedule.scheduleJob('*/30 * * * * *', function(){
                               console.log('30 second scheduled task is executing!');
                                Async.series([  
                                           //     notification.putOverdueRequestsInQueue,
                                                notification.sendTaskCreationEmail
                                            ],
                                           (error, result) => { console.log('30 second scheduled task finished execution!'); });
                            });
                            schedule.scheduleJob('0 22 21 * * *', function(){
                                console.log('Daily Scheduled task is executing!');
                                Async.auto([  
                                                notification.putOverdueRequestsInQueue,
                                                notification.putUnattendedRequestsInQueue
                                                //notification.sendTaskCreationEmail
                                            ],
                                           (error, result) => { console.log('Daily scheduled task finished execution!'); });
                            });         
                           console.log('server is running at ' + server.info.uri);
                       }); 
