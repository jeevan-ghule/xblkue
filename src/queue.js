const kue = require('kue')
  , utils = require('./utils')
  , Payload  = require('./payload')
  , _ = require('lodash');

module.exports.createQueue = (_logger=null, options={}) => {
  const logger = _logger,
    queue = kue.createQueue(options);

  return (cos) => {
    return {
      create: (topic, data) => {
        const payload = Payload.createPayload(_logger);
        if(_.isPlainObject(data) && _.isPlainObject(cos)) {
          payload.add(data, cos);
        } else if(utils.isPlainArray(data) && utils.isPlainArray(cos)) {
          payload._addLcos(cos);
          payload._addData(data);
        } else {
          //gracefull failing
          process.emitWarning('Cannot process the payload; will create an empty job');
          return queue.create(topic);
        }
          
        return queue.create(topic, { _payload: payload._serialize() });
      },
      process: (...args) => {
        if(args.length == 0){
          process.emitWarning('Cannot process the request');
          return;
        }
        const fnc = args[args.length -1]
          , topic = args[0];
        const _process = (job, done) => {
          const payload = Payload.deserializePayload(_logger,job.data._payload);
          job['data']['payload'] = payload;
          delete job.data._payload;
          return fnc(job, done);
        } 
        args[args.length -1] = _process;
        return queue.process(...args);
      },
      on: (...args) => {
        return queue.on(...args);
      },
      shutdown: (...args) => {
        return queue.shutdown(...args);
      }
    };
  }
} 
 