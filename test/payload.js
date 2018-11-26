const chai = require('chai'),
      expect = chai.expect,
      should = chai.should();
const Payload = require('../src/payload');

describe('PAYLOAD', function() {
  it('Check if object is creating', () => {
    const _payload = Payload.createPayload();
    _payload.should.be.an('object');
    _payload.should.respondTo('add');
    _payload.should.respondTo('lcos');
    _payload.should.respondTo('dataSet');
    _payload.should.not.respondTo('_serLcos');
    _payload.should.not.respondTo('_dserLcos');
  })
  it('Check if object is adding payload properly', () => {
    let _co0 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b010' }}
      _obj0 = { name: 'sourav', id:"1"}
    let _co1 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b023' }}
      _obj1 = { name: 'gourav', id:"2"}
    const _payload = Payload.createPayload();
    _payload.add(_obj0, _co0);
    _payload.add(_obj1, _co1);
    expect(_payload.lcos()).to.be.an('array');
    expect(_payload.lcos()).to.have.lengthOf(2);
    expect(_payload.dataSet()).to.be.an('array');
    expect(_payload.dataSet()).to.have.lengthOf(2);
  })
  it('add method should not add a collection', () => {
    let _co0 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b010' }}
      , _co1 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b023' }}
      , _objs = [{ name: 'sourav', id:"1" }, { name: 'gourav', id:"2" }];
    const _payload = Payload.createPayload();
    var isAdded = _payload.add(_objs, _co0, _co1);
    isAdded.should.be.false;
  })
  it('addCollection method should  add a collection', () => {
    let _co0 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b010' }}
      , _co1 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b023' }}
      , co = [_co0, _co1]
      , _objs = [{ name: 'sourav', id:"1" }, { name: 'gourav', id:"2" }];
    const _payload = Payload.createPayload();
    var isAdded = _payload.addCollection(_objs, ...co);
    isAdded.should.be.true;
    expect(_payload.lcos()).to.be.an('array');
    expect(_payload.lcos()).to.have.lengthOf(2);
    expect(_payload.data()).to.be.an('array');
    expect(_payload.data()).to.have.lengthOf(2);
  })
  it('addCollection method should not add an objecrt', () => {
    let _co0 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b010' }}
      , _obj0 = { name: 'sourav', id:"1" };
    const _payload = Payload.createPayload();
    var isAdded = _payload.addCollection(_obj0, _co0);
    isAdded.should.be.false;
  })
  it('add single object and check the output of single object get endpoints', () => {
    let _co0 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b010' }}
      , _obj0 = { name: 'sourav', id:"1" };
    const _payload = Payload.createPayload();
    var isAdded = _payload.add(_obj0, _co0);
    isAdded.should.be.true;
    expect(_payload.data()).not.to.be.an('array');
    expect(_payload.lco()).not.to.be.an('array');
  })
  it('Check if two payload objects are not interfering', () => {
    let _co0 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b010' }}
      _obj0 = { name: 'sourav', id:"1"}
    let _co1 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b023' }}
      _obj1 = { name: 'gourav', id:"2"}
    let _co2 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b025' }}
      _obj2 = { name: 'vaibhav', id:"3"}
    const _payload0 = Payload.createPayload(),
          _payload1 = Payload.createPayload();
    _payload0.add(_obj0, _co0);
    _payload1.add(_obj1, _co1);
    _payload0.add(_obj2, _co2);
    expect(_payload0.lcos()).to.be.an('array');
    expect(_payload0.lcos()).to.have.lengthOf(2);
    expect(_payload0.dataSet()).to.be.an('array');
    expect(_payload0.dataSet()).to.have.lengthOf(2);

    expect(_payload1.lcos()).to.be.an('array');
    expect(_payload1.lcos()).to.have.lengthOf(1);
    expect(_payload1.dataSet()).to.be.an('array');
    expect(_payload1.dataSet()).to.have.lengthOf(1);
  })
  it('Check if payload can reconstruct from another payloads', () => {
    let _co0 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b010' }}
      _obj0 = { name: 'sourav', id:"1"}
    let _co1 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b023' }}
      _obj1 = { name: 'gourav', id:"2"}
    let _co2 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b025' }}
      _obj2 = { name: 'vaibhav', id:"3"}
    const _payload0 = Payload.createPayload(),
          _payload1 = Payload.createPayload();
    _payload0.add(_obj0, _co0);
    _payload0.add(_obj2, _co2);
    expect(_payload0.lcos()).to.be.an('array');
    expect(_payload0.lcos()).to.have.lengthOf(2);
    expect(_payload0.dataSet()).to.be.an('array');
    expect(_payload0.dataSet()).to.have.lengthOf(2);

    _payload1.add(_obj1, _co1);
    expect(_payload1.lcos()).to.be.an('array');
    expect(_payload1.lcos()).to.have.lengthOf(1);
    expect(_payload1.dataSet()).to.be.an('array');
    expect(_payload1.dataSet()).to.have.lengthOf(1);

    _payload1._addData(_payload0.dataSet());
    _payload1._addLcos(_payload0.lcos());

    expect(_payload1.lcos()).to.be.an('array');
    expect(_payload1.lcos()).to.have.lengthOf(3);
    expect(_payload1.dataSet()).to.be.an('array');
    expect(_payload1.dataSet()).to.have.lengthOf(3);
  })
  it('Check getLco for objct', () => {
    let _co0 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b010' }}
      , _obj0 = { name: 'sourav', id:"1" };
    let _co1 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b023' }}
      , _obj1 = { name: 'gourav', id:"2" };
    let _co2 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b025' }}
      , _obj2 = { name: 'vaibhav', id:"3" };
    const _payload0 = Payload.createPayload();
    _payload0.add(_obj0, _co0);
    _payload0.add(_obj1,_co1);
    _payload0.add(_obj2,_co2);

    _payload0.dataSet().forEach(obj => {
      const _lco = _payload0.getLcoForObj(obj);
      _lco.should.be.an('object');
      expect(_lco.meta).to.be.an('object');
      expect(_lco.meta.coid).to.be.a('string'); 
    })
  })
  it('Check serialize payload', () => {
    let _co0 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b010' }}
      , _obj0 = { name: 'sourav', id:"1" };
    let _co1 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b023' }}
      , _obj1 = { name: 'gourav', id:"2" };
    let _co2 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b025' }}
      , _obj2 = { name: 'vaibhav', id:"3" };
    const _payload0 = Payload.createPayload();
    _payload0.add(_obj0, _co0);
    _payload0.add(_obj1,_co1);
    _payload0.add(_obj2,_co2);

    const _serializedPayload =_payload0._serialize();
    expect(_serializedPayload.lcos).to.be.an('string');
    expect(_serializedPayload.data).to.be.an('string');
  })
  it('Check deserialize payload', () => {
    let _co0 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b010' }}
      , _obj0 = { name: 'sourav', id:"1" };
    let _co1 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b023' }}
      , _obj1 = { name: 'gourav', id:"2" };
    let _co2 = { meta: { coid: '6085f97a-ba0a-454b-9ad5-a0f40bc8b025' }}
      , _obj2 = { name: 'vaibhav', id:"3" };
    const _payload0 = Payload.createPayload();
    _payload0.add(_obj0, _co0);
    _payload0.add(_obj1,_co1);
    _payload0.add(_obj2,_co2);

    const _serializedPayload =_payload0._serialize();
    const _payload1 = Payload.deserializePayload(null, _serializedPayload);

    _payload0.dataSet().forEach(obj => {
      expect(obj).to.be.an('object');
      const _lco = _payload0.getLcoForObj(obj);
      _lco.should.be.an('object');
      expect(_lco.meta).to.be.an('object');
      expect(_lco.meta.coid).to.be.a('string'); 
    })
  })
});