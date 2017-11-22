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

const internals = {
    domain: 'SWFSampleDomain',
    workflow_id: 'swf-sns-workflow-id',
    run_id: '',
    activity_publish_sns_message: 'activity_publish_sns_message',
    activity_list: 'list-of-activities',
    activity_id: 'swf-sns-activity-id',
    myTaskSet: new Set()
};

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

    server.route({
        method: 'POST',
        path: '/swf/workflow/start',
        config: {
            validate: {
                payload: {
                    domain: Joi.string().default(internals.domain).required(),
                    workflow_id: Joi.string().default(internals.workflow_id).required(),
                    workflow_type: Joi.object({
                        name: Joi.string().default('swf-sns-workflow'),
                        version: Joi.string().default('1')
                    }).required(),
                    
                }
            },
            description: 'Start workflow execution' , 
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
                        domain: request.payload.domain, /* required */
                        workflowId: request.payload.workflow_id, /* required */
                        workflowType: request.payload.workflow_type
                      };
                      swf.startWorkflowExecution(params, function(err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else     {
                            console.log('******************************')
                            console.log('** Start workflow Execution **')
                            console.log('******************************')
                            console.log(data);           // successful response
                            internals.run_id = data.runId
                            //startTime
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
        path: '/swf/workflow/pollForDecisionTask',
        config: {
            validate: {
                payload: {
                    domain: Joi.string().default(internals.domain).required(),
                    task_list: Joi.object({
                        name: Joi.string().default('swf_defaultTaskList_name')
                    }).required(),
                    identity: Joi.string().default(internals.workflow_id)
                }
            },
            description: 'pollForDecisionTask' , 
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
                        domain: request.payload.domain, /* required */
                        taskList: request.payload.task_list,
                        identity: request.payload.identity,
                        //reverseOrder: true
                      };
                      swf.pollForDecisionTask(params, function(err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else 
                        eventProcessing: {         // successful response
                            var myTaskSet = internals.myTaskSet;
                            //internals.last_decision_task_startedEventId = data.startedEventId
                            console.log('*********************')
                            console.log('*** Decision Task ***')
                            console.log('*********************')
                            console.log(data)
                            if (data.events) {
                                 
                                    for(var i=0; i < data.events.length; i++)
                                    {
                                        var ele = data.events[i]
                                        console.log(`Event ID: ${ele.eventId}`)
                                        console.log(`EventType: ${ele.eventType}`)
                                        console.log(`eventTimestamp: ${ele.eventTimestamp}`)
                                        console.log(`bypass: ${ele.eventId < data.previousStartedEventId + 1}`)
                                        if (i === data.events.length - 1) {
                                            // not all scheduled activity tasks have completed, continue waiting
                                            params = {
                                                taskToken: data.taskToken, /* required */
                                                executionContext: 'sample execution context'
                                            };
                                            swf.respondDecisionTaskCompleted(params, function(err, data) {
                                                if (err) console.log(err, err.stack); // an error occurred
                                                else     console.log(data);           // successful response
                                            });
                                        }
                                        if (ele.eventId < data.previousStartedEventId + 1) continue;
                                        switch (ele.eventType) {
                                            case 'DecisionTaskCompleted':
                                                if (ele.decisionTaskCompletedEventAttributes) console.log(`decisionTaskCompletedEventAttributes: ${JSON.stringify(ele.decisionTaskCompletedEventAttributes)}`)
                                                break;
                                            case 'DecisionTaskStarted':
                                                if (ele.decisionTaskStartedEventAttributes) console.log(`decisionTaskStartedEventAttributes: ${JSON.stringify(ele.decisionTaskStartedEventAttributes)}`)
                                                break;
                                            case 'DecisionTaskScheduled':
                                                if (ele.decisionTaskScheduledEventAttributes) console.log(`decisionTaskScheduledEventAttributes: ${JSON.stringify(ele.decisionTaskScheduledEventAttributes)}`)
                                                break;
                                            case 'WorkflowExecutionStarted':
                                                if (ele.workflowExecutionStartedEventAttributes) console.log(`workflowExecutionStartedEventAttributes: ${JSON.stringify(ele.workflowExecutionStartedEventAttributes)}`)
                                                params = {
                                                    taskToken: data.taskToken, /* required */
                                                    decisions: [
                                                        {
                                                            decisionType: 'ScheduleActivityTask', /* required */
                                                            scheduleActivityTaskDecisionAttributes: {
                                                                activityId: 'publish-sns-message-1', /* required */
                                                                activityType: { /* required */
                                                                    name: internals.activity_publish_sns_message, /* required */
                                                                    version: '1' /* required */
                                                                },
                                                                control: 'publish-sns-message-control',
                                                                heartbeatTimeout: 'NONE',
                                                                input: 'task number 1',
                                                                scheduleToCloseTimeout: 'NONE',
                                                                scheduleToStartTimeout: 'NONE',
                                                                startToCloseTimeout: 'NONE',
                                                                taskList: {
                                                                    name: internals.activity_list /* required */
                                                                },
                                                                taskPriority: '1'
                                                            },
                                                        },
                                                        {
                                                            decisionType: 'ScheduleActivityTask', /* required */
                                                            scheduleActivityTaskDecisionAttributes: {
                                                                activityId: 'publish-sns-message-2', /* required */
                                                                activityType: { /* required */
                                                                    name: internals.activity_publish_sns_message, /* required */
                                                                    version: '1' /* required */
                                                                },
                                                                control: 'publish-sns-message-control',
                                                                heartbeatTimeout: 'NONE',
                                                                input: 'task number 2',
                                                                scheduleToCloseTimeout: 'NONE',
                                                                scheduleToStartTimeout: 'NONE',
                                                                startToCloseTimeout: 'NONE',
                                                                taskList: {
                                                                    name: internals.activity_list /* required */
                                                                },
                                                                taskPriority: '1'
                                                            },
                                                        }
                                                    ],
                                                    executionContext: 'sample execution context'
                                                };
                                                swf.respondDecisionTaskCompleted(params, function(err, data) {
                                                    if (err) console.log(err, err.stack); // an error occurred
                                                    else     {
                                                        console.log('****************************')
                                                        console.log('** Schedule an Activity ****')
                                                        console.log('****************************')
                                                        console.log(data);           // successful response
                                                    }
                                                });
                                                break eventProcessing;
                                                //break;
                                            case 'ActivityTaskScheduled':
                                                if (ele.activityTaskScheduledEventAttributes) console.log(`activityTaskScheduledEventAttributes: ${JSON.stringify(ele.activityTaskScheduledEventAttributes)}`)
                                                myTaskSet.add(ele.eventId)
                                                console.log(myTaskSet)
                                                break;
                                            case 'ActivityTaskStarted':
                                                if (ele.activityTaskStartedEventAttributes) console.log(`activityTaskStartedEventAttributes: ${JSON.stringify(ele.activityTaskStartedEventAttributes)}`)
                                                break;
                                            case 'ActivityTaskCompleted':
                                                if (ele.activityTaskCompletedEventAttributes) console.log(`activityTaskCompletedEventAttributes: ${JSON.stringify(ele.activityTaskCompletedEventAttributes)}`)
                                                if (myTaskSet.has(ele.activityTaskCompletedEventAttributes.scheduledEventId)) myTaskSet.delete(ele.activityTaskCompletedEventAttributes.scheduledEventId)
                                                console.log(myTaskSet)
                                                if (myTaskSet.size === 0) {
                                                    // All scheduled activity task has completed
                                                    // Let's move to next state and schedule new task
                                                    params = {
                                                        taskToken: data.taskToken, /* required */
                                                        decisions: [
                                                            {
                                                                decisionType: 'CompleteWorkflowExecution', /* required */
                                                                completeWorkflowExecutionDecisionAttributes: {
                                                                result: 'Complete Workflow Execution'
                                                                }
                                                            },
                                                        ],
                                                        executionContext: 'sample execution context'
                                                    };
                                                    swf.respondDecisionTaskCompleted(params, function(err, data) {
                                                        if (err) console.log(err, err.stack); // an error occurred
                                                        else     console.log(data);           // successful response
                                                    });
                                                    break eventProcessing;
                                                }
                                                break;
                                            case 'NEVER HAPPENDED':    
                                                params = {
                                                    domain: request.payload.domain, /* required */
                                                    startTimeFilter: { /* required */
                                                    oldestDate: new Date('Tue Nov 21 2017'), /* required */
                                                    },
                                                    executionFilter: {
                                                    workflowId: internals.workflow_id /* required */
                                                    },
                                                };
                                                swf.listOpenWorkflowExecutions(params, function(err, data) {
                                                    if (err) console.log(err, err.stack); // an error occurred
                                                    else     {
                                                        console.log('****************************************')
                                                        console.log('** List of currently running workflow **')
                                                        console.log('****************************************')
                                                        console.log(JSON.stringify(data));           // successful response
                                                    }
                                                });

                                                params = {
                                                    domain: request.payload.domain, /* required */
                                                    workflowId: internals.workflow_id, /* required */
                                                    runId: internals.run_id
                                                };
                                                swf.requestCancelWorkflowExecution(params, function(err, data) {
                                                    if (err) console.log(err, err.stack); // an error occurred
                                                    else     console.log(JSON.stringify(data));           // successful response
                                                });
                                                break;
                                        }
                                    }
                                
                                
                            }                            
                        }
                        handleSignOut();
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
        method: 'GET',
        path: '/swf/workflow/listOpenWorkflowExecutions',
        config: {
            validate: {
                query: {
                    domain: Joi.string().default(internals.domain).required()
                }
            },
            description: 'list open workflow execution' , 
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

                    const params = {
                        domain: request.query.domain, /* required */
                        startTimeFilter: { /* required */
                          oldestDate: new Date('Tue Nov 21 2017'), /* required */
                        },
                        executionFilter: {
                          workflowId: internals.workflow_id /* required */
                        },
                    };
                    swf.listOpenWorkflowExecutions(params, function(err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else     {
                            console.log('****************************************')
                            console.log('** List of currently running workflow **')
                            console.log('****************************************')
                            console.log(JSON.stringify(data));           // successful response
                        }
                    });
                    handleSignOut();
                },
                onFailure: function(error) {
                    console.log('error', error)
                }
            })) 
            reply('ok');                       
        }
    });


    server.route({
        method: 'DELETE',
        path: '/swf/workflow/requestCancelWorkflowExecution',
        config: {
            validate: {
                query: {
                    domain: Joi.string().default(internals.domain).required()
                }
            },
            description: 'list open workflow execution' , 
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

                    const params = {
                        domain: request.query.domain, /* required */
                        workflowId: internals.workflow_id, /* required */
                        runId: internals.run_id
                    };
                    console.log(params)

                    swf.requestCancelWorkflowExecution(params, function(err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else     console.log(JSON.stringify(data));           // successful response
                    });

                    handleSignOut();
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
        path: '/swf/activity/register',
        config: {
            validate: {
                payload: {
                    domain: Joi.string().default(internals.domain).required(),
                    activity_type_name: Joi.string().default(internals.activity_publish_sns_message).required(),
                    activity_type_version: Joi.string().default('1').required(),
                    activity_type_description: Joi.string().default('activity description')
                }
            },
            description: 'Register an SWF activity type' , 
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
                        domain: request.payload.domain, /* required */
                        name: request.payload.activity_type_name, /* required */
                        version: request.payload.activity_type_version, /* required */
                        description: request.payload.activity_type_description
                      };
                      swf.registerActivityType(params, function(err, data) {
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
        path: '/swf/activity/pollForActivityTask',
        config: {
            validate: {
                payload: {
                    domain: Joi.string().default(internals.domain).required(),
                    task_list: Joi.object({
                        name: Joi.string().default(internals.activity_list)
                    }).required(),
                    identity: Joi.string().default(internals.activity_id)
                }
            },
            description: 'Start workflow execution' , 
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
                        domain: request.payload.domain, /* required */
                        taskList: request.payload.task_list,
                        identity: request.payload.identity
                      };
                      swf.pollForActivityTask(params, function(err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else     {
                            console.log('****************************************')
                            console.log('** Activity Task Attribute **')
                            console.log('****************************************')
                            console.log(data);           // successful response
                            switch (data.activityType.name) {
                                case internals.activity_publish_sns_message:
                                    console.log(`.......sending sns message ${data.input}`)
                                    params = {
                                        taskToken: data.taskToken, /* required */
                                        result: 'Message sent to sns'
                                    };
                                    swf.respondActivityTaskCompleted(params, function(err, data) {
                                        if (err) console.log(err, err.stack); // an error occurred
                                        else     {
                                            console.log('**********************************')
                                            console.log('** respondActivityTaskCompleted **')
                                            console.log('**********************************')
                                            console.log(data);           // successful response
                                        }
                                    });
                                    break;
                            }
                        }
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

exports._internals = internals;

exports.register.attributes = {
    name: 'aws-swf'
};
