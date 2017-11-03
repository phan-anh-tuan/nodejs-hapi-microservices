'use strict';
//require('es6-promise').polyfill();
const Joi = require('joi');
const fetch = require('isomorphic-fetch')
exports.register = function (server, options, next) {

    server.route({
        method: 'POST',
        path: '/sns/receive',
        config: {
            description: 'Send a message to AWS SNS' ,
            tags: ['api']
        },
        handler: function (request, reply) {
            //console.log(JSON.stringify(request.headers))
            //console.log(JSON.stringify(request.payload))
            
            if (request.headers['x-amz-sns-message-type'] === 'SubscriptionConfirmation') {
                //https://sns.ap-southeast-2.amazonaws.com/?Action=ConfirmSubscription&TopicArn=arn:aws:sns:ap-southeast-2:181630946722:NTRR_HTTPEndpoint_Topic&Token=2336412f37fb687f5d51e6e241d59b69a62a729e3f7a7c8184d3d1d8e4d932c87a7860e2aca02498b7312f3a5a63ed22417bcb6d2ab8a9fef635cce5d68726a7d9bec3b7b113c28374763c50a829d197968851130402e8377a7ba3ad0e3151e3db605068525eea775a1e1cd9a6014dbb7057a47d4f1e290ebeb112f7fb1edfcc
                fetch(JSON.parse(request.payload).SubscribeURL)
                .then(function(response) {
                    if (response.status >= 400) {
                        throw new Error("Bad response from server");
                    }
                    return response.text()
                })
                .then(function(text){
                    console.log(text)
                })
                .catch(function(error) {
                    console.log('SNS-ENDPOINT ERROR ', error);
                });
            } else if (request.headers['x-amz-sns-message-type'] === 'Notification') {
                console.log('******************************************')
                console.log('*     RECEIVE MESSAGE FROM AWS SNS       *')
                console.log('******************************************')
                console.log('MessageId: ', JSON.parse(request.payload).MessageId) //this is necessary to handle message retry which happens if aws sns did not receive acknowledgment within predefined timeout
                console.log('Subject: ', JSON.parse(request.payload).Subject)
                console.log('Message: ', JSON.parse(request.payload).Message)
                //request.payload.Message
            }
            reply('ok');                       
        }
    });

    next();
};





exports.register.attributes = {
    name: 'aws-sns-endpoint'
};
