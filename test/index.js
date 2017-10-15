'use strict';
/*
//lab as test utility and code as assertion library

const Code = require('code');
const Lab = require('lab');
const Server = require('../lib/index.js');

const lab = exports.lab = Lab.script();
const it = lab.test;
const describe = lab.experiment;
const afterEach = lab.afterEach;
const expect = Code.expect;

describe('/', () =>{
    it('It will return Hello World', (done) => {
                        Server((err, server) => {
                            if (err) { done(err);}
                            server.inject('/', (res) => {
                            Code.expect(res.statusCode).to.equal(200);
                            Code.expect(res.result).to.equal('Hello World!');
                            server.stop(done);
                        });
                    });
    });
});*/


const chai = require('chai');
const chaiHttp = require('chai-http');
const Server = require('../lib/index.js');
const expect = chai.expect;
let server;
let agent;

chai.use(chaiHttp);

before(function(done) {
    // runs before all tests in this suite
    Server((err, _server) => {
        if (err) { done(err);}
        server = _server
        // Log in
        agent = chai.request.agent(server.listener)
        agent.post('/api/login')
        .send({ username: 'tuanphan', password: 'tuanphan' })
        .then(function (res) {
            expect(res).to.have.cookie('sid-ntrr');
            expect(res).to.have.status(200);
            done();
        });
    });
   
});

after(function(done) {
    // runs after all tests in this suite
    if (server) {
        server.stop(done);
        agent=null;
        server=null;
    } else {
        done();
    }

});

describe('Resource Requests', function() {
    it('should list ALL resource request on /api/resource/request GET', function(done){
        // The `agent` now has the sessionid cookie saved, and will send it back to the server in the next request:
        agent.get('/api/resource/request?year=2017&page=1')
        .then(function (res) {
            expect(res).to.have.status(200);
            done();
        });
    });
    it('should list a SINGLE blob on /blob/<id> GET');
    it('should add a SINGLE blob on /blobs POST');
    it('should update a SINGLE blob on /blob/<id> PUT');
    it('should delete a SINGLE blob on /blob/<id> DELETE');
  });