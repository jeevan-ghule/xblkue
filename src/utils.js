const _ = require('lodash')

module.exports = {
  isPlainArray(array) {
    if(Array.isArray(array)) {
      const flatArray = _.flattenDepth(array,1);
      return flatArray.length == array.length;
    }
    return false;
  }
}
