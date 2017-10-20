import React from 'react';
import { mount, shallow } from 'enzyme';
import {expect} from 'chai';
import sinon from 'sinon'
import { MemoryRouter } from 'react-router'
var fetchMock = require('fetch-mock');
import fetch from 'isomorphic-fetch'
//import { Provider } from 'react-redux'
import LoginForm from '../../../src/pages/login/components/login-form'
import store from '../../../src/pages/login/store'

describe('<LoginForm/>', function () {
  before('initiate fake sinon server', function(done){
        //this.server = sinon.createFakeServer();
        //this.xhr = sinon.useFakeXMLHttpRequest();
        //console.log(`xhr ${window.xhr}`)
        done();
  })
  after('shut down faked sinon server', function(done){
        //this.server.restore();
        done();
  })
  it('should call handleSubmit once', function () {
    /*this.server.respondWith("POST", "/api/login",
    [200, { "Content-Type": "application/json" },
     '{}']);*/
    
    //expect(store).to.be.a('function')
    //const _store = store();
    //console.log(JSON.stringify(_store))
    //console.log(_store)
    
    //var xhr = sinon.spy(global.window, "XMLHttpRequest"); 
    fetchMock.mock('*',500);
    const wrapper = mount(<MemoryRouter><LoginForm store={store()}/></MemoryRouter>);
    //console.log(global.window.XMLHttpRequest);
    //console.log(JSON.stringify(wrapper.find(LoginForm).instance().props))
    //wrapper.find(LoginForm).props().handleSubmit.to.be.a('function');
    wrapper.find(LoginForm).find('button').simulate('click');
    //this.server.respond();
    //sinon.assert.calledOnce(xhr); 
    //sinon.assert.calledOnce(fetchfn);
    //expect(wrapper.find('img')).to.have.length(1);
  });
/*
  it('should have props for email and src', function () {
    const wrapper = shallow(<Avatar email='someone@example.com' src='http://placehold.it/200x200'/>);
    console.log(JSON.stringify(wrapper.props()))
    expect(wrapper.instance().props.email).to.be.a('string').that.equal('someone@example.com');
    expect(wrapper.instance().props.src).to.be.a('string').that.equal('http://placehold.it/200x200');
  });*/
});