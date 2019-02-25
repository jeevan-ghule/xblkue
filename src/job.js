class JobHandler  {
  get (target, prop, ...args) { 
    if(target[prop] === undefined && prop !== 'save'){
      return function()  {
        return this;
      };
    } else {
      return target[prop];
    }     
  }
};

module.exports = (err) => {
  let target = {
    save: (fnc) => {
      if(!! fnc) {
        return fnc(err)
      }
      throw err;
    }
  }
  return new Proxy(target, new JobHandler())
}; 