'use strict';
const AWS = require('aws-sdk')
const Config = AWS.Config
const CognitoIdentityCredentials = AWS.CognitoIdentityCredentials
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const CognitoUserAttribute= AmazonCognitoIdentity.CognitoUserAttribute;
const AuthenticationDetails= AmazonCognitoIdentity.AuthenticationDetails;
const CognitoUser = AmazonCognitoIdentity.CognitoUser;
const AWSAuth = require('../lib/aws-auth')
const loginCallbackFactory = AWSAuth.loginCallbackFactory
const handleSignIn = AWSAuth.handleSignIn
const handleSignOut = AWSAuth.handleSignOut
const Joi = require('joi');
exports.register = function (server, options, next) {

    server.route({
        method: 'POST',
        path: '/sns/send',
        config: {
            validate: {
                payload: {
                    subject: Joi.string().required(),
                    message: Joi.string().required()
                }
            },
            description: 'Send a message to AWS SNS' ,
            tags: ['api']
        },
        handler: function (request, reply) {
            const username = 'tuan.phan'
            const password = 'P@ssword'
            handleSignIn(username, password, loginCallbackFactory({
                onSuccess: function (data) {
                    //console.log(JSON.stringify(data));
                    const sns = new AWS.SNS({apiVersion: '2010-03-31', region: 'ap-southeast-2'});
                    var params = {
                        Message: 'You are selected to win our lottery of 1 million',
                        Subject: 'Lottery winner',
                        TopicArn: 'arn:aws:sns:ap-southeast-2:181630946722:NTRR_HTTPEndpoint_Topic'
                      };
                      sns.publish(params, function(err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else     console.log(data);           // successful response
                        handleSignOut()
                      });

                },
                onFailure: function(error) {
                    console.log('error', error)
                }
            })) 
            reply('ok');                       
        }
    });

    next();
};





exports.register.attributes = {
    name: 'aws-sns'
};
