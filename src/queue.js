const kue = require('kue')
  , utils = require('./utils')
  , Payload  = require('./payload')
  , JobProx = require('./job')
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

        let sngData = _.isPlainObject(data) ? data: null;
        let sngLco =  _.isObject(cos) ? cos : null;
        let plurData = utils.isPlainArray(data) || utils.is2DArray(data) ? data : null;
        let plurCos = utils.isPlainArray(cos) ? cos : null;

        if(!!sngData && !!sngLco) {
          payload.add(data, cos);
        } else if(!!plurData && !!plurCos) {
          payload._addLcos(cos);
          payload._addData(data);
        } else {
          //gracefull failing
          let err;
          if(!sngData && !plurData) {
            err = new Error(`Data is not an object or plain array set, 
              cannot create job for topic: ${topic}`);
          } else if(!!sngData && !sngLco) {
            err = new Error(`Expecting LCO to be a singular object, 
              cannot create job for topic: ${topic}`);
          } else if(!!plurData && !plurCos) {
            err = new Error(`Expecting an aray of LCOs , 
              cannot create job for topic: ${topic}`);
          } else {
            err = new Error(`Cannot create job for topic: ${topic}`);
          }
          
          process.emitWarning('Cannot process the payload; will create an empty job');
          return JobProx(err);
        }
          
        let job =  queue.create(topic, { _payload: payload._serialize() });
        
          job.on('enqueue', function() {
            if(!!job) {
              logger(...payload.lcos()).info(`${topic} job has enqueued`,{ 
                job_id: job.id,
                topic,
                event:'enqueue',
                data: payload.data()
              });
              job = null;
            }
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
            event: 'start',
            data: payload.data()
          });

          job['data']['payload'] = payload;
          // delete job.data._payload;
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
