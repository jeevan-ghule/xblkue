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
          throw Error('Cannot initialize with Log C+orelatrion Object(s)');
        }
        const payload = Payload.createPayload();
        if(_.isPlainObject(data)) {
          payload.add(data, cos[0]);
        } else {
          payload._addLcos(cos);
          payload._addData(data);
        }
        return queue.create(topic, { _payload: payload._serialize() });
      },
      process: (topic, fnc) => {
        const _process = (job, done) {
          const payload = Payload.createPayload(job._payload);
          job['payload'] = payload;
          delete job._payload;
          return fnc(job, done);
        } 
        return queue.process(topic, _process);
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
 