const AWS = require('aws-sdk')
const Config = AWS.Config
const CognitoIdentityCredentials = AWS.CognitoIdentityCredentials
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const CognitoUserAttribute= AmazonCognitoIdentity.CognitoUserAttribute;
const AuthenticationDetails= AmazonCognitoIdentity.AuthenticationDetails;
const CognitoUser = AmazonCognitoIdentity.CognitoUser;


const awsmobile = {
    aws_user_pools_id: 'ap-southeast-2_q50gPcEzi',
    aws_user_pools_web_client_id: '6r80v9ms18r3uij9a6l094c3mf',
    aws_cognito_identity_pool_id: 'ap-southeast-2:28d13886-e8cf-4b9e-92ce-a14ad4ffb968',
    aws_project_region: 'ap-southeast-2'
}

const userPool = new CognitoUserPool({
  UserPoolId: awsmobile.aws_user_pools_id,
  ClientId: awsmobile.aws_user_pools_web_client_id
});
let cognitoUser = null;

/**********************
 * Login methods *
 **********************/
function check(error) {
    const err = error.toString();
    if (/InvalidParameterException: Missing required parameter USERNAME$/.test(err)
    || (/UserNotFoundException?/.test(err))
    || (/NotAuthorizedException?/.test(err))) {
        return {
            invalidCredentialsMessage: 'Please enter valid username and Password.',
        }
    } else if (/CodeMismatchException: Invalid code or auth state for the user.$/.test(err)) {
        return {
            invalidCredentialsMessage: 'Invalid Verification Code',
        }
    } else if (/InvalidParameterException: Missing required parameter SMS_MFA_CODE$/.test(err)) {
        return {
            invalidCredentialsMessage: 'Verficiation code can not be empty',
        }
    }
}

const loginCallbackFactory = function(callbacks, ctx) {
    return {
        onSuccess: (result) => {
            //console.log('result: ', result);
            const loginCred = 'cognito-idp.' + awsmobile.aws_project_region + '.amazonaws.com/' + awsmobile.aws_user_pools_id;

            let credJson = {};
            let Login = {};

            Login[loginCred] = result.getIdToken().getJwtToken();
            //console.log(`Cognito Token ${Login[loginCred]}`)
            credJson['IdentityPoolId'] = awsmobile.aws_cognito_identity_pool_id;
            credJson['Logins'] = Login;

            AWS.config.credentials = new AWS.CognitoIdentityCredentials(credJson,{ region: 'ap-southeast-2',});

            AWS.config.credentials.get((error) => {
                if (error) {
                    console.error(error);
                    return;
                } 

                /*const { accessKeyId, secretAccessKey, sessionToken } = AWS.config.credentials;
                const awsCredentials = {
                    accessKeyId,
                    secretAccessKey,
                    sessionToken
                };
                sessionStorage.setItem('awsCredentials', JSON.stringify(awsCredentials));
                sessionStorage.setItem('isLoggedIn', true);*/

                callbacks.onSuccess.call(ctx, {
                    logInStatus: true,
                    verificationCode: ''
                });
            });
        },

        onFailure: (error) => {
            console.log(error.toString());
            let displayError = check(error);
            callbacks.onFailure.call(ctx, displayError);
        },

        newPasswordRequired: function(userAttributes, requiredAttributes) {
            console.log(`NEW PASSWORD REQUIRED`)
            // User was signed up by an admin and must provide new
            // password and required attributes, if any, to complete
            // authentication.

            // the api doesn't accept this field back
            delete userAttributes.email_verified;

            // Get these details and call
            cognitoUser.completeNewPasswordChallenge('P@ssword', userAttributes, this);
        }
    }
}

function handleSignIn(username, password, callbacks){
    const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password
    });
    cognitoUser = new CognitoUser({
        Username: username,
        Pool : userPool
    });

    cognitoUser.authenticateUser(authenticationDetails, callbacks);
}


/*****************
 * SignOut methods *
 *****************/
function handleSignOut(){
    const userPool = new CognitoUserPool({
        UserPoolId : awsmobile.aws_user_pools_id, // Your user pool id here
        ClientId :  awsmobile.aws_user_pools_web_client_id // Your client id here
    });
    const cognitoUser = userPool.getCurrentUser();
    cognitoUser.signOut();
    //sessionStorage.setItem('isLoggedIn', false);
}

module.exports = exports = {handleSignIn, loginCallbackFactory, handleSignOut};
 