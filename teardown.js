module.exports = function() {
    
    global.__MONGOD__.stop()
      .then(() => console.log('Global Teardown mongod'))
      .catch(error => console.log(error))
  };