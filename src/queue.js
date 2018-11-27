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
            event:'enqueue',
            data: payload.data()
          });
          job = null;
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

        const _process = (job, _done) => {
          const payload = Payload.deserializePayload(_logger,job.data._payload)
          , done = (err, ...args) => {
            if(!!err) {
              logger(...payload.lcos()).error(err,`${topic} job has faild `,
              { 
                job_id: job.id,
                topic,
                event: 'failed',
                data: payload.data()
              });
            } else{
              logger(...payload.lcos()).info(`${topic} job has completed `,{ 
                job_id: job.id,
                topic,
                event: 'completed',
                data: payload.data(),
                results: args
              });
            }
            _done(err, ...args);
          }

          logger(...payload.lcos()).info(`${topic} job has started`,{ 
            job_id: job.id,
            topic,
            data: payload.data()
          });

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
