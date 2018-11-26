const _serLcos = Symbol('_serLcos_')
  , _dserLcos = Symbol('_dserLcos_')
  , _ = require('lodash')
  , utils = require('./utils') ;

class Payload {
  constructor(_logger, _seralizedObject) {
    if(!!_seralizedObject) {
      this._deserialize(_seralizedObject);
    }
    this. _initialize();
    this._logger = _logger;
  }

  _initialize() {
    if(!this._lcos) {
      this._lcos = new Map();
    }
    if(!this._data) {
      this._data = new Array();
    }
  }

  _serialize() {
    const __lcos= this[_serLcos](this._lcos);
    const __data = JSON.stringify(this._data);
    return { lcos: __lcos, data: __data }
  }

  _deserialize(_seralizedObject) {
    if(!!_seralizedObject.lcos) {
      this._lcos = new Map(this[_dserLcos](_seralizedObject.lcos));
    }
    if(!!_seralizedObject.data) {
      this._data = Array.from(JSON.parse(_seralizedObject.data));
    }  
  }

  [_serLcos](__lcos) {
    let __lcosArr = [];
    __lcos.forEach((value, key) => { 
      __lcosArr.push([key,_logger.util().serialize(value)])
    });
    return JSON.stringify(__lcosArr);
  }

  [_dserLcos](__lcosStr) {
    let __lcosArr = JSON.parse(__lcosStr);
    return __lcosArr.map(([key,value]) => [key, _logger.util().deserialize(value)]);
  }

  add (obj, co)  {
    if(_.isPlainObject(obj)){
      this._lcos.set(co.meta.coid,co);
      obj['_corel_id_'] = co.meta.coid;
      this._data.push(obj);
      return true;
    }
    return false;
  }

  addCollection(collection, ...cos) {
    if(utils.isPlainArray(collection)
      && collection.length == cos.length) {
      collection.forEach( (obj,idx) => {
        this._lcos.set(cos[idx].meta.coid,cos[idx]);
        obj['_corel_id_'] = cos[idx].meta.coid;
      })
      this._data.push(collection);
      return true;
    }
    return false;
  }

  _addLcos(__lcos) {
    __lcos.forEach(co => {
       this._lcos.set(co.meta.coid,co);
    })
  }

  _addData(__data) {
    this._data = new Array( ...this._data, 
      ...__data.filter(obj => obj['_corel_id_'] !== undefined)
    )
  }

  getLcoForObj(obj) {
    if(obj['_corel_id_'] !== undefined) {
      return this._lcos.get(obj['_corel_id_']);
    }
    return;
  }

  lcos() {
    let __lcos = this._lcos.values();
    return  Array.from(__lcos);
  }

  dataSet() {
    return this._data;
  }

  lco() {
    let __data = this.data();
    if(!!__data) {
      return this.getLcoForObj(__data);
    }
    return;
  }

  data() {
    if(this._data.length > 0) {
      return this._data[0];
    }
    return;
  }
}

module.exports.createPayload = (_logger=null) => new Payload();
module.exports.deserializePayload = (_logger=null, _seralizedObject) => new Payload(_logger, _seralizedObject);