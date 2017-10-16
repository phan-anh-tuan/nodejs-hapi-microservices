'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const moment = require('moment');
const Server = require('../lib/index.js');
const expect = chai.expect;
let server;
let agent;

chai.use(chaiHttp);

const AccountName = 'Mocha'
const ResourceType = 'Javascript based unit test developer'
const ResourceRate = 1000
const Quantity = 1
const SubmissionDate = '2017-10-15'
const TentativeStartDate = '2017-10-15'
const FulfilmentDate = '2017-10-30'
const Status = 'Open'
const COMMENT = 'This is a comment'

before('Initiate Server and Authenticate user',function(done) {
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
        })
        .catch(function(error) {
            done(error)
        })
    });
   
});

after('Stop server and release resources',function(done) {
    // runs after all tests in this suite
    if (server) {
        server.stop(done);
        agent=null;
        server=null;
    } else {
        done();
    }
});

describe('******** Test Suite - Resource Requests *******', function() {
    let resource_request_id;
    beforeEach('should add a SINGLE resource request  on /api/resource/request POST',function(done) {
        agent.post('/api/resource/request')
        .type('form')
        .send({
          'accountName': AccountName,
          'resourceType': ResourceType,
          'resourceRate': ResourceRate,
          'quantity': Quantity,
          'submissionDate': SubmissionDate,
          'tentativeStartDate': TentativeStartDate,
          'fulfilmentDate': FulfilmentDate,
          'status': Status
        })
        .then(function(res){
            expect(res).to.have.status(200);
            resource_request_id = JSON.parse(res.text)
            expect(resource_request_id).to.be.an('string');
            done();
        })
        .catch(function(error) {
            done(error)
        })
    });
    
    it('should list ALL resource request on /api/resource/request GET', function(done){
        // The `agent` now has the sessionid cookie saved, and will send it back to the server in the next request:
        agent.get('/api/resource/request?year=2017&page=1')
        .then(function (res) {
            expect(res).to.have.status(200);
            const resource_requests = JSON.parse(res.text)
            expect(resource_requests).to.be.an('array');
            resource_requests.forEach(function(element,idx) {
                if (element._id === resource_request_id) done(); // this is based on assumption that the new resource request added in beforeEach will be appendded to list of resource request
            });
        })
        .catch(function(error) {
            done(error)
        });
    });

    it('should list a SINGLE resource request on /api/resource/request/{requestId} GET', function(done){
        agent.get(`/api/resource/request/${resource_request_id}`)
        .then(function(res){
            expect(res).to.have.status(200);
            const resource_request = JSON.parse(res.text)
            expect(resource_request).to.have.property('_id',resource_request_id);
            expect(resource_request).to.have.property('accountName',AccountName);
            expect(resource_request).to.have.property('resourceType',ResourceType);
            expect(resource_request).to.have.property('resourceRate',ResourceRate);
            expect(resource_request).to.have.property('quantity',Quantity);
            expect(resource_request).to.have.property('status',Status);
            done();
        })
        .catch(function(error) {
            done(error)
        })
    });

    it('should list ALL resource requests that satisfy the search team  on api/resource/request/search?term GET', function(done){
        agent.get(`/api/resource/request/search?term=mocha`)
        .then(function(res){
            let found = false;
            expect(res).to.have.status(200);
            const resource_requests = JSON.parse(res.text)
            expect(resource_requests).to.be.an('array')

            resource_requests.forEach(function(element,index) {
                console.log(`looping through ${JSON.stringify(element)}`)
                if (element.value === resource_request_id && element.label === `${AccountName} - ${Quantity} ${ResourceType}`) {
                    found = true;
                    done();
                }
            })
            if (!found) done(new Error('Can not find the request'));
        })
        .catch(function(error) {
            done(error)
        })
    })

    it('should update a SINGLE resource request on /api/resource/request PUT', function(done){
        agent.put('/api/resource/request')
        .send({
          '_id': resource_request_id,
          'accountName': AccountName.concat('changed'),
          'resourceType': ResourceType.concat('changed'),
          'resourceRate': ResourceRate + 1000,
          'quantity': Quantity + 1,
          'submissionDate': moment(SubmissionDate, "YYYY-MM-DD").add(7,'days').format("YYYY-MM-DD"),
          'tentativeStartDate': moment(TentativeStartDate, "YYYY-MM-DD").add(7,'days').format("YYYY-MM-DD"),
          'fulfilmentDate': moment(FulfilmentDate, "YYYY-MM-DD").add(7,'days').format("YYYY-MM-DD"),
          'status': Status.concat('changed')
        })
        .then(function(res){
            expect(res).to.have.status(200);
            const responseText = JSON.parse(res.text);
            expect(responseText.ok).to.equal(1);
            
            const resource_request = responseText.value
            expect(resource_request).to.have.property('_id',resource_request_id);
            expect(resource_request).to.have.property('accountName',AccountName.concat('changed'));
            expect(resource_request).to.have.property('resourceType',ResourceType.concat('changed'));
            expect(resource_request).to.have.property('resourceRate',ResourceRate + 1000);
            expect(resource_request).to.have.property('quantity',Quantity + 1);
            expect(resource_request).to.have.property('submissionDate').that.to.be.closeTo(moment(SubmissionDate, "YYYY-MM-DD").add(7,'days').valueOf(), 24*60*60*1000 - 1000); //23 hours, 59 minutes, 59 seconds
            expect(resource_request).to.have.property('tentativeStartDate').that.to.be.closeTo(moment(TentativeStartDate, "YYYY-MM-DD").add(7,'days').valueOf(), 24*60*60*1000 - 1000);
            expect(resource_request).to.have.property('fulfilmentDate').that.to.be.closeTo(moment(FulfilmentDate, "YYYY-MM-DD").add(7,'days').valueOf(), 24*60*60*1000 - 1000);
            expect(resource_request).to.have.property('status',Status.concat('changed'));

            done();
        })
        .catch(function(error) {
            done(error)
        })
    });

    it('should add a Comment to existing resource request on /api/resource/request/comment POST',function(done){
        agent.post('/api/resource/request/comment')
        .type('form')
        .send({
          '_id': resource_request_id,
          'text': COMMENT
        })
        .then(function(res){
            expect(res).to.have.status(200);
            const responseText = JSON.parse(res.text)
            const response = responseText.value
            expect(responseText).to.have.property('ok',1)
            expect(response).to.have.property('comments').that.to.be.an('array')
            expect(response).to.have.nested.property('comments[0].text',COMMENT)
            done();
        })
        .catch(function(error) {
            done(error)
        })
    });

    it('should close an existing resource request with comment on /api/resource/request/close POST',function(done){
        agent.post('/api/resource/request/close')
        .type('form')
        .send({
          '_id': resource_request_id,
          'text': COMMENT,
          'status': 'Close'
        })
        .then(function(res){
            expect(res).to.have.status(200);
            const responseText = JSON.parse(res.text)
            const response = responseText.value
            expect(responseText).to.have.property('ok',1)
            expect(response).to.have.property('comments').that.to.be.an('array')
            expect(response).to.have.property('status','Close')
            expect(response).to.have.property('_id',resource_request_id)
            expect(response).to.have.nested.property('comments[0].text',COMMENT)
            done();
        })
        .catch(function(error) {
            done(error)
        })
    });
    
    afterEach('should delete a SINGLE resource request on /api/resource/request/{requestId} DELETE',function(done){
        agent.delete(`/api/resource/request/${resource_request_id}`)
        .then(function(res){
            expect(res).to.have.status(200);
          
            const responseText = JSON.parse(res.text);
            expect(responseText.ok).to.equal(1);
       
            done();
        })
        .catch(function(error) {
            done(error)
        })
    });
});