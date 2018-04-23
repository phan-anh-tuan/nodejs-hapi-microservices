import React from 'react';
import { mount, shallow } from 'enzyme';
//import {expect} from 'chai';
//import jest from 'jest';

import sinon from 'sinon'
import { MemoryRouter } from 'react-router'
var fetchMock = require('fetch-mock');
import { Provider } from 'react-redux'
import LoginForm from '../../../src/pages/login/components/login-form'
import {LoginForm as Login} from '../../../src/pages/login/components/login-form'
//import store from '../../../src/pages/login/store'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import renderer from 'react-test-renderer'
import FieldGroup from '../../../src/components/form/field-group'

const { configure } = require('enzyme');
const Adapter  = require('enzyme-adapter-react-15');
configure({ adapter: new Adapter() });

/****************************************************************************
 * This code snippet below initialize jsdom jest test environment.
 * jsdom based test environment is similar to browser based test environment
 * which is required for enzyme mount
 * By default Jest default test environment is jsdom however you can override 
 * this setting in package.json or in jest.config.js which is the case here
 ****************************************************************************/
const { JSDOM } = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .map(prop => Object.getOwnPropertyDescriptor(src, prop));
  Object.defineProperties(target, props);
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};

beforeAll(()=>
{
    copyProps(window, global);
})
/******************************************
 * end of jest test environment setting up
 * now you can use enzyme mount
 ******************************************/

describe('<LoginForm/>', function () {
  let _store;
  let wrapper;
  beforeEach(function(done){
        //this.server = sinon.createFakeServer();
        //this.xhr = sinon.useFakeXMLHttpRequest();
        //console.log(`xhr ${window.xhr}`)
        console.log('BeforeEach inside login-form.spec.js')
        fetchMock.mock('http://localhost:3000/api/login', { 'data': 'hello'});
        
        const middlewares = [thunk] // add your middlewares like `redux-thunk`
        const mockStore = configureStore(middlewares)
        _store = mockStore(
          {
            login: {
              loading: false,
              success: false,
              error: undefined,
              hasError: {},
              help: {}
            }
          })
        done();
  })
  
  afterEach(function(done){
        //this.server.restore();
        fetchMock.restore();
        if (wrapper.unmount) wrapper.unmount();
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

    //var xhr = sinon.spy(global.window, "XMLHttpRequest"); 
    //const wrapper = mount(<Provider store={store()}><MemoryRouter><LoginForm/></MemoryRouter></Provider>);
    wrapper = mount(<Provider store={_store}><MemoryRouter><LoginForm/></MemoryRouter></Provider>);
    expect(wrapper.find('button').length).toBe(1);
    wrapper.find('button').simulate('click');
    //expect(mockCallback.mock.calls.length).toBe(1);
    //expect(mockCallback.calledOnce).toBeTruthy()
    //expect(myMock.called()).to.be.true;
    //expect(fetchMock.called()).to.be.true;
    const actions = _store.getActions()
    console.log('actions',actions)
    //expect(actions[0].type).to.equal('LOGIN')
  });

  it('calls componentDidMount', function () {
    //sinon.spy(LoginForm.prototype, 'componentDidMount');
    const spy = jest.spyOn(LoginForm.prototype, 'componentDidMount');
    wrapper = mount(<Provider store={_store}><MemoryRouter><LoginForm/></MemoryRouter></Provider>);
    //expect(LoginForm.prototype.componentDidMount.calledOnce).toBeTruthy()   
    expect(spy).toHaveBeenCalled();
    spy.mockReset();
    spy.mockRestore();
  });

  it('+++capturing Snapshot of Home', () => {
    const mockCallback = jest.fn();
    const renderedValue =  renderer.create(<Provider store={_store}><MemoryRouter><LoginForm/></MemoryRouter></Provider>).toJSON()
    expect(renderedValue).toMatchSnapshot()
    //jest.expect(renderedValue).toMatchSnapshot();
  });
/*
  it('should have props for email and src', function () {
    const wrapper = shallow(<Avatar email='someone@example.com' src='http://placehold.it/200x200'/>);
    console.log(JSON.stringify(wrapper.props()))
    expect(wrapper.instance().props.email).to.be.a('string').that.equal('someone@example.com');
    expect(wrapper.instance().props.src).to.be.a('string').that.equal('http://placehold.it/200x200');
  });*/
});


describe('>>>L O G I N --- Shallow Render REACT COMPONENTS',()=>{
  let wrapper

  beforeEach(()=>{
    const mockCallback = jest.fn();
      wrapper = shallow(<Login/>)
  }) 

  it('+++ render the DUMB component', () => {
    
     //expect(wrapper.length).to.equal(1)
     //wrapper.children().forEach(node=> console.log(node.debug()))
     //expect(wrapper.find(FieldGroup).exists()).toBeTruthy();
     console.log('Login Form debug() ',wrapper.debug());
     console.log('FieldGroup html() ',wrapper.find(FieldGroup).at(0).html());
  });
  
});



