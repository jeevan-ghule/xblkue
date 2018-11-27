const Kue = require('./src/queue')
  , Payload = require('./src/payload');

let logger;

module.exports = {
  init: (_logger=null) =>{
    if(!!logger) {
      logger = _logger;
    }
  }, 
  Kue: (options={}) => {
    if(!logger) {
      throw ('xblkue not initialized');
    }
    return Kue.createQueue(logger, options);
  },
  Payload: (_serialized=null) => {
    if(!logger) {
      throw ('xblkue not initialized');
    }
    if(!!_serialized) {
      return Payload.deserializePayload(logger,_serialized);
    }
    return Payload.createPayload(logger);
  }
}
