'use strict'
const _ = require('lodash');

module.exports = (context) => {
    //if (context.data.root.user.role && _.includes([context.data.root.user.role], 'admin')) {
    if (context.data.root.isAuthenticated) {
        return context.inverse(this); //always return false to disable chatbox at homepage
        //return context.fn(context.data.root)
    } 
    return context.inverse(this);
}