const kue = require('kue')
  , Payload  = require('./payload')
  , _ = require('lodash');

module.exports.createQueue = (_logger=null, options={}) => {
  const logger = _logger,
    queue = kue.createQueue(options);

  return (...cos) => {
    return {
      create: (topic, data) => {
        if(cos.length == 0) {
          throw Error('Cannot initialize with Log Corelatrion Object(s)');
        }
        const payload = Payload.createPayload(_logger);
        if(_.isPlainObject(data)) {
          payload.add(data, cos[0]);
        } else {
          payload._addLcos(cos);
          payload._addData(data);
        }
        const _queue =  queue.create(topic, { _payload: payload._serialize() });
        return _queue;
      },
      process: (...arg) => {
        if(arg.length == 0){
           throw Error('Cannot process the request');
        }
        const fnc = arg[arg.length -1]
          , topic =. args[0];
        const _process = (job, done) => {
          const payload = Payload.deserializePayload(_logger,job.data._payload);
          job['data']['payload'] = payload;
          delete job.data._payload;
          return fnc(job, done);
        } 
        arg[arg.length -1] = fnc;
        return queue.process(...arg);
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
 