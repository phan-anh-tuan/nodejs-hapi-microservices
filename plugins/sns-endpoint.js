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
        path: '/sns/receive',
        config: {
            description: 'Send a message to AWS SNS' ,
            tags: ['api']
        },
        handler: function (request, reply) {
            console.log(JSON.stringify(request.headers))
            console.log(JSON.stringify(request.payload))
            reply('ok');                       
        }
    });

    next();
};





exports.register.attributes = {
    name: 'aws-sns-endpoint'
};
