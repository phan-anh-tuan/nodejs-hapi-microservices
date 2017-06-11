'use strict';
const Code = require('code');
const Lab = require('lab');
const Server = require('../lib/index.js');

const lab = exports.lab = Lab.script();
const it = lab.test;
const describe = lab.experiment;
const afterEach = lab.afterEach;
const expect = Code.expect;

describe('Root Document', () =>{
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
});
