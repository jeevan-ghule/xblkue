const kue = require('kue')
  , utils = require('./utils')
  , Payload  = require('./payload')
  , _ = require('lodash')
  , assert = require('assert');

module.exports.createQueue = (_logger=null, options={}) => {
  const logger = _logger.logger(),
    queue = kue.createQueue(options);
  
  assert(!!logger, 'Logger not found');
  
  return (cos) => {
    return {
      create: (topic, data) => {
        const payload = Payload.createPayload(_logger);
        if(_.isPlainObject(data) && _.isObject(cos)) {
          payload.add(data, cos);
        } else if(utils.isPlainArray(data) && utils.isPlainArray(cos)) {
          payload._addLcos(cos);
          payload._addData(data);
        } else {
          //gracefull failing
          process.emitWarning('Cannot process the payload; will create an empty job');
          return queue.create(topic);
        }
          
        const job =  queue.create(topic, { _payload: payload._serialize() });
        job.on('enqueue', function() {
          logger(...payload.lcos()).info(`${topic} job has enqueued`,{ 
            job_id: job.id,
            topic,
            data: payload.data()
           })
        })
        return job;
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
      },

      getJob: (id,callback) => {
        return kue.Job.get(id,callback);
      },

      failed: (callback) => {
        return queue.failed(callback);
      },
    };
  }
} 
