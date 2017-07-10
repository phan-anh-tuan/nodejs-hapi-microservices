'use strict'
const _ = require('lodash');

module.exports = (context) => {
    if (context.data.root.user.role && _.includes([context.data.root.user.role], 'admin')) {
        return context.fn(this);
    } 
    return context.inverse(this);
}