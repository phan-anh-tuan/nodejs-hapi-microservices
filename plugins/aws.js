    
            /***********************************************************************************************************
                get AWS Cognito OpenID Connect Token that client component can use to exchange for temporary credential
            ************************************************************************************************************/
            AWS.config.update({region: 'ap-southeast-2'});
            AWS.config.apiVersions = {
                cognitoidentity: '2014-06-30',
                // other service API versions
            };
            /*
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'ap-southeast-2:e6f7fca1-bdf4-45dd-b783-951e03fa6c43',
            });
            */

            const cognitoidentity = new AWS.CognitoIdentity();
            const identityPoolId = 'ap-southeast-2:e6f7fca1-bdf4-45dd-b783-951e03fa6c43';


            cognitoidentity.getId({ IdentityPoolId: identityPoolId,
                                    Logins: { 
                                        'NTRR': JSON.stringify({email: 'tuan.phananh@harveynash.com.au'})
                                    }    
                                }, function(err, data) {
                if (err) return console.log(err, err.stack); // an error occurred
                console.log(`plugins/login.js retVal from getId ${JSON.stringify(data)}`);
                cognitoidentity.getOpenIdToken({IdentityId: data.IdentityId}, function(_err, _data) {
                    if (_err) return console.log(_err, _err.stack); // an error occurred
                    console.log(`plugins/login.js retVal from getOpenIdToken ${JSON.stringify(_data)}`);
                    const params = {
                        DurationSeconds: 3600, 
                        RoleArn: 'arn:aws:iam::181630946722:role/NTRR_Manager',
                        RoleSessionName: 'ntrr', 
                        WebIdentityToken: _data.Token
                    };
                    var sts = new AWS.STS();
                    sts.assumeRoleWithWebIdentity(params, function(__err, __data) {
                        if (__err) return console.log(__err, __err.stack); // an error occurred
                        else  
                        console.log(`plugins/login.js retVal from assumeRoleWithWebIdentity ${JSON.stringify(__data)}`);
                        /*
                        var s3 = new AWS.S3({apiVersion: '2006-03-01', 
                                             accessKeyId: __data.Credentials.AccessKeyId,
                                            secretAccessKey: __data.Credentials.SecretAccessKey,
                                            sessionToken: __data.Credentials.SessionToken});
                        const _params = {
                            Body: 'this is from ntrr', 
                            Bucket: "ntrr", 
                            Key: "ntrr-hello"
                        };
                        s3.putObject(_params, function(_err_, _data_) {
                            if (_err_) return console.log(_err_, _err_.stack); // an error occurred
                            else  console.log(`plugins/login.js retVal from putObject ${JSON.stringify(_data_)}`);
                        });
                        */
                    });
                });
            });
            /*
            cognitoidentity.lookupDeveloperIdentity({
                IdentityPoolId: identityPoolId,
                IdentityId: 'ap-southeast-2:5b043d83-9d3c-40cc-8ae6-b9b483a62a4f',
                MaxResults: 10,
              }, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(`plugins/login.js retVal from lookupDeveloperIdentity ${JSON.stringify(data)}`);           // successful response
        });
        */
            /*
            const parameters = {
                IdentityPoolId:'ap-southeast-2:e6f7fca1-bdf4-45dd-b783-951e03fa6c43',
                Roles: {    authenticated: 'arn:aws:iam::181630946722:role/Cognito_NTRRidentitypoolAuth_Role',
                            unauthenticated:'arn:aws:iam::181630946722:role/Cognito_NTRRidentitypoolUnauth_Role'
                },
                RoleMappings: {
                    'cognito-identity.amazonaws.com': {
                        Type: 'Rules', 
                        AmbiguousRoleResolution: 'AuthenticatedRole',
                        RulesConfiguration: {
                            Rules: [ 
                                {
                                    Claim: 'email', 
                                    MatchType: 'Equals', 
                                    RoleARN: 'arn:aws:iam::181630946722:role/JavascriptSample', 
                                    Value: 'tuan.phananh@harveynash.com.au' 
                                }
                            ]
                        }
                    }
                }
            }
            cognitoidentity.setIdentityPoolRoles(parameters, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     console.log(data);           // successful response
            });
            cognitoidentity.getIdentityPoolRoles({IdentityPoolId: identityPoolId}, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     console.log(`plugins/login.js retVal from getIdentityPoolRoles ${JSON.stringify(data)}`);           // successful response
            });
            */
            var params = {
                IdentityPoolId: identityPoolId, /* required */
                Logins: { /* required */
                    'NTRR': JSON.stringify({id : request.pre.user._id,
                                            name: request.pre.user.name,
                                            email: request.pre.user.email,
                                            roles: request.pre.user.roles,
                                        }),
                },
                IdentityId: null 
            };
            cognitoidentity.getOpenIdTokenForDeveloperIdentity(params, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else {
                    console.log(`plugins/login.js retVal from getOpenIdTokenForDeveloperIdentity ${JSON.stringify(data)}`); 

                    const params = {
                        DurationSeconds: 3600, 
                        RoleArn: 'arn:aws:iam::181630946722:role/NTRR_Manager',
                        RoleSessionName: 'ntrr', 
                        WebIdentityToken: data.Token
                    };
                    var sts = new AWS.STS();
                    sts.assumeRoleWithWebIdentity(params, function(__err, __data) {
                        if (__err) return console.log(__err, __err.stack); // an error occurred
                        else  
                        console.log(`plugins/login.js retVal from assumeRoleWithWebIdentity ${JSON.stringify(__data)}`);
                        /*
                        var s3 = new AWS.S3({apiVersion: '2006-03-01', 
                                             accessKeyId: __data.Credentials.AccessKeyId,
                                            secretAccessKey: __data.Credentials.SecretAccessKey,
                                            sessionToken: __data.Credentials.SessionToken});
                        const _params = {
                            Body: 'this is from ntrr', 
                            Bucket: "ntrr", 
                            Key: "ntrr-hello"
                        };
                        s3.putObject(_params, function(_err_, _data_) {
                            if (_err_) return console.log(_err_, _err_.stack); // an error occurred
                            else  console.log(`plugins/login.js retVal from putObject ${JSON.stringify(_data_)}`);
                        });
                        */
                    });
                    /*
                    params = {
                        IdentityId: data.IdentityId, 
                        Logins: {
                            'cognito-identity.amazonaws.com': data.Token
                        }
                    };
*/


                    AWS.config.credentials = new AWS.CognitoIdentityCredentials({

                        // either IdentityPoolId or IdentityId is required
                        // See the IdentityPoolId param for AWS.CognitoIdentity.getID (linked below)
                        // See the IdentityId param for AWS.CognitoIdentity.getCredentialsForIdentity
                        // or AWS.CognitoIdentity.getOpenIdToken (linked below)
                            IdentityPoolId: identityPoolId,
                            IdentityId: data.IdentityId,
                            RoleARN: 'arn:aws:iam::181630946722:role/NTRR_Manager', 
                            // optional tokens, used for authenticated login
                            // See the Logins param for AWS.CognitoIdentity.getID (linked below)
                            Logins: {
                                'cognito-identity.amazonaws.com': data.Token
                            },
                        }, {
                        // optionally provide configuration to apply to the underlying service clients
                        // if configuration is not provided, then configuration will be pulled from AWS.config

                        // region should match the region your identity pool is located in
                        region: 'ap-southeast-2',

                        // specify timeout options
                        httpOptions: {
                            timeout: 100
                        }
                    });

/*
                    cognitoidentity.getCredentialsForIdentity(params, function(error, result) {
                        if (error) console.log(error, error.stack); // an error occurred
                        else     
                        {
                            const credentials = result.Credentials; 
*/
                            var albumBucketName = 'ntrr';
                            var s3 = new AWS.S3({
                                apiVersion: '2006-03-01',
                                params: {Bucket: albumBucketName},
//                                credentials: credentials
                            });
/*
                            s3.listObjects({Prefix: 'emails'}, function(_err, _data) {
                                if (_err) {
                                    return console.log(_err, _err.stack)
                                } else {
                                    console.log(`plugins/login.js retVal from s3.listObjects ${JSON.stringify(_data)}`)
                                }
                            })
*/
                            const _params = {
                                Body: 'this is from ntrr', 
                                Bucket: "ntrr", 
                                Key: "ntrr-hello"
                            };
                            s3.putObject(_params, function(_err_, _data_) {
                                if (_err_) return console.log(_err_, _err_.stack); // an error occurred
                                else  console.log(`plugins/login.js retVal from putObject ${JSON.stringify(_data_)}`);
                            });
/*                        }
                    });
  */
                }
            });
            
            
            /******
             * End AWS
             */