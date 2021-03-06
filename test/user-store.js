'use strict';
/*
describe('******** Test Suite - User Management *******', function() {
    const NAME = 'first last';
    const EMAIL = 'email@gmail.com';
    const USER_NAME = 'user_name';
    const PASSWORD = 'p@ssword'
    let user_id;
    beforeEach('should create a user', (done) => {
        agent.post('/api/signup')
        .type('form')
        .send({
          'name': NAME,
          'email': EMAIL,
          'username': USER_NAME,
          'password': PASSWORD
        })
        .then(function(res){
            expect(res).to.have.status(200);
            console.log(JSON.stringify(res))
            const responseText = JSON.parse(res.text)
            
            //expect(resource_request_id).to.be.an('string');
            done();
        })
        .catch(function(error) {
            done(error)
        })
    });
    it('should update an existing user', (done) => {
        
    });
    after('should delete an existing user', () => {
        
    });
});
*/
/*

const Server = require('../lib/index.js');
const UserStore = require('../plugins/user-store.js');

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const it = lab.test;
const describe = lab.experiment;
const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

let server;
describe('UserStore', () =>{
    before((done) => {
        Server((err, _server) => {
            if (err) { done(err); }
            server = _server;
            done();
        });
    });
    
    after((done) => { if (server) 
                      { 
                          server.stop(done); 
                      }
                    });
    it('retrive a user', { parallel: false },  
       (done) => {
                    let userDetails = {                                                                                firstname: "Tri", 
                                         lastname: "Phan", 
                                         occupation: "Student"
                                      };
                    UserStore._internals.createUser(userDetails, 
                                         (err, result) => {
                                            let userId = result;
                                            server.inject({
                                                            method: 'GET', 
                                                            url: `/user/${userId}`}, 
                                                            (res) => 
                                                            {
                                          Code.expect(res.result.firstname).to.equal('Tri');
                                          Code.expect(res.result.lastname).to.equal('Phan');
                                          Code.expect(res.result.occupation).to.equal('Student');
                                          UserStore._internals.deleteUser(userId,done);
                                        });
                    });
    });
    
    it('create a user', { parallel: false },  
       (done) => {
                    let userDetails = {                                                                                firstname: "Khoa", 
                                         lastname: "Phan", 
                                         occupation: "Student"
                                      };

                    server.inject({
                                    method: 'POST', 
                                    url: '/user',
                                    payload: userDetails
                                  }, 
                                    (res) => 
                                    {
                                      Code.expect(res.statusCode).to.equal(200);
                                      UserStore._internals.deleteUser(res.result,done);
                                      
                    });
    });
    
    
    it('delete a user', { parallel: false },  
       (done) => {
                        let userDetails = {                                                                            firstname: "Tri", 
                                             lastname: "Phan", 
                                             occupation: "Student"
                                          };
                        UserStore._internals.createUser(userDetails, 
                                             (err, result) => {
                                                let userId = result;
                                                server.inject({
                                                                method: 'DELETE', 
                                                                url: `/user/${userId}`}, 
                                                                (res) => 
                                                                {
                                              Code.expect(res.statusCode).to.equal(200);
                                              done();        
                                            });
                        });
        });
    
    it('update a user', { parallel: false },  
       (done) => {
                        let userDetails = {                                                                            firstname: "Tri", 
                                             lastname: "Phan", 
                                             occupation: "Student"
                                          };
                        UserStore._internals.createUser(userDetails, 
                                             (err, result) => {
                                                let userId = result;
                                                userDetails.id = userId;
                                                userDetails.firstname = 'Tuan';
                                                server.inject({
                                                                method: 'PUT', 
                                                                url: `/user`,
                                                                payload: userDetails
                                                              }, 
                                                                (res) => 
                                                                {
                                              Code.expect(res.statusCode).to.equal(200);
                                              UserStore._internals.getUser(userId,(err,result)=>{
                                                  Code.expect(result.firstname).to.equal('Tuan');
                                                  UserStore._internals.deleteUser(userId,done);
                                              });
                                              
                                            });
                        });
        });
});
*/