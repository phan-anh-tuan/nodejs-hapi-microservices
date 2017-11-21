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
        path: '/swf/domain/create',
        config: {
            validate: {
                payload: {
                    domain_name: Joi.string().required(),
                    domain_description: Joi.string(),
                    retention_period_in_day: Joi.string().required()
                }
            },
            description: 'Create an SWF domain' , 
            tags: ['api']
        },
        handler: function (request, reply) {
            const username = 'tuan.phan'
            const password = 'P@ssword'
            handleSignIn(username, password, loginCallbackFactory({
                onSuccess: function (data) {
                    //handleSignOut()
                    //console.log(JSON.stringify(data));
                    const swf = new AWS.SWF({apiVersion: '2012-01-25', region: 'ap-southeast-2'});
                    var params = {
                        name: request.payload.domain_name, /* required */
                        workflowExecutionRetentionPeriodInDays: request.payload.retention_period_in_day, /* required */
                        description: request.payload.domain_description
                    };
                    swf.registerDomain(params, function(err, data) {
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

    server.route({
        method: 'POST',
        path: '/swf/workflow/create',
        config: {
            validate: {
                payload: {
                    domain: Joi.string().required(),
                    workflow_name: Joi.string().required(),
                    workflow_version: Joi.string().default('1'),
                    workflow_description: Joi.string().default('workflow description'),
                    defaultChildPolicy: Joi.string().valid(['TERMINATE','REQUEST_CANCEL', 'ABANDON']),
                    defaultExecutionStartToCloseTimeout: Joi.string().default((24*3600).toString()),
                    defaultLambdaRole: Joi.string().default('arn:aws:iam::181630946722:role/service-role/LambdaExecRole'),
                    defaultTaskList: Joi.object({
                        name: Joi.string().default('swf_defaultTaskList_name'),
                    }).required(),
                    defaultTaskPriority: Joi.string().default('1'),
                    defaultTaskStartToCloseTimeout: Joi.string().default('3600'),
                }
            },
            description: 'Create an SWF workflow type' , 
            tags: ['api']
        },
        handler: function (request, reply) { 
            const username = 'tuan.phan'
            const password = 'P@ssword'
            handleSignIn(username, password, loginCallbackFactory({
                onSuccess: function (data) {
                    //handleSignOut()
                    //console.log(JSON.stringify(data));
                    const swf = new AWS.SWF({apiVersion: '2012-01-25', region: 'ap-southeast-2'});
                    var params = {
                        domain: request.payload.domain,
                        name: request.payload.workflow_name,
                        version: request.payload.workflow_version,
                        defaultChildPolicy: request.payload.defaultChildPolicy,
                        defaultExecutionStartToCloseTimeout: request.payload.defaultExecutionStartToCloseTimeout,
                        defaultLambdaRole: request.payload.defaultLambdaRole,
                        defaultTaskList: request.payload.defaultTaskList,
                        defaultTaskPriority: request.payload.defaultTaskPriority,
                        defaultTaskStartToCloseTimeout: request.payload.defaultTaskStartToCloseTimeout,
                        description: request.payload.workflow_description
                      };
                      swf.registerWorkflowType(params, function(err, data) {
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
    name: 'aws-swf'
};
