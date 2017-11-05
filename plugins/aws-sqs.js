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
        method: 'GET',
        path: '/sqs/list',
        config: {
            description: 'Get list of AWS SQS' ,
            tags: ['api']
        },
        handler: function (request, reply) {
            const username = 'tuan.phan'
            const password = 'P@ssword'
            handleSignIn(username, password, loginCallbackFactory({
                onSuccess: function (data) {
                    //handleSignOut()
                    //console.log(JSON.stringify(data));
                    
                    var sqs = new AWS.SQS({apiVersion: '2012-11-05', region: 'ap-southeast-2'});
                    
                    var params = {};
                    
                    sqs.listQueues(params, function(err, data) {
                      if (err) {
                        console.log("Error", err);
                      } else {
                        console.log("Success", data.QueueUrls);
                      }
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


    server.route({
        method: 'POST',
        path: '/sqs/send',
        config: {
            description: 'Send a message to a AWS SQS' ,
            tags: ['api']
        },
        handler: function (request, reply) {
            const username = 'tuan.phan'
            const password = 'P@ssword'
            handleSignIn(username, password, loginCallbackFactory({
                onSuccess: function (data) {
                    //console.log(JSON.stringify(data));
                    const sqs = new AWS.SQS({apiVersion: '2012-11-05', region: 'ap-southeast-2'});
                    
                    let params = {
                        DelaySeconds: 10,
                        MessageAttributes: {
                        "Title": {
                            DataType: "String",
                            StringValue: "The Whistler"
                        },
                        "Author": {
                            DataType: "String",
                            StringValue: "John Grisham"
                        },
                        "WeeksOn": {
                            DataType: "Number",
                            StringValue: "6"
                        }
                        },
                        MessageBody: "Information about current NY Times fiction bestseller for week of 12/11/2016.",
                        QueueUrl: "https://sqs.ap-southeast-2.amazonaws.com/181630946722/MyTestQueue"
                    };
                    
                    sqs.sendMessage(params, function(err, data) {
                    if (err) {
                        console.log("Error", err);
                    } else {
                        console.log("Success", data.MessageId);
                    }
     
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
    name: 'aws-sqs'
};
