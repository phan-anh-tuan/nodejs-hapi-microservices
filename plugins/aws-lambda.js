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
const async = require('async') 
const util = require('util')
const gm = require('gm').subClass({imageMagick: true})
const MAX_WIDTH = 100
const MAX_HEIGHT = 100
const s3= new AWS.S3({region: 'ap-southeast-2'})

exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/lambda/s3',
        config: {
            description: 'Process S3 ObjectCreated:Put event' ,
            tags: ['api']
        },
        handler: function (request, reply) {
            const username = 'tuan.phan'
            const password = 'P@ssword'
            handleSignIn(username, password, loginCallbackFactory({
                onSuccess: function (data) {
                    const event = {  
                        Records:[  
                           {  
                              eventVersion:"2.0",
                              eventSource:"aws:s3",
                              awsRegion:"ap-southeast-2",
                              eventTime:"1970-01-01T00:00:00.000Z",
                              eventName:"ObjectCreated:Put",
                              userIdentity:{  
                                 principalId:"arn:aws:iam::181630946722:user/tuan.phan"
                              },
                              requestParameters:{  
                                 sourceIPAddress:"127.0.0.1"
                              },
                              responseElements:{  
                                 "x-amz-request-id":"C3D13FE58DE4C810",
                                 "x-amz-id-2":"FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpD"
                              },
                              s3:{  
                                 s3SchemaVersion:"1.0",
                                 configurationId:"testConfigRule",
                                 bucket:{  
                                    name:"ntrr",
                                    ownerIdentity:{  
                                       principalId:"arn:aws:iam::181630946722:user/tuan.phan"
                                    },
                                    arn:"arn:aws:s3:::ntrr"
                                 },
                                 object:{  
                                    key:"Happy-face-laughing-smiley-face-clip-art-free-clipart-images.jpeg",
                                    size:20584,
                                    eTag:"fb94ecf0a9973eb02b5e0977130e23b3",
                                    versionId:"096fKKXTRTtl3on89fVO.nfljtsv6qko"
                                 }
                              }
                           }
                        ]
                    }

                    console.log('Reading options from event:\n',util.inspect(event,{ depth: 5}))
                    const srcBucket = event.Records[0].s3.bucket.name;
                    const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g,' '))
                    const dstBucket = srcBucket + 'resized'
                    const dstKey = 'resized-' + srcKey
                    if (srcBucket === dstBucket) {
                        callback('Source and destination buckets are the same.')
                        return;
                    }
                
                    //infer the image type
                    const typeMatch = srcKey.match(/\.([^.]*)$/)
                    if (!typeMatch) {
                        callback('Could not determine image type')
                        return;
                    }
                
                    const imageType = typeMatch[1]
                    if (imageType !== 'jpg' && imageType !== 'jpeg' && imageType !== 'png') {
                        callback(`Unsupported image type: ${imageType}`);
                        return;
                    }

                    async.waterfall([
                        function download(next) {
                            s3.getObject({
                                Bucket: srcBucket,
                                Key: srcKey
                            }, next)
                        },
                        function transform(response,next) {
                            //console.log(response)
                            gm(response.Body).size({bufferStream: true},function(err, size) {
                                //console.log(err)
                                const scalingFactor = Math.min(MAX_WIDTH / size.width, MAX_HEIGHT / size.height)
                                const height = scalingFactor * size.height
                                const width = scalingFactor * size.width
                                this.resize(width, height).toBuffer(imageType,function (err, buffer){
                                    if (err) {
                                        next(err);
                                    } else {
                                        next(null, response.ContentType, buffer);
                                    }
                                }) 
                            })
                        },
                        function upload(contentType, data, next) {
                             // Stream the transformed image to a different S3 bucket.
                             s3.putObject({
                                    Bucket: dstBucket,
                                    Key: dstKey,
                                    Body: data,
                                    ContentType: contentType
                                }, function(err, data) {
                                    const href = this.request.httpRequest.endpoint.href;
                                    const photoUrl = href + dstBucket + '/' + encodeURIComponent(dstKey);
                                    //console.log(photoUrl)
                                    next(null, photoUrl)
                                });
                        }
                        ,function publish(photoUrl, next) {
                            const sns = new AWS.SNS({apiVersion: '2010-03-31', region: 'ap-southeast-2'});
                            var params = {
                                Message: `You can access your thumbnail at ${photoUrl}`,
                                Subject: 'Photo thumbnail is ready',
                                TopicArn: 'arn:aws:sns:ap-southeast-2:181630946722:NTRR_HTTPEndpoint_Topic'
                              };
                              sns.publish(params, next);
                        } 
                    ],function(err){
                        if (err) {
                            console.error(
                                'Unable to resize ' + srcBucket + '/' + srcKey +
                                ' and upload to ' + dstBucket + '/' + dstKey +
                                ' due to an error: ' + err
                            );
                        } else {
                            console.log(
                                'Successfully resized ' + srcBucket + '/' + srcKey +
                                ' and uploaded to ' + dstBucket + '/' + dstKey
                            );
                        }
                
                        //callback(null, "message");
                        handleSignOut()
                    })
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
    name: 'aws-lambda'
};
