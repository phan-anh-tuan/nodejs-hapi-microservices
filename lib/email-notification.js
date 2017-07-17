'use strict'
const nconf = require('nconf'); //manage configuration in json file, see details at https://github.com/indexzero/nconf
var moment = require('moment')

module.exports = function Notification(server) {
    this._server = server,

    this.putOverdueRequestsInQueue =  (callback) => {
        const submissionDate = moment().subtract(nconf.get('resource-request:overdue-duration'),'days');
        //moment(submissionDate)
        const filter = {
            status: 'Open',
            submissionDate: { $lte: submissionDate.valueOf() }
        }
        this._server.plugins['ResourceRequestStore'].getRequests(filter,(err, requests) => {
            if (err) { callback(err) }
            const emailOptions = {
                                    subject: ' An overdue  resource request',
                                    to: nconf.get('system:toAddress'),
                                    replyTo: {
                                        name: nconf.get('system:toAddress:name'),
                                        address: nconf.get('system:toAddress:address')
                                    }
                                };
            const template = 'overdue-resource-request';
            requests.forEach( (request) => {
                const context = { request_url: `http://${nconf.get('web-server:host')}:${nconf.get('web-server:port')}/resource/request/${request._id}`}
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
                console.log(`index.js prepare sending email ${emailOptions}`);
                mailer.sendEmail(emailOptions, template, context, (_err) => {
                    if (_err) {
                        console.log(`index.js Error sending email ${emailOptions}`);
                        callback(_err);
                    }
                    this._server.plugins['TasksStore'].closeTask({_id: task._id}, (__err) => {
                        if (__err) {
                            console.log(`index.js Error sending email ${emailOptions}`);
                            callback(__err);
                        }
                        console.log(`index.js succeed in sending email ${emailOptions}`);
                    })
                });
            });
            callback();
        })
    }
}
