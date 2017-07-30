'use strict'
const nconf = require('nconf'); //manage configuration in json file, see details at https://github.com/indexzero/nconf
var moment = require('moment')

module.exports = function Notification(server) {
    this._server = server,

    this.putOverdueRequestsInQueue =  (callback) => {
        const submissionDate = moment().subtract(nconf.get('pages:resource-requests:overdue-duration'),'days');
        const filter = {
            status: 'Open',
            submissionDate: { $lte: submissionDate.valueOf() }
        }
        this._server.plugins['ResourceRequestStore'].getRequests(filter,{  page: 1, limit: -1},(err, requests) => {
            if (err) { callback(err) }
           
            requests.forEach( (request) => {
                console.log(`email-notification request overdue: ${JSON.stringify(request)}`)
                const emailOptions = {
                                    subject: ' An overdue  resource request',
                                    to: request.owner ? request.owner.email : nconf.get('system:toAddress'),
                                    replyTo: {
                                        name: nconf.get('system:toAddress:name'),
                                        address: nconf.get('system:toAddress:address')
                                    }
                                };
                const template = 'overdue-resource-request';
                const context = { request_url: `${nconf.get('web-server:protocol')}${nconf.get('web-server:host')}:${nconf.get('web-server:port')}/resource/request/${request._id}`}
                const taskDetail = {
                    type: 'email',
                    data: {
                            emailOptions: emailOptions,
                            template: template,
                            context: context
                        },
                    status: 'open'
                };

                this._server.plugins['TasksStore'].createTask(taskDetail,(_err) => {
                    if (_err) {
                        callback(_err);
                    }
                })

            });
            callback();
        })
    }

    this.putUnattendedRequestsInQueue =  (callback) => {
        const updatedDate = moment().subtract(nconf.get('pages:resource-requests:unattended-duration'),'days');
        const filter = {
            status: 'Open',
            updatedDate: { $lte: updatedDate.valueOf() }
        }
        this._server.plugins['ResourceRequestStore'].getRequests(filter,{  page: 1, limit: -1},(err, requests) => {
            if (err) { callback(err) }
            
            requests.forEach( (request) => {
                const emailOptions = {
                                    subject: ' An Unattended  resource request',
                                    to: request.owner ? request.owner.email : nconf.get('system:toAddress'),
                                    replyTo: {
                                        name: nconf.get('system:toAddress:name'),
                                        address: nconf.get('system:toAddress:address')
                                    }
                                };
                const template = 'unattended-resource-request';
                const context = { request_url: `${nconf.get('web-server:protocol')}${nconf.get('web-server:host')}:${nconf.get('web-server:port')}/resource/request/${request._id}`}
                const taskDetail = {
                    type: 'email',
                    data: {
                            emailOptions: emailOptions,
                            template: template,
                            context: context
                        },
                    status: 'open'
                };

                this._server.plugins['TasksStore'].createTask(taskDetail,(_err) => {
                    if (_err) {
                        callback(_err);
                    }
                })

            });
            callback();
        })
    }

    this.sendTaskCreationEmail =  (callback) => {
        const filter = {
            status: 'open',
            type: 'email'
        }
        this._server.plugins['TasksStore'].getTasks(filter,(err, tasks) => {
            if (err) { callback(err) }
            const mailer = this._server.plugins.mailer;
            tasks.forEach((task) => {
                const {emailOptions, template, context} = task.data;
                mailer.sendEmail(emailOptions, template, context, (_err) => {
                    if (_err) {
                        console.log(`email-notification error sending email ${emailOptions}`);
                        callback(_err);
                    }
                    this._server.plugins['TasksStore'].closeTask({_id: task._id}, (__err) => {
                        if (__err) {
                            callback(__err);
                        }
                        console.log(`email-notification succeed in sending email ${emailOptions}`);
                    })
                });
            });
            callback();
        })
    }
}
