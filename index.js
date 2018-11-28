const Kue = require('./src/queue')
  , Payload = require('./src/payload')
  , assert = require('assert');

let logger;

module.exports = {
  init: (_logger=null) =>{
    if(!!_logger) {
      logger = _logger;
    }
  }, 
  Kue: (options={}) => {
    if(!logger) {
      assert(!!logger, 'xblkue not initialized');
    }
    return Kue.createQueue(logger, options);
  },
  Payload: (_serialized=null) => {
    if(!logger) {
      assert(!!logger, 'xblkue not initialized');
    }
    if(!!_serialized) {
      return Payload.deserializePayload(logger,_serialized);
    }
    return Payload.createPayload(logger);
  }
}
