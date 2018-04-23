const NodeEnvironment = require('jest-environment-node');
const {MongoClient} = require('mongodb');


class MongoEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    console.log('Setup Jest Test Environment');
            
    this.global.__MONGO_URI__ = await global.__MONGOD__.getConnectionString();
    this.global.__MONGO_DB_NAME__ = global.__MONGO_DB_NAME__;

    await super.setup();
    console.log(`Finish setting up Jest Test Environment, this.global.__MONGO_URI__URI ${this.global.__MONGO_URI__}`)
  }

  async teardown() {
    console.log('Teardown Jest Test Environment');

    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = MongoEnvironment;