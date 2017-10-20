import React from 'react';
import { mount, shallow } from 'enzyme';
import {expect} from 'chai';
import sinon from 'sinon'
import { MemoryRouter } from 'react-router'
var fetchMock = require('fetch-mock');
import 'whatwg-fetch'
//import { Provider } from 'react-redux'
import LoginForm from '../../../src/pages/login/components/login-form'
import store from '../../../src/pages/login/store'

describe('<LoginForm/>', function () {
  before('initiate fake sinon server', function(done){
        //this.server = sinon.createFakeServer();
        //this.xhr = sinon.useFakeXMLHttpRequest();
        //console.log(`xhr ${window.xhr}`)
        fetchMock.mock('http://localhost:3000/api/login', { 'data': 'hello'});
        done();
  })
  after('shut down faked sinon server', function(done){
        //this.server.restore();
        fetchMock.restore();
        done();
  })
  it('should call handleSubmit once', function () {
    /*this.server.respondWith("POST", "/api/login",
    [200, { "Content-Type": "application/json" },
     '{}']);*/

    //const myMock = fetchMock.sandbox().mock('http://localhost:3000/api/login', { 'data': 'hello'});


    //fetch('http://localhost:3000/api/login')
    //.then( response => response.json())
    //.then( data => console.log(data))
    //.catch( error => console.log(error))
    //expect(store).to.be.a('function')
    //const _store = store();
    //console.log(JSON.stringify(_store))
    //console.log(_store)
    
    //var xhr = sinon.spy(global.window, "XMLHttpRequest"); 
   
    const wrapper = mount(<MemoryRouter><LoginForm store={store()}/></MemoryRouter>);
    //console.log(global.window.XMLHttpRequest);
    //console.log(JSON.stringify(wrapper.find(LoginForm).instance().props))
    //wrapper.find(LoginForm).props().handleSubmit.to.be.a('function');
    wrapper.find(LoginForm).find('button').simulate('click');
    //expect(myMock.called()).to.be.true;
    expect(fetchMock.called()).to.be.true;
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