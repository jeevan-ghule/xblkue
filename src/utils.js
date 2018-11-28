const _ = require('lodash')

module.exports = {
  isPlainArray(array) {
    if(Array.isArray(array)) {
      const flatArray = _.flattenDepth(array,1);
      return flatArray.length == array.length;
    }
    return false;
  },
  is2DArray(array) {
    if(Array.isArray(array)) {
      const flatArray = _.flattenDepth(array,1);
      const flat2DArray = _.flattenDepth(array,2);
      return flatArray.length == flat2DArray.length;
    }
    return false;
  }
}
